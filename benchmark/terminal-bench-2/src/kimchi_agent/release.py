import hashlib
import re
import tarfile
from pathlib import Path
from types import TracebackType
from typing import Self

import httpx
from pydantic import BaseModel, Field

DEFAULT_CACHE_ROOT = Path.home() / ".cache" / "kimchi-bench" / "releases"
CHECKSUMS_ASSET = "checksums.txt"
BINARY_NAME = "kimchi"
# Release tarballs extract to a `bin/` + `share/kimchi/` layout (see release.yml: `tar -C dist bin share`).
# The compiled binary lives at bin/kimchi; it reads package.json, theme/, and export-html/ from share/kimchi/.
BINARY_RELPATH = Path("bin") / BINARY_NAME
SHARE_RELPATH = Path("share") / "kimchi"
_GITHUB_API = "https://api.github.com"


class ReleaseAsset(BaseModel):
    name: str
    browser_download_url: str
    size: int = 0


class Release(BaseModel):
    tag_name: str
    assets: list[ReleaseAsset] = Field(default_factory=list)

    def asset(self, name: str) -> ReleaseAsset:
        for a in self.assets:
            if a.name == name:
                return a
        raise LookupError(f"Release {self.tag_name} has no asset named {name!r}")


def asset_name_for_arch(arch: str) -> str:
    """Return the release tarball name for a normalized container arch.

    ``arch`` must be ``amd64`` or ``arm64`` (the naming scheme the release workflow uses).
    """
    if arch not in ("amd64", "arm64"):
        raise ValueError(f"Unsupported container arch {arch!r}; expected 'amd64' or 'arm64'")
    return f"kimchi_linux_{arch}.tar.gz"


def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def _parse_checksums(text: str) -> dict[str, str]:
    out: dict[str, str] = {}
    for line in text.splitlines():
        m = re.match(r"^([0-9a-fA-F]{64})\s+\*?(\S+)\s*$", line)
        if m:
            out[m.group(2)] = m.group(1).lower()
    return out


class GitHubClient:
    """Context-managed GitHub release client with a configurable cache directory.

    Holds an ``httpx.Client`` for the lifetime of the ``with`` block and reuses it across
    calls. Constructor takes the auth token and cache root explicitly so tests can drive
    the class without touching the host environment.
    """

    def __init__(self, token: str | None = None, cache_root: Path = DEFAULT_CACHE_ROOT) -> None:
        self._token = token
        self._cache_root = cache_root
        self._client: httpx.Client | None = None

    def __enter__(self) -> Self:
        self._client = httpx.Client(timeout=60.0, follow_redirects=True, headers=self._auth_headers())
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        if self._client is not None:
            self._client.close()
            self._client = None

    def _auth_headers(self) -> dict[str, str]:
        headers = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
        if self._token:
            headers["Authorization"] = f"Bearer {self._token}"
        return headers

    def _require_client(self) -> httpx.Client:
        if self._client is None:
            raise RuntimeError("GitHubClient must be used as a context manager")
        return self._client

    def resolve_latest(self, repo: str) -> Release:
        """Resolve the latest GitHub release for ``<owner>/<name>``."""
        url = f"{_GITHUB_API}/repos/{repo}/releases/latest"
        resp = self._require_client().get(url)
        resp.raise_for_status()
        return Release.model_validate(resp.json())

    def download_and_extract(self, release: Release, arch: str) -> Path:
        """Download + verify + extract the linux release tarball for ``arch``.

        Returns the path to the extracted **stage directory** — i.e. the tarball root,
        which contains ``bin/kimchi`` and ``share/kimchi/{package.json, theme/, export-html/}``.
        Callers upload this directory verbatim so the install layout in the container mirrors
        what the binary expects at runtime (see ``resolveAuxiliaryFilesDir`` in ``src/entry.ts``).

        Cached per ``(tag, arch)`` under ``<cache_root>/<tag>/<arch>/``; second call is a no-op.
        """
        tag_dir = self._cache_root / release.tag_name
        arch_dir = tag_dir / arch
        bin_path = arch_dir / BINARY_RELPATH
        if bin_path.is_file():
            return arch_dir

        asset_name = asset_name_for_arch(arch)
        tarball_asset = release.asset(asset_name)
        checksums_asset = release.asset(CHECKSUMS_ASSET)

        tag_dir.mkdir(parents=True, exist_ok=True)
        tarball_path = tag_dir / asset_name
        checksums_path = tag_dir / CHECKSUMS_ASSET

        self._download_to(tarball_asset.browser_download_url, tarball_path)
        self._download_to(checksums_asset.browser_download_url, checksums_path)

        expected = _parse_checksums(checksums_path.read_text()).get(asset_name)
        if not expected:
            raise RuntimeError(f"{CHECKSUMS_ASSET} for release {release.tag_name} is missing an entry for {asset_name}")
        actual = _sha256(tarball_path)
        if actual != expected:
            tarball_path.unlink(missing_ok=True)
            raise RuntimeError(f"sha256 mismatch for {asset_name}: expected {expected}, got {actual}")

        arch_dir.mkdir(parents=True, exist_ok=True)
        with tarfile.open(tarball_path, "r:gz") as tar:
            tar.extractall(arch_dir, filter="data")

        if not bin_path.is_file():
            raise RuntimeError(
                f"Extracted tarball {asset_name} does not contain {BINARY_RELPATH.as_posix()!r}"
            )
        share_marker = arch_dir / SHARE_RELPATH / "package.json"
        if not share_marker.is_file():
            raise RuntimeError(
                f"Extracted tarball {asset_name} is missing {SHARE_RELPATH.as_posix()}/package.json; "
                "the binary cannot run without its auxiliary files"
            )
        bin_path.chmod(0o755)
        return arch_dir

    def _download_to(self, url: str, dst: Path) -> None:
        dst.parent.mkdir(parents=True, exist_ok=True)
        tmp = dst.with_suffix(dst.suffix + ".part")
        try:
            with self._require_client().stream("GET", url) as resp:
                resp.raise_for_status()
                with tmp.open("wb") as f:
                    for chunk in resp.iter_bytes(chunk_size=1 << 16):
                        f.write(chunk)
            tmp.replace(dst)
        except BaseException:
            tmp.unlink(missing_ok=True)
            raise
