# Kimchi-dev Smoke-Testing Benchmark

A manual benchmark for testing AI coding orchestrators against three fixed tasks. Sessions are numbered sequentially; each session runs the same prompts and produces JSONL logs that can be analyzed and compared across sessions.

## Setup

Edit `benchmark.json` to match your environment:

```json
{
  "binary": "/path/to/your/kimchi-code",
  "models": ["kimi-k2.5", "minimax-m2.7"]
}
```

- `binary` — path to the kimchi-code binary (`~` is expanded)
- `models` — list of model IDs to benchmark; scripts are generated for every model × task combination

## Workflow

### 1. Create a session

```bash
./new-session.sh
```

Creates `session-01` (or the next number), subdirectories under `runs/`, and one run script per task × model combination.

### 2. Run the scripts

Open all runs in parallel panes (requires iTerm2):

```bash
./sessions/session-01/run-all.sh
```

Or run individual scripts:

```bash
./sessions/session-01/run-simple-kimi-k2.5.sh
./sessions/session-01/run-complex-kimi-k2.5.sh
./sessions/session-01/run-complex-single-kimi-k2.5.sh
./sessions/session-01/run-research-kimi-k2.5.sh
./sessions/session-01/run-simple-minimax-m2.7.sh
...
```

Each script writes a timestamped `.jsonl` file into its `runs/<task>-<model>/` directory.

### 3. Analyze results

Analyze the most recent session:

```bash
python3 analyze-session.py
```

Analyze a specific session by name or number:

```bash
python3 analyze-session.py session-03
python3 analyze-session.py 3
```

Output shows per-run token consumption, subagent count, duration, and quality checks. Saves `analysis.json` in the session directory.

### 4. Compare sessions

Compare the last two sessions:

```bash
python3 compare-sessions.py
```

Compare specific sessions:

```bash
python3 compare-sessions.py session-02 session-03
python3 compare-sessions.py 2 3
```

Shows a table with token delta (%), subagent counts, and durations side by side.

## Benchmark tasks

See `tasks.md` for full prompts, baseline implementations, and expected behavior.

| Task | Prompt summary | Expected |
|------|---------------|----------|
| simple | Go HTTP rate limiter middleware (token bucket, per-IP) | 1 subagent, <5 min, <300k tokens |
| complex | Go REST API task management (layered architecture) | 2–6 subagents, <10 min, <700k tokens |
| complex-single | Same as complex, single-model mode | 1–5 subagents, <10 min, <500k tokens |
| research | Top 3 Go HTTP router libraries with stars and examples | 0 subagents, <2 min, <30k tokens |

## Session directory structure

```
sessions/session-01/
├── run-simple-kimi-k2.5.sh          # one script per task × model
├── run-complex-kimi-k2.5.sh
├── run-complex-single-kimi-k2.5.sh
├── run-research-kimi-k2.5.sh
├── run-simple-minimax-m2.7.sh
├── ...
├── run-all.sh
├── analysis.json          # created by analyze-session.py
└── runs/
    ├── simple-kimi-k2.5/
    │   └── session-YYYYMMDD-HHMMSS.jsonl
    ├── complex-kimi-k2.5/
    ├── complex-single-kimi-k2.5/
    ├── research-kimi-k2.5/
    ├── simple-minimax-m2.7/
    └── ...
```

## Analysis reference

`analyze-session.py` reads the most recent `.jsonl` in each run directory. Quality check results:

- `[+]` PASS — within expected range
- `[!]` WARN — outside expected range but not a hard failure
- `[x]` FAIL — exceeded token budget, wrong subagent count for task type, or exceeded time budget

`compare-sessions.py` calls `analyze-session.py` automatically if `analysis.json` is missing for either session.

## Historical findings

See `SUMMARY.md` for a token trajectory table across the first 10 sessions and the five changes that had the largest measurable impact on token consumption and output quality.
