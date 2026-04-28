/**
 * Project Hash Utility
 *
 * Generates deterministic hashes for project path identification.
 */

import { createHash } from "node:crypto"

/**
 * Generate a project hash from a realpath string.
 * Uses SHA-256 truncated to first 16 hex characters.
 *
 * @param realpath - Absolute project path
 * @returns 16-character hex hash string
 */
export function projectHash(realpath: string): string {
	return createHash("sha256").update(realpath).digest("hex").slice(0, 16)
}
