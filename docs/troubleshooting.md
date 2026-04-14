# Troubleshooting

## Reproducing issues

The fastest way to reproduce a bug is a non-interactive one-liner. Pin the model so the same provider/model combination is used every time:

```sh
kimchi-code -p "your prompt here" --provider kimchi-dev --model kimi-k2.5
```

Add `--no-session` to run without loading or saving session state — this ensures a clean slate:

```sh
kimchi-code -p "your prompt" --no-session --provider kimchi-dev --model kimi-k2.5
```

## Capturing diagnostic output

### JSON event stream

Run with `--mode json` to get a machine-readable stream of every event (tool calls, model responses, errors):

```sh
kimchi-code --mode json -p "your prompt" --no-session --provider kimchi-dev --model kimi-k2.5 > events.jsonl
```

Each line in `events.jsonl` is a JSON object. This is the most detailed trace available.

### Enriched prompts

Use `--debug-prompts` to see the full prompt after orchestration enrichment (model capabilities, available models injected):

```sh
kimchi-code -p "your prompt" --debug-prompts --provider kimchi-dev --model kimi-k2.5
```

### Verbose startup

Use `--verbose` to see model scope and startup diagnostics:

```sh
kimchi-code --verbose -p "your prompt" --provider kimchi-dev --model kimi-k2.5
```

## Isolating the problem

### Disable extensions

If you suspect an extension is causing the issue, disable all of them:

```sh
kimchi-code -p "your prompt" --no-extensions --provider kimchi-dev --model kimi-k2.5
```

Similarly, `--no-skills` and `--no-prompt-templates` disable those resource types.

### Restrict tools

Limit which tools the agent can use to narrow down a misbehaving tool:

```sh
# Only allow read and bash
kimchi-code -p "your prompt" --tools read,bash --provider kimchi-dev --model kimi-k2.5

# Disable all tools
kimchi-code -p "your prompt" --no-tools --provider kimchi-dev --model kimi-k2.5
```

Available tools: `read`, `bash`, `edit`, `write`, `grep`, `find`, `ls`

## Inspecting sessions

### Session file location

Session files are stored as JSONL at:

```
~/.config/kimchi/harness/sessions/<encoded-cwd>/<session-id>.jsonl
```

### Exporting a session to HTML

Convert a session file to a shareable HTML page:

```sh
kimchi-code --export ~/.config/kimchi/harness/sessions/--path--/session.jsonl
# or specify an output path
kimchi-code --export session.jsonl output.html
```

### Resuming a session

Continue the most recent session in the current directory:

```sh
kimchi-code --continue
```

Resume a specific session by path or ID prefix:

```sh
kimchi-code --session <path-or-id-prefix>
```

Browse and select from past sessions interactively:

```sh
kimchi-code --resume
```

## Checking available models

List all models the harness can see:

```sh
kimchi-code --list-models
```

Search for a specific model:

```sh
kimchi-code --list-models kimi
```

## Version

```sh
kimchi-code --version
```
