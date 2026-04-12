/**
 * Shared test harness utilities for smoke tests.
 *
 * Provides isolated temp directories and a helper to spawn the compiled
 * kimchi-code binary with a sandboxed HOME. The binary computes its agent
 * config dir as HOME/.config/kimchi/harness, so we expose that derived
 * path for tests that need to place settings files there.
 */

import { type SpawnSyncReturns, spawnSync } from "node:child_process"
import { mkdirSync, mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { afterAll, beforeAll } from "vitest"

export const BINARY_PATH = resolve("dist/kimchi-code")

let tempHome: string

beforeAll(() => {
	tempHome = mkdtempSync(join(tmpdir(), "kimchi-smoke-home-"))
})

afterAll(() => {
	rmSync(tempHome, { recursive: true, force: true })
})

/**
 * Returns the agent config dir that the binary will derive from tempHome.
 * Matches the logic in src/cli.ts: resolve(homedir(), ".config", "kimchi", "harness").
 */
export function getAgentDir(): string {
	return join(tempHome, ".config", "kimchi", "harness")
}

/**
 * Ensure the agent config dir exists and return its path.
 */
export function ensureAgentDir(): string {
	const dir = getAgentDir()
	mkdirSync(dir, { recursive: true })
	return dir
}

export function runBinary(args: string[] = [], extraEnv: Record<string, string> = {}): SpawnSyncReturns<string> {
	const result = spawnSync(BINARY_PATH, args, {
		encoding: "utf-8",
		timeout: 30_000,
		env: {
			PATH: process.env.PATH,
			HOME: tempHome,
			...extraEnv,
		},
	})
	if (result.status === null) {
		const reason = result.signal ? `killed by ${result.signal}` : "timed out after 30s"
		throw new Error(`runBinary ${reason}: ${BINARY_PATH} ${args.join(" ")}\nstderr: ${result.stderr ?? "(empty)"}`)
	}
	return result
}
