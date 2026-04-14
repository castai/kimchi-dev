---
name: pi-mono-tool-card
description: Implement a reusable TUI card component for rendering tool invocations in pi-mono
tags: [coding, tool-use]
---

## Prompt

I want to implement a component for pi-mono. The component will represent a tool invocation. It will be a box/card with the name of the tool, arguments passed to the tool, information about the number of tokens if available, and total time of running the tool. I want to stream text, but depending on the configuration of the component the text will either be expandable or scrollable. When collapsed the card shows a summary; when clicked to expand the user can scroll through the full tool output. This avoids the wall-of-text problem during LLM interactions.

Use pnpm and typescript.

Put all code in pi-mono-tool-card directory.

## Expected Behaviour

### Must Have
- Working TypeScript implementation, not just scaffolding — real component code with logic
- Uses pnpm as the package manager
- TypeScript types/interfaces are defined for the component props (tool name, arguments, token count, execution time, output text)
- Creates a reusable TUI component in the pi-mono extension structure
- The card displays: tool name, arguments, token count, and execution time
- Tool output text is contained within the card — no wall of text leaking into the main view
- Supports an expand/collapse interaction to reveal full output


### Example

- Searches locally for pi-mono
- Creates `package.json`
- Writes `tsconfig.json`
- Writes Card component
- Some tool calls are empty (`{}`); tool not found errors
- Coding produces wall of text
- Creates a React component that doesn't work in pi-mono
- Executed immediately instead of delegation; appeared to retry several times; consumed 30k tokens

**Suggestion:** introduce a limit on the number of tool calls — it got stuck.

<details>
<summary>Session metadata</summary>

```
/Users/mateusz.polnik/.config/kimchi/harness/sessions/--Users-mateusz.polnik-dev-cast-kimchi-dev--/2026-04-14T15-53-01-837Z_ab597f46-0aa2-4395-a587-3769b3e7bc51.jsonl
ID: ab597f46-0aa2-4395-a587-3769b3e7bc51

Messages
User: 1
Assistant: 30
Tool Calls: 39
Tool Results: 38
Total: 70

Tokens
Input: 476,346
Output: 34,673
Total: 511,019
```

</details>