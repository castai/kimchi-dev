#!/usr/bin/env python3
"""
RPC-mode E2E test for HITL metrics.

Verifies the full HITL extension lifecycle:
1. Binary runs in RPC mode with the hitl-metrics extension loaded
2. tool_execution_start/end events fire for tool calls
3. Session is recorded in the metrics DB with the real kimchi session ID
4. agent_time_ms accumulates correctly

Usage:
    python3 e2e-rpc.py [--model MODEL]
"""

import asyncio
import json
import os
import sqlite3
import sys
import time
import uuid
from pathlib import Path


# ─── Config ───────────────────────────────────────────────────────────────────

CWD = Path(__file__).parent.parent.parent.resolve()
DIST_BIN = CWD / "dist" / "bin" / "kimchi-code"
SHARE_DIR = CWD / "dist" / "share" / "kimchi"
HARNESS_DIR = Path.home() / ".config" / "kimchi" / "harness"
SESSION_FILE = f"/tmp/hitl-rpc-{time.time():.0f}.jsonl"

MODEL = "kimchi-dev/kimi-k2.5"

# Prompt that triggers tool use (permissions will cancel — error expected)
TOOL_PROMPT = (
    "List the files in extensions/hitl-metrics/ using the ls tool. "
    "Run: ls extensions/hitl-metrics/"
)


def api_key() -> str:
    return json.loads(Path.home().joinpath(".config/kimchi/config.json").read_text())["api_key"]


def metrics_db() -> str:
    import hashlib
    h = hashlib.sha256(str(CWD).encode()).hexdigest()[:16]
    return str(Path.home() / ".kimchi/metrics" / h / "hitl.db")


# ─── RPC helpers ──────────────────────────────────────────────────────────────

def rid() -> str:
    return str(uuid.uuid4())


async def read_line(r: asyncio.StreamReader, timeout: float = 30.0) -> str | None:
    try:
        line = await asyncio.wait_for(r.readline(), timeout=timeout)
        return line.decode().strip() if line else None
    except asyncio.TimeoutError:
        return None


def parse(line: str) -> dict | None:
    try:
        return json.loads(line)
    except (json.JSONDecodeError, TypeError):
        return None


# ─── Core: concurrent reader + writer ────────────────────────────────────────

async def run_session(prompt: str, timeout: float = 120.0) -> dict:
    """Run a session with a concurrent reader so the binary can produce output
    while we feed it the prompt. This avoids pipe buffer deadlock."""
    cmd = [
        str(DIST_BIN), "--mode", "rpc", "--session", SESSION_FILE,
        "--model", MODEL, "-e", str(CWD / "extensions/hitl-metrics/index.ts"),
    ]
    env = {**os.environ,
           "PI_PACKAGE_DIR": str(SHARE_DIR),
           "KIMCHI_CODING_AGENT_DIR": str(HARNESS_DIR),
           "KIMCHI_API_KEY": api_key(),
           "PI_SKIP_VERSION_CHECK": "1"}

    proc = await asyncio.create_subprocess_exec(
        cmd[0], *cmd[1:],
        stdin=asyncio.subprocess.PIPE, stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE, env=env, cwd=str(CWD),
    )
    stdin_w: asyncio.StreamWriter = proc.stdin
    stdout_r: asyncio.StreamReader = proc.stdout

    async def send(cmd: dict) -> None:
        stdin_w.write(json.dumps(cmd).encode() + b"\n")
        await stdin_w.drain()

    all_events: list[dict] = []
    session_id: str | None = None
    tool_starts: list[dict] = []
    tool_ends: list[dict] = []
    event_queue: asyncio.Queue[dict | None] = asyncio.Queue()

    # Background reader — puts parsed events into a queue
    async def reader():
        while True:
            line = await read_line(stdout_r, timeout=20.0)
            if not line:
                await event_queue.put(None)  # EOF sentinel
                break
            ev = parse(line)
            await event_queue.put(ev)

    reader_task = asyncio.create_task(reader())

    # Give the binary a moment to initialize
    await asyncio.sleep(0.3)

    # Query session ID via get_state (session event not available in RPC mode)
    state_req_id = rid()
    await send({"type": "get_state", "id": state_req_id})
    deadline_get_state = time.time() + 30
    while time.time() < deadline_get_state:
        ev = await asyncio.wait_for(event_queue.get(), timeout=20.0)
        if ev is None:
            break
        all_events.append(ev)
        if ev.get("type") == "response" and ev.get("id") == state_req_id:
            if ev.get("success"):
                session_id = ev.get("data", {}).get("sessionId")
            break

    # Send prompt
    req_id = rid()
    print(f"  Sending prompt...")
    await send({"type": "prompt", "id": req_id, "message": prompt})

    # Main event loop — consumes from queue
    deadline = time.time() + timeout
    prompt_success = False
    ui_responses: list[dict] = []

    while time.time() < deadline:
        remaining = deadline - time.time()
        try:
            ev = await asyncio.wait_for(event_queue.get(), timeout=min(remaining, 15.0))
        except asyncio.TimeoutError:
            break
        if ev is None:  # EOF
            break

        all_events.append(ev)
        t = ev.get("type", "?")

        if t == "response" and ev.get("id") == req_id:
            prompt_success = ev.get("success", False)
            print(f"  Prompt accepted: {prompt_success}")

        elif t == "session" and not session_id:
            session_id = ev.get("id")
            print(f"  Session: {session_id}")

        elif t == "tool_execution_start":
            tool_starts.append(ev)
            print(f"  [TOOL] start: {ev.get('toolName', '?')}  {ev.get('toolCallId', '')[:12]}")

        elif t == "tool_execution_end":
            tool_ends.append(ev)
            err = ev.get("isError", False)
            print(f"  [TOOL] end:   {ev.get('toolName', '?')}  error={err}")

        elif t == "extension_ui_request":
            ui_responses.append(ev)
            req_id_ui = ev.get("id")
            method = ev.get("method", "")
            if method == "select":
                opts = ev.get("options", [])
                if isinstance(opts, list) and opts:
                    first = opts[0]
                    val = (first.get("label") if isinstance(first, dict) else str(first)) or "cancelled"
                else:
                    val = "cancelled"
                title = ev.get("title", "")[:50]
                print(f"  [UI] select: {title!r} → {val}")
                await send({"type": "extension_ui_response", "id": req_id_ui, "value": val})
            elif method in ("setStatus", "setTitle", "notify", "set_editor_text"):
                pass
            else:
                print(f"  [UI] {method}: cancelling")
                await send({"type": "extension_ui_response", "id": req_id_ui, "cancelled": True})

        elif t == "agent_end":
            print(f"  [AGENT END]")
            break

        elif t == "error":
            print(f"  [ERROR] {ev.get('error', '')[:80]}")

    # Shutdown
    reader_task.cancel()
    try:
        await asyncio.wait_for(send({"type": "abort", "id": rid()}), timeout=3.0)
    except Exception:
        pass
    proc.terminate()
    try:
        await asyncio.wait_for(proc.wait(), timeout=5.0)
    except asyncio.TimeoutError:
        proc.kill()
        await proc.wait()

    stderr = (await proc.stderr.read()).decode()
    return {
        "events": all_events, "session_id": session_id,
        "exit_code": proc.returncode, "stderr": stderr[:300],
        "prompt_success": prompt_success,
        "tool_starts": tool_starts, "tool_ends": tool_ends,
        "ui_responses": ui_responses,
    }


# ─── Verification ─────────────────────────────────────────────────────────────

def verify(result: dict) -> dict[str, tuple[bool, str]]:
    evs = result["events"]
    types = [e.get("type") for e in evs]
    sid = result["session_id"]
    db = metrics_db()
    checks: dict[str, tuple[bool, str]] = {}

    checks["Process ran"] = (result["exit_code"] != 127, f"code={result['exit_code']}")
    checks["Session ID from events"] = (bool(sid), sid[:20] if sid else "NONE")
    checks["Prompt accepted"] = (result["prompt_success"], str(result["prompt_success"]))
    checks["tool_execution_start fired"] = ("tool_execution_start" in types,
                                            f"count={len(result['tool_starts'])}")
    checks["tool_execution_end fired"] = ("tool_execution_end" in types,
                                          f"count={len(result['tool_ends'])}")
    checks["Matching start/end counts"] = (
        len(result["tool_starts"]) == len(result["tool_ends"]),
        f"s={len(result['tool_starts'])} e={len(result['tool_ends'])}"
    )

    # DB verification
    if Path(db).exists():
        conn = sqlite3.connect(db)
        curs = conn.cursor()
        curs.execute(
            "SELECT hitl_time_ms, agent_time_ms, status FROM hitl_sessions WHERE id=?",
            (sid,) if sid else ("",),
        )
        row = curs.fetchone()
        checks["Session recorded in DB"] = (row is not None, sid[:20] if sid else "no-sid")
        if row:
            hitl_ms, agent_ms, status = row
            checks["Status is valid"] = (status in ("active", "closed"), f"status={status}")
            checks["Time metrics recorded"] = (hitl_ms >= 0 and agent_ms >= 0,
                                               f"HITL={hitl_ms}ms Agent={agent_ms}ms")
            checks["Agent time > 0"] = (agent_ms > 0, f"Agent={agent_ms}ms")
            curs.execute(
                "SELECT tool_name, duration_ms FROM hitl_events WHERE session_id=?",
                (sid,) if sid else ("",),
            )
            ev_rows = curs.fetchall()
            checks["Non-HITL events in DB"] = (len(ev_rows) > 0, f"count={len(ev_rows)}")
        conn.close()
    else:
        checks["Metrics DB exists"] = (False, "not found")

    return checks


# ─── Main ─────────────────────────────────────────────────────────────────────

async def run_test() -> dict:
    print("=" * 60)
    print("RPC E2E: HITL Metrics")
    print("=" * 60)
    print(f"Binary: {DIST_BIN}  Model: {MODEL}  DB: {metrics_db()}\n")

    result = await run_session(TOOL_PROMPT, timeout=120.0)
    print(f"\n  {len(result['events'])} events, session={result['session_id']}")

    checks = verify(result)
    print(f"\n  Verification:")
    for label, (passed, detail) in checks.items():
        print(f"  {'✓' if passed else '✗'} {label}: {detail}")

    all_passed = all(v[0] for v in checks.values())
    print(f"\n{'=' * 60}")
    print(f"  {'ALL PASS' if all_passed else 'FAILURES DETECTED'}")
    print(f"{'=' * 60}")
    return {"result": result, "checks": checks, "all_passed": all_passed}


async def main() -> None:
    try:
        r = await asyncio.wait_for(run_test(), timeout=300)
        sys.exit(0 if r["all_passed"] else 1)
    except asyncio.TimeoutError:
        print("TIMEOUT")
        sys.exit(1)
    except Exception as e:
        print(f"FATAL: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())