import { createHash } from "node:crypto"
import { createReadStream, existsSync, mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pipeline } from "node:stream/promises"
import { extract as tarExtract } from "tar"

/**
 * Verify the SHA-256 of `path` matches `expected` (raw bytes). Throws on
 * mismatch — that's a hard error, the binary on disk after rename would
 * otherwise be a tampered or partial download.
 */
export async function verifyChecksum(path: string, expected: Uint8Array): Promise<void> {
	const hash = createHash("sha256")
	await pipeline(createReadStream(path), hash)
	const actual = hash.digest()
	if (actual.length !== expected.length || !actual.equals(Buffer.from(expected))) {
		throw new Error(`checksum mismatch: expected ${hexEncode(expected)}, got ${actual.toString("hex")}`)
	}
}

/**
 * Extract a tar.gz into a fresh temp dir and assert that `binaryName` is
 * present in the archive. Returns the temp dir path; the caller is
 * responsible for cleaning it up. Release archives are flat — a single
 * binary at the root, no `bin/` prefix.
 *
 * Throws if the binary is missing — that's our integrity check that the
 * release was packaged correctly for our platform.
 */
export async function extractTarGz(archivePath: string, binaryName: string): Promise<string> {
	const root = mkdtempSync(join(tmpdir(), "kimchi-update-"))
	await tarExtract({
		file: archivePath,
		cwd: root,
		// tar's filter accepts (path, entry) — we don't filter, just want the
		// default behavior, but we set strict to false so we don't blow up on
		// minor format quirks. Block path traversal explicitly.
		filter: (path) => !path.startsWith(".."),
	})
	const binaryPath = join(root, binaryName)
	if (!existsSync(binaryPath)) {
		throw new Error(`${binaryName} binary not found in archive`)
	}
	return root
}

function hexEncode(bytes: Uint8Array): string {
	return Buffer.from(bytes).toString("hex")
}
