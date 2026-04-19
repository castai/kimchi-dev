import shlex
from pathlib import Path
from typing import TYPE_CHECKING, ClassVar

from harbor.agents.installed.base import (
    BaseInstalledAgent,
    CliFlag,
    with_prompt_template,
)
from pydantic import ValidationError

from kimchi_agent.config import KimchiAgentConfig
from kimchi_agent.messages import MessageEndEvent
from kimchi_agent.release import GitHubClient

if TYPE_CHECKING:
    from harbor.environments.base import BaseEnvironment
    from harbor.models.agent.context import AgentContext


INSTALL_DIR = "/installed-agent"
BINARY_PATH = f"{INSTALL_DIR}/kimchi-code"
UPLOAD_STAGE_DIR = "/tmp/kimchi-stage"


class KimchiCode(BaseInstalledAgent):
    """Harbor agent that runs the kimchi-code binary inside the task container.

    Binary source:
        1. If ``KIMCHI_CODE_BINARY`` is set on the host, that file is uploaded.
        2. Otherwise, the latest GitHub release from ``castai/kimchi-dev`` is
           downloaded, sha256-verified, and extracted on the host, then uploaded.

    Model routing is always via the Kimchi LLM gateway (``https://llm.kimchi.dev``) using ``KIMCHI_API_KEY``;
    no provider-specific keys are needed.
    """

    _OUTPUT_FILENAME = "kimchi.txt"

    CLI_FLAGS: ClassVar[list[CliFlag]] = [
        CliFlag(
            "thinking",
            cli="--thinking",
            type="enum",
            choices=["off", "minimal", "low", "medium", "high", "xhigh"],
        ),
        CliFlag("tools", cli="--tools", type="str"),
    ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._config = KimchiAgentConfig()

    @staticmethod
    def name() -> str:
        return "kimchi-code"

    def get_version_command(self) -> str | None:
        return f"{BINARY_PATH} --version"

    def parse_version(self, stdout: str) -> str:
        return stdout.strip().splitlines()[-1].strip()

    async def install(self, environment: BaseEnvironment) -> None:
        host_binary = await self._resolve_host_binary(environment)
        # Upload the binary's parent dir verbatim. For releases this contains
        # kimchi-code + package.json + theme/ (all needed at runtime by the bun
        # bundle); for local builds it's typically just the binary.
        await environment.upload_dir(source_dir=host_binary.parent, target_dir=UPLOAD_STAGE_DIR)
        await self.exec_as_root(
            environment,
            command=(
                f"mkdir -p {INSTALL_DIR} && "
                f"cp -a {shlex.quote(UPLOAD_STAGE_DIR)}/. {shlex.quote(INSTALL_DIR)}/ && "
                f"chmod 0755 {shlex.quote(BINARY_PATH)} && "
                f"rm -rf {shlex.quote(UPLOAD_STAGE_DIR)}"
            ),
        )

    async def _resolve_host_binary(self, environment: BaseEnvironment) -> Path:
        if self._config.binary_path is not None:
            return self._config.binary_path
        arch = await self._detect_container_arch(environment)
        with GitHubClient(token=self._config.github_token) as gh:
            release = gh.resolve_latest(self._config.github_repo)
            self.logger.info(
                "Fetching kimchi-code release",
                extra={"tag": release.tag_name, "arch": arch, "repo": self._config.github_repo},
            )
            return gh.download_and_extract(release, arch)

    async def _detect_container_arch(self, environment: BaseEnvironment) -> str:
        # Read e_machine (1 byte at offset 18) from /bin/sh's ELF header. uname -m reports
        # the kernel arch, which under Docker Desktop Rosetta on Apple Silicon is arm64
        # even when the userland is amd64. The dynamic loader only honors the userland
        # arch, so we read it directly from a binary that's guaranteed to exist.
        result = await self.exec_as_agent(environment, command="od -An -t x1 -j 18 -N 1 /bin/sh")
        e_machine = (result.stdout or "").strip().lower()
        match e_machine:
            case "3e":
                return "amd64"
            case "b7":
                return "arm64"
            case _:
                raise RuntimeError(
                    f"Unsupported container arch (ELF e_machine=0x{e_machine or '??'}); "
                    "kimchi-code release assets only cover amd64/arm64"
                )

    @with_prompt_template
    async def run(
        self,
        instruction: str,
        environment: BaseEnvironment,
        context: AgentContext,
    ) -> None:
        if not self.model_name:
            raise ValueError(
                "--model is required and must be qualified with a provider "
                "(e.g. kimchi-dev/kimi-k2.5, kimchi-dev/glm-5-fp8, kimchi-dev/minimax-m2.7)"
            )
        if "/" not in self.model_name:
            # kimchi-code's built-in pi-ai catalog also registers models like kimi-k2.5 under
            # the opencode provider. Without a qualifier the resolver may pick opencode and
            # fail auth with the kimchi key, so we force the caller to be explicit.
            raise ValueError(
                f"--model must be qualified as <provider>/<id> (got {self.model_name!r}); use e.g. kimchi-dev/kimi-k2.5"
            )

        cli_flags = self.build_cli_flags()
        if cli_flags:
            cli_flags += " "

        await self.exec_as_agent(
            environment,
            command=(
                f"{shlex.quote(BINARY_PATH)} "
                f"--print --mode json --no-session "
                f"--model {shlex.quote(self.model_name)} "
                f"{cli_flags}"
                f"{shlex.quote(instruction)} "
                f"2>&1 </dev/null | stdbuf -oL tee /logs/agent/{self._OUTPUT_FILENAME}"
            ),
            env={"KIMCHI_API_KEY": self._config.api_key},
        )

    def populate_context_post_run(self, context: AgentContext) -> None:
        output_file = self.logs_dir / self._OUTPUT_FILENAME
        if not output_file.exists():
            return

        total_input_tokens = 0
        total_output_tokens = 0
        total_cache_read_tokens = 0
        total_cost = 0.0

        for line in output_file.read_text().splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                event = MessageEndEvent.model_validate_json(line)
            except ValidationError:
                continue
            if event.type != "message_end" or event.message.role != "assistant":
                continue
            usage = event.message.usage
            total_input_tokens += usage.input
            total_output_tokens += usage.output
            total_cache_read_tokens += usage.cache_read
            total_cost += usage.cost.total

        context.n_input_tokens = total_input_tokens + total_cache_read_tokens
        context.n_output_tokens = total_output_tokens
        context.n_cache_tokens = total_cache_read_tokens
        context.cost_usd = total_cost if total_cost > 0 else None
