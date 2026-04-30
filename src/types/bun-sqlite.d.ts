/**
 * Minimal ambient typings for `bun:sqlite`. We only use it from
 * `src/integrations/cursor.ts` and only at runtime in the Bun-compiled
 * binary; pulling all of `@types/bun` would shadow Node types in this
 * mostly-Node codebase, so we declare just the surface we touch.
 */
declare module "bun:sqlite" {
	export class Statement<R = unknown, P extends unknown[] = unknown[]> {
		get(...params: P): R | null
		all(...params: P): R[]
		run(...params: P): { changes: number; lastInsertRowid: number | bigint }
	}

	export class Database {
		constructor(filename: string, options?: { readonly?: boolean; create?: boolean })
		exec(sql: string): void
		run(sql: string, params?: unknown[]): { changes: number; lastInsertRowid: number | bigint }
		query<R = unknown, P extends unknown[] = unknown[]>(sql: string): Statement<R, P>
		transaction<F extends (...args: unknown[]) => unknown>(fn: F): F
		close(): void
	}
}
