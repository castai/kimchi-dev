---
name: pi-mono-component
description: Find a reusable UI component library for pi-mono extensions
tags: [web-fetch, reasoning, tool-use]
---

## Prompt

I want to write a reusable UI component that I can use across extensions for pi-mono. Can you find me a project to fork or look into? Start from: https://github.com/qualisero/awesome-pi-agent.

## Expected Behaviour

### Must Have
- Uses web-fetch to browse the awesome-pi-agent list
- Identifies a suitable UI component project (e.g. pi-ds by zenobi-us)

### Nice to Have
- Provides concrete details: repository URL, NPM package name, key features
- Explains why the recommended project fits the use case (TUI design system, reusable layout components, TypeScript support)
- Gives actionable next steps (clone/fork command or how to use as a dependency)


### Example

- Uses web-fetch to collect recommendations; web-fetch produces walls of text, so the overall conversation is difficult to manage
- Highlights two sensible projects and deep dives into them to obtain a final list of recommendations
- Summarizes output with clear recommendations