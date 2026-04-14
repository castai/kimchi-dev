# Sandboxing

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) on macOS. Only your working directory and its subdirectories are shared with the host — everything else (`/tmp`, home directory, system paths) lives inside the sandbox. The network is proxied — HTTP/HTTPS goes through a policy-controlled proxy, non-HTTP protocols (raw TCP, UDP) are blocked entirely. The first run pulls the sandbox image and takes a while — subsequent runs start in seconds.

## Commands

### Run — create and enter a sandbox in one step

```sh
docker sandbox run shell .
```

### Create — named, persistent sandbox for ongoing work

```sh
docker sandbox create --name kimchi-debug shell .
```

### Exec — run a command inside an existing sandbox

```sh
docker sandbox exec kimchi-debug kimchi-code -p "your prompt"
```

### List — view all active sandboxes

```sh
docker sandbox ls
```

### Remove — permanently remove a sandbox and its internal data

```sh
docker sandbox rm kimchi-debug
```
