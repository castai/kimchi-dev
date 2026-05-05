#!/usr/bin/env bash
#
# Install the kimchi coding-harness CLI from the latest GitHub release.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/castai/kimchi/master/scripts/install.sh | bash
#
# Optional env:
#   KIMCHI_INSTALL_DIR  Override install dir. Defaults to /usr/local/bin if
#                      writable, else $HOME/.local/bin (with a PATH hint).
#   KIMCHI_VERSION      Pin a specific version tag (e.g. v0.2.0). Defaults
#                      to "latest", which resolves to the GitHub "Latest
#                      release" pointer.

set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m'

REPO="${KIMCHI_REPO_OVERRIDE:-castai/kimchi}"
VERSION="${KIMCHI_VERSION:-latest}"

echo -e "${BLUE}Installing Kimchi from ${REPO}${VERSION:+ (${VERSION})}…${NC}"

# Detect OS.
OS_RAW="$(uname -s | tr '[:upper:]' '[:lower:]')"
case "$OS_RAW" in
darwin*) OS="darwin" ;;
linux*) OS="linux" ;;
*)
	echo -e "${RED}Unsupported OS: $OS_RAW${NC}" >&2
	echo "Windows: download the .zip from https://github.com/${REPO}/releases" >&2
	exit 1
	;;
esac

# Detect architecture.
ARCH_RAW="$(uname -m)"
case "$ARCH_RAW" in
x86_64 | amd64) ARCH="amd64" ;;
aarch64 | arm64) ARCH="arm64" ;;
*)
	echo -e "${RED}Unsupported architecture: $ARCH_RAW${NC}" >&2
	exit 1
	;;
esac

# Resolve the download URL. For "latest" we use GitHub's redirect alias;
# for a pinned tag we go straight to the release.
if [ "$VERSION" = "latest" ]; then
	BINARY_URL="https://github.com/${REPO}/releases/latest/download/kimchi_${OS}_${ARCH}.tar.gz"
else
	BINARY_URL="https://github.com/${REPO}/releases/download/${VERSION}/kimchi_${OS}_${ARCH}.tar.gz"
fi

TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

echo -e "${BLUE}Downloading kimchi for ${OS}/${ARCH}…${NC}"
if ! curl -fsSL "$BINARY_URL" | tar -xzf - -C "$TEMP_DIR"; then
	echo -e "${RED}Failed to download kimchi from $BINARY_URL${NC}" >&2
	echo "Please check that the release exists at:" >&2
	echo "  https://github.com/${REPO}/releases" >&2
	exit 1
fi

# The release tarball contains a flat layout — just the binary at the root.
if [ ! -f "$TEMP_DIR/kimchi" ]; then
	echo -e "${RED}Archive did not contain a 'kimchi' binary.${NC}" >&2
	exit 1
fi
chmod +x "$TEMP_DIR/kimchi"

# Pick install dir. Allow override; otherwise prefer /usr/local/bin if we
# can write to it (system-wide install), else fall back to ~/.local/bin
# (user install) and remind the user to ensure it's on PATH.
if [ -n "${KIMCHI_INSTALL_DIR:-}" ]; then
	INSTALL_DIR="$KIMCHI_INSTALL_DIR"
	NEEDS_PATH_HINT="maybe"
elif [ -w /usr/local/bin ]; then
	INSTALL_DIR="/usr/local/bin"
	NEEDS_PATH_HINT="no"
else
	INSTALL_DIR="$HOME/.local/bin"
	NEEDS_PATH_HINT="yes"
fi

mkdir -p "$INSTALL_DIR"
INSTALL_PATH="$INSTALL_DIR/kimchi"
mv "$TEMP_DIR/kimchi" "$INSTALL_PATH"

echo ""
echo -e "${GREEN}✓ Installed kimchi to ${INSTALL_PATH}${NC}"

# PATH hint when we landed somewhere a fresh shell may not see.
if [ "$NEEDS_PATH_HINT" = "yes" ] || { [ "$NEEDS_PATH_HINT" = "maybe" ] && ! command -v kimchi >/dev/null 2>&1; }; then
	echo ""
	echo -e "${YELLOW}Note: ${INSTALL_DIR} may not be on your PATH.${NC}"
	case "${SHELL:-}" in
	*/fish*)
		echo "  Run: fish_add_path ${INSTALL_DIR}"
		;;
	*/zsh*)
		echo "  Run: echo 'export PATH=\"${INSTALL_DIR}:\$PATH\"' >> ~/.zshrc && source ~/.zshrc"
		;;
	*/bash*)
		# macOS bash sources .bash_profile for login shells; Linux uses .bashrc.
		case "$OS" in
		darwin) RC="$HOME/.bash_profile" ;;
		*) RC="$HOME/.bashrc" ;;
		esac
		echo "  Run: echo 'export PATH=\"${INSTALL_DIR}:\$PATH\"' >> ${RC} && source ${RC}"
		;;
	*)
		echo "  Add ${INSTALL_DIR} to your PATH in your shell's config file."
		;;
	esac
fi

echo ""
echo -e "${BLUE}Next:${NC} run ${GREEN}kimchi setup${NC} to configure your API key and tools,"
echo -e "      or just ${GREEN}kimchi${NC} to launch the coding harness."
