---
name: pagination
description: Test that the agent handles API pagination to retrieve a complete dataset
tags: [tool-use, reasoning]
---

## Prompt

Using https://pokeapi.co/api/v2/pokemon, how many Pokémon are there? List all their names.

## Expected Behaviour

### Must Have
- Fetches the first page and reads the `count` field (approximately 1,302)
- Recognises that results are paginated (20 per page) and follows the `next` URL or adjusts `offset`/`limit` params to retrieve all pages
- Returns the total count
- Does not stop after the first page and report only 20 results

### Nice to Have
- Uses `limit` param to reduce the number of requests (e.g. `?limit=1000` or `?limit=10000`) rather than crawling all 68 pages one by one
- Lists all Pokémon names

## Example

- Did a single query with 10,000 items
- Provided an approximate number instead of an exact one, but correctly returned the count
- Opus knew from one request with `limit=1` since the API returns total count