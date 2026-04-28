# Task Definitions

Used across all sessions as consistent benchmarks.

---

## Task 1 — Simple coding: Go HTTP Rate Limiter Middleware

**Prompt:**
```
Implement a Go HTTP middleware that rate-limits requests per client IP using a token bucket algorithm.
Requirements:
- Each IP gets 10 requests per second
- Respond with HTTP 429 when limit is exceeded
- Thread-safe implementation
- Put the code in directory: rate-limiter/
- Include a README.md explaining usage
```

**Expected:** single subagent, light/standard model, <5 min, tests included, no external deps.

**Baseline (Claude):** token bucket via sync.Map + per-bucket mutex, cleanup goroutine, net.SplitHostPort for IP, map-based tests, no comments.

---

## Task 2 — Complex coding: Go REST API Task Management

**Prompt:**
```
Implement a Go REST API for a task management system.
Requirements:
- Use standard library only (no frameworks, no external dependencies)
- Layered architecture: handler -> service -> repository
- In-memory repository
- Endpoints: POST /tasks (create, fields: title+description), GET /tasks (list all), GET /tasks/{id} (get by id), PATCH /tasks/{id} (update status: todo/in-progress/done), DELETE /tasks/{id} (delete)
- Proper HTTP status codes and JSON responses
- Unit tests for the service layer using map-based test cases
- Put all code in directory: task-api/
```

**Expected:** plan phase (heavy model) + implementation phase (standard model), <10 min, clean layer separation, map-based tests, stdlib only.

**Baseline (Claude):** model.go, repository interface + in-memory impl, service with interface, handler with manual routing, atomic counter for IDs, map-based service tests, no external deps, no comments.

---

## Task 3 — Research query: Most popular Go HTTP router libraries

**Prompt:**
```
What are the most popular third-party HTTP router libraries for Go?
List the top 3 with: GitHub stars (approximate), key differentiators, and a one-line example of defining a route with a path parameter.
```

**Expected:** orchestrator answers directly without spawning subagents (it has web-search available), fast (<1 min), concise response, no code written.

**Baseline (Claude):**
1. **gorilla/mux** (~21k stars) — feature-rich, regex routes, middleware. `r.HandleFunc("/users/{id}", handler)`
2. **go-chi/chi** (~18k stars) — lightweight, idiomatic, composable middleware. `r.Get("/users/{id}", handler)`
3. **julienschmidt/httprouter** (~16k stars) — minimal, fastest, explicit method routing. `router.GET("/users/:id", handler)`

---
