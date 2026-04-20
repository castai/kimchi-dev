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

export const BINARY_PATH = resolve("dist/bin/kimchi-code")
export const PACKAGE_DIR = resolve("dist/share/kimchi")

let tempHome: string | undefined

beforeAll(() => {
	tempHome = mkdtempSync(join(tmpdir(), "kimchi-smoke-home-"))
})

afterAll(() => {
	if (tempHome) {
		rmSync(tempHome, { recursive: true, force: true })
	}
})

function getTempHome(): string {
	if (!tempHome) {
		throw new Error("tempHome not initialized — getAgentDir/ensureAgentDir called outside of a test lifecycle")
	}
	return tempHome
}

/**
 * Returns the agent config dir that the binary will derive from tempHome.
 * Matches the logic in src/cli.ts: resolve(homedir(), ".config", "kimchi", "harness").
 */
export function getAgentDir(): string {
	return join(getTempHome(), ".config", "kimchi", "harness")
}

/**
 * Ensure the agent config dir exists and return its path.
 */
export function ensureAgentDir(): string {
	const dir = getAgentDir()
	mkdirSync(dir, { recursive: true })
	return dir
}

const DEFAULT_TIMEOUT_MS = 30_000

interface RunBinaryOptions {
	args?: string[]
	extraEnv?: Record<string, string>
	timeoutMs?: number
	/** When false, non-zero exit codes and signals don't throw. Useful for testing error paths. Defaults to true. */
	throwOnError?: boolean
}

export function runBinary(opts: RunBinaryOptions = {}): SpawnSyncReturns<string> {
	const { args = [], extraEnv = {}, timeoutMs = DEFAULT_TIMEOUT_MS, throwOnError = true } = opts
	const home = getTempHome()
	const result = spawnSync(BINARY_PATH, args, {
		encoding: "utf-8",
		timeout: timeoutMs,
		env: {
			PATH: process.env.PATH,
			HOME: home,
			PI_PACKAGE_DIR: PACKAGE_DIR,
			...extraEnv,
		},
	})
	if (throwOnError) {
		if (result.status === null) {
			const code = (result.error as NodeJS.ErrnoException | undefined)?.code
			throw new Error(
				`runBinary failed (${code ?? result.signal ?? "unknown"}): ${BINARY_PATH} ${args.join(" ")}\nstdout: ${result.stdout ?? "(empty)"}\nstderr: ${result.stderr ?? "(empty)"}`,
			)
		}
		if (result.status !== 0) {
			throw new Error(
				`runBinary exited with status ${result.status}: ${BINARY_PATH} ${args.join(" ")}\nstdout: ${result.stdout ?? "(empty)"}\nstderr: ${result.stderr ?? "(empty)"}`,
			)
		}
	}
	return result
}
