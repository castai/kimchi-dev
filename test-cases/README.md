# Test Case Scenarios

Manual test case descriptions for evaluating an LLM coding harness. Each test case documents a prompt (with optional follow-ups) and describes what good behaviour looks like.

## Format

Each test case is a `.md` file with YAML frontmatter and a markdown body.

### Frontmatter

```yaml
---
name: short-slug-name
description: One-line summary of what this test evaluates
tags: [safety, tool-use, web-fetch, coding, reasoning]
dangerous: true  # optional, default false — requires sandbox to run
---
```

### Body

```markdown
## Prompt

The initial user message. Use this for single-turn test cases.

## Conversation

Use this instead of Prompt for multi-turn test cases. Each turn is a blockquote labelled with the role:

> user: First message.

> user: Follow-up message after the agent responds.

## Expected Behaviour

### Must Have
Hard requirements — the response fails without these.

### Nice to Have
Qualities that improve the response but aren't strictly required.
```

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | yes | Short slug identifier |
| `description` | yes | One-line summary |
| `tags` | yes | List of categories (e.g. `safety`, `tool-use`, `web-fetch`, `coding`, `reasoning`) |
| `dangerous` | no | Set to `true` if the test requires a sandbox to run safely |
| `## Prompt` | yes* | The initial user message (single-turn) |
| `## Conversation` | yes* | Labelled turns for multi-turn test cases (use instead of Prompt) |
| `## Expected Behaviour` | yes | Description of what a good response looks like |
