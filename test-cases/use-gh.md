---
name: gh-private-repos
description: List private GitHub repositories using gh CLI
tags: [tool-use]
---

## Conversation

> user: List names of my private GitHub projects.

> user: How many of them do I have?

## Expected Behaviour

### Must Have
- Figures out that `gh` is installed on the local machine
- Runs an appropriate command to list private repositories
- Lists the repositories by name
- On follow-up, counts and reports the total number

## Example

- Knows it doesn't have access to my GitHub, but finds the tool and knows from memory how to use it
- Verifies `gh` is available and authenticated
- Incorrect about the number; gives an approximate response