---
name: python-fastapi-project
description: Scaffold a Python project with uv, FastAPI, and a health endpoint
tags: [coding, tool-use]
---

## Prompt

Implement me a Python project using uv, Python 3.14, and FastAPI. There should be one endpoint /healthz that responds with 200. I want to run this with `uv run app`. Put source code in directory: python-fastapi-project.

## Expected Behaviour

### Must Have
- Create the project in the `example/` directory
- Use `uv` for project initialisation and dependency management
- Set up FastAPI with a single `/healthz` endpoint returning 200
- Ensure the app is runnable via `uv run app`
- Write all necessary files (pyproject.toml, source files, etc.)

### Example

- Considered easy and implemented in one go
- The project directory structure is wrong: code lives at `example/` instead of `example/python-fastapi-project/`
- Redundant nested `example/example/main.py` with duplicate code that serves no purpose — looks like `uv init` created a default package structure and then `app.py` was added at the root separately