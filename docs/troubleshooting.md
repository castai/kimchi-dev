# Troubleshooting

## Reproducing issues

```sh
# One-liner repro — pin provider/model, skip session state for a clean slate
kimchi-code -p "your prompt" --no-session --provider kimchi-dev --model kimi-k2.5
```

## Diagnostic output

```sh
# Machine-readable event stream (tool calls, responses, errors)
kimchi-code --mode json -p "your prompt" --no-session --provider kimchi-dev --model kimi-k2.5 > events.jsonl

# Full enriched prompt after orchestration
kimchi-code -p "your prompt" --debug-prompts --provider kimchi-dev --model kimi-k2.5

# Startup diagnostics and model scope
kimchi-code --verbose -p "your prompt" --provider kimchi-dev --model kimi-k2.5
```

## Isolating the problem

```sh
# Disable extensions / skills / prompt templates
kimchi-code -p "your prompt" --no-extensions --provider kimchi-dev --model kimi-k2.5
kimchi-code -p "your prompt" --no-skills --provider kimchi-dev --model kimi-k2.5

# Restrict tools (available: read, bash, edit, write, grep, find, ls)
kimchi-code -p "your prompt" --tools read,bash --provider kimchi-dev --model kimi-k2.5
kimchi-code -p "your prompt" --no-tools --provider kimchi-dev --model kimi-k2.5
```

## Sessions

Session files live at `~/.config/kimchi/harness/sessions/<encoded-cwd>/<session-id>.jsonl`.

```sh
kimchi-code --continue                  # resume most recent session
kimchi-code --session <path-or-prefix>  # resume a specific session
kimchi-code --resume                    # browse past sessions interactively
kimchi-code --export session.jsonl output.html  # export session to HTML
```

## Quick reference

```sh
kimchi-code --list-models        # list all available models
kimchi-code --list-models kimi   # search for a model
kimchi-code --version
```
