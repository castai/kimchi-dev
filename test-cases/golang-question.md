---
name: golang-concurrency
description: Implement a Go concurrency exercise from a GitHub repository
tags: [coding, tool-use]
---

## Prompt

Implement this exercise: https://github.com/loong/go-concurrency-exercises/tree/main/5-session-cleaner. Place all code in golang-question directory.

## Expected Behaviour

### Must Have
- Use web-fetch to retrieve the exercise description and required files from the GitHub repository
- Write the implementation files to disk
- Execute tests with the `--race` flag to verify correctness and absence of data races

### Nice to Have
- Provide a summary of what was implemented and test results


### Example (Kimi k2.5)

- Uses web-fetch to collect files from the repo
- Writes implementation
- Runs `go test`
- Runs `go test` with `-race`
- Writes a summary
- The implementation is correct overall for the exercise. No graceful shutdown