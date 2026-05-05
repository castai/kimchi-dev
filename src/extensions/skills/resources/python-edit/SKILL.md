---
name: python-edit
description: Validate Python syntax via AST after editing or creating .py files. Use when writing or modifying any Python source file (.py) with Edit, Write, or NotebookEdit, including new file creation.
user-invocable: false
---

# Python Edit

After every Edit, Write, or NotebookEdit to a `.py` file (or a Jupyter code cell), verify the file parses with `ast.parse`. Catches typos, unbalanced brackets, bad indentation before they reach the user.

## When to validate

- After Write creates a new `.py` file.
- After Edit modifies an existing `.py` file.
- After NotebookEdit on a code cell (validate the cell source).
- Multi-step edits to the same file: validate after each Edit, not just the last.

Skip for: non-Python files, pure deletions of empty/comment lines, .pyi stubs (still parseable, but optional).

## How to validate

Run via Bash:

```
python3 -c "import ast, sys; ast.parse(open(sys.argv[1]).read())" <path>
```

Exit 0 = OK. Non-zero prints a `SyntaxError` with line/col.

For notebook cells, write the cell source to a temp file first, or pipe via stdin:

```
python3 -c "import ast, sys; ast.parse(sys.stdin.read())" <<'PY'
<cell source>
PY
```

## On error

1. Read the SyntaxError — note file, line, column, message.
2. Re-read the offending region in the file.
3. Fix the root cause with another Edit. Don't paper over it (don't comment out the line, don't wrap in try/except).
4. Re-validate. Repeat until clean.
5. If three attempts fail, stop and report the error to the user instead of guessing further.

## Don'ts

- Don't skip validation because the edit "looks fine".
- Don't run the file (`python3 file.py`) — that executes side effects. `ast.parse` is parse-only.
- Don't validate with `py_compile` — it writes `.pyc` artifacts.
- Don't suppress the error and continue with other edits.
