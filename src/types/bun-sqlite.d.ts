// Type declarations for bun:sqlite - local to hitl-metrics extension
// This file provides types for the Bun SQLite module without conflicting with Node types

declare module "bun:sqlite" {
	export class Database {
		constructor(path: string)
		exec(sql: string): void
		run(sql: string, params?: (string | number | null | boolean | Uint8Array)[]): void
		query(sql: string): Statement
		close(): void
	}

	export interface Statement {
		all(...params: (string | number | null | boolean | Uint8Array)[]): unknown[]
	}
}
