---
name: git-hygiene
description: Use when running `git add`, `git commit`, `git push`, creating commits, opening PRs, or writing commit messages or PR descriptions.
user-invocable: false
---

# Git Hygiene

Apply on every commit, PR, and push.

## Stage only what belongs to this change

Before `git add`, decide which files are part of the change *the user asked for in this conversation*. Don't stage anything else.

Don't stage:

- Files unrelated to the current task (incidental edits, debug prints, drive-by refactors).
- Files modified *before* this conversation started — they're the user's in-progress work, not yours to commit.
- Plan/scratch files (`plans/*.md`, design notes, TODO scratchpads) unless the user explicitly asked to commit them.
- Build artifacts, logs, lockfile churn unrelated to a dependency change, anything matching `.env*` / credentials.

How to decide:

1. Run `git status` and `git diff` to see what's changed.
2. For each path: did this conversation modify it *for this task*? If yes → stage. If no → leave. If unsure → ask.
3. Stage by explicit path: `git add path/to/file`.

**Never `git add -A` or `git add .`** — both sweep up everything in step 2's "no" and "unsure" piles.

If the user says "commit everything" or names files explicitly, follow that. Still warn before staging obvious junk (secrets, large binaries, build output).

## No LLM or harness attribution

Don't add lines like:

- `Co-Authored-By: Claude …` / `Co-Authored-By: <any model>`
- `🤖 Generated with Claude Code` (or any tool tagline)
- "Written with the help of …", "AI-assisted", etc.
- Tool/model names in commit bodies, PR descriptions, or code comments.

Attribution to a tool is noise that pollutes `git log`, `git blame`, review threads, and code comments.

Applies to: `git commit` messages and bodies, `gh pr create` / `glab mr create` titles and descriptions, code comments and docstrings, generated docs.

Exception: add attribution only if the user explicitly asks for it in this conversation.

## Don't push to protected branches

Don't `git push` to `main` or `master` (or any branch the repo treats as protected — release branches, `develop`, etc.). Work on a feature branch, open a PR/MR.

Before any push, check the branch:

```
git rev-parse --abbrev-ref HEAD
```

If `HEAD` is on a protected branch and the upstream tracks it: stop, surface the branch, propose `git checkout -b <name>` first. Don't push and ask forgiveness.

`git push --force` / `--force-with-lease` to a protected branch is off-limits even with general consent — require an explicit, destructive-intent request from the user. Same spirit applies to `gh pr merge` / `glab mr merge` into protected branches (covered by the gh-cli/glab-cli consent lists).

## When in doubt, ask

One short clarifying question beats an unwanted commit. Examples:

- "`notes.md` is modified — include in this commit, or leave it?"
- "Stage `package-lock.json` along with the dependency bump?"
- "I see uncommitted changes in `src/legacy/` from before this session — leave them alone, right?"
