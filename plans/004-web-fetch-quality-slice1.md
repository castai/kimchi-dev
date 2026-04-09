# Plan: Slice 1 — Fix cache content corruption and unsafe error cast

## Context

The web-fetch extension has a bug at `execute-handler.ts:103` where `output.replace("Cache: miss", "Cache: hit")` operates on the full output including page body. If a fetched page contains the literal string "Cache: miss", the cached version gets corrupted. Separately, line 59 does `err as FetchError` without an `instanceof` check, which will fail silently on non-FetchError exceptions. This slice fixes both issues.

---

## Changes

### 1. Fix cache corruption — build output with correct cache status directly

**File: `extensions/web-fetch/execute-handler.ts`**

- Extract a helper function `buildOutput(metadataLines, content, truncationNotice)` that joins metadata lines and assembles the final string: `metadata + "\n\n" + content + truncationNotice`.
- After the metadata `lines` array is built (lines 83-94), produce two outputs:
  - `output` — uses `lines` as-is (contains `Cache: miss`) for the immediate return
  - `cachedOutput` — uses a copy of `lines` with `Cache: miss` replaced by `Cache: hit` at the array level (swap the specific array element, not a string replace on the body)
- Pass `cachedOutput` to `cacheSet()` at line 103 instead of doing `.replace()` on the full string.
- Remove the `.replace("Cache: miss", "Cache: hit")` call entirely.

### 2. Fix unsafe error cast

**File: `extensions/web-fetch/execute-handler.ts`**

- Change the import of `FetchError` from `type` import to a value import (currently `import { type FetchError, fetchPage }` — change to `import { FetchError, fetchPage }`).
- Replace line 59 (`const fetchErr = err as FetchError`) with proper type narrowing:
  ```typescript
  const message = err instanceof FetchError ? err.message
    : err instanceof Error ? err.message
    : String(err);
  ```
- Use `message` directly in the error return on line 61.

### 3. Extract `EMPTY_DETAILS` constant

**File: `extensions/web-fetch/execute-handler.ts`**

- Add `const EMPTY_DETAILS = {} as Record<string, never>;` near the top (after the constants).
- Replace all 4 instances of `details: {} as Record<string, never>` (lines 41, 50, 62, 107) with `details: EMPTY_DETAILS`.

### 4. Add tests

**File: `extensions/web-fetch/execute-handler.test.ts`**

- **Test: page body containing "Cache: miss" is not corrupted in cache.** Mock `fetchPage` to return a body containing the literal string `"Cache: miss"`. Assert that `cacheSet` is called with output that still contains `"Cache: miss"` in the body section (i.e., the body was not modified), and that the metadata section says `"Cache: hit"`.

- **Test: non-FetchError thrown by fetchPage produces readable error message.** Mock `fetchPage` to reject with a plain `Error("connection refused")`. Assert the result text contains `"Error: connection refused"`. Add a second case where `fetchPage` rejects with a string `"something broke"` — assert the result text contains `"Error: something broke"`.

---

## Verification

1. `cd extensions/web-fetch && npx vitest run` — all tests pass (existing + new)
2. Inspect that no `.replace("Cache: miss", "Cache: hit")` call remains in execute-handler.ts
