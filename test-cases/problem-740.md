---
name: euler-740
description: Implement Project Euler problem 740 in Go — tests agent resilience under difficulty
tags: [coding, reasoning]
---

## Prompt

Can you implement the coding problem in Go: https://projecteuler.net/problem=740. Put project in the directory euler-750.

## Expected Behaviour

### Must Have
- Fetches the problem description successfully via web-fetch
- Writes a working Go implementation
- Does not get stuck in retry loops on tool errors — if a tool call fails, the agent should adapt rather than repeating the same failing call
- Keeps token usage reasonable (well under 300k tokens)

### Nice to Have
- Explains its approach before or alongside the implementation, especially for mathematically complex parts
