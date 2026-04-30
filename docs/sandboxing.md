# Sandboxing

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) on macOS. The sandbox runs Linux — the standard macOS binary will not work inside it.

Build a Linux binary first from the kimchi-dev project root:

```sh
pnpm run build:binary-linux-arm64   # Apple Silicon (M1/M2/M3/M4)
pnpm run build:binary-linux-x64     # Intel Mac or x86-64 Linux host
```

Then start the sandbox from the kimchi-dev directory so `dist/kimchi` is available inside it.

Only your working directory and its subdirectories are shared with the host — everything else (`/tmp`, home directory, system paths) lives inside the sandbox. The network is proxied — HTTP/HTTPS goes through a policy-controlled proxy, non-HTTP protocols (raw TCP, UDP) are blocked entirely. The first run pulls the sandbox image and takes a while — subsequent runs start in seconds.

## Commands

### Quick start

Both steps run in the same terminal:

```sh
# 1. Create a named sandbox (shell = agent type, . = workspace to mount)
docker sandbox create --name kimchi-sandbox shell .

# 2. Launch kimchi with the API key (-w sets the working directory to the mounted workspace)
docker sandbox exec -it -e KIMCHI_API_KEY -w "$(pwd)" kimchi-sandbox ./dist/kimchi --provider kimchi-dev --model kimi-k2.5
```

### Run — create and enter a sandbox in one step

```sh
docker sandbox run shell .
```

This opens an interactive shell inside the sandbox, but **environment variables from the host are not forwarded** — `KIMCHI_API_KEY` and other secrets will not be available. To pass env vars, use `exec -e` on a running sandbox instead (see below).

### Create — named, persistent sandbox for ongoing work

```sh
docker sandbox create --name kimchi-sandbox shell .
```

### Exec — run a command inside an existing sandbox

Only `exec` supports forwarding host environment variables with `-e`:

```sh
# Forward KIMCHI_API_KEY from the host and run kimchi
docker sandbox exec -it -e KIMCHI_API_KEY -w "$(pwd)" kimchi-sandbox ./dist/kimchi -p "your prompt"

# Interactive shell with the API key available
docker sandbox exec -it -e KIMCHI_API_KEY -w "$(pwd)" kimchi-sandbox bash
```

### List — view all active sandboxes

```sh
docker sandbox ls
```

### Remove — permanently remove a sandbox and its internal data

```sh
docker sandbox rm kimchi-sandbox
```
