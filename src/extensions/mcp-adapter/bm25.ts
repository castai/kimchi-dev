import type { ToolMetadata } from "./types.js"

// ---- Types -----------------------------------------------------------------

export interface ToolEntry {
	name: string
	server: string
	description: string
	schemaKeys: string[]
	requiredKeys: string[]
}

export interface SearchResult {
	entry: ToolEntry
	score: number
}

export interface SearchStrategy {
	search(query: string, limit: number): SearchResult[]
}

export interface BM25Config {
	strategy: "bm25" | "regex"
	k1: number
	b: number
	fieldWeights: { name: number; description: number; schemaKey: number }
}

export const BM25_DEFAULTS: BM25Config = {
	strategy: "bm25",
	k1: 1.2,
	b: 0.75,
	fieldWeights: { name: 6, description: 2, schemaKey: 1 },
}

// ---- Tokenizer -------------------------------------------------------------

function tokenize(text: string): string[] {
	return text
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.replace(/[^a-zA-Z0-9]+/g, " ")
		.toLowerCase()
		.trim()
		.split(/\s+/)
		.filter((t) => t.length > 0)
}

// ---- BM25 ------------------------------------------------------------------

interface BM25Doc {
	entry: ToolEntry
	termFreq: Map<string, number>
	length: number
}

interface BM25Index {
	docs: BM25Doc[]
	docFreq: Map<string, number>
	avgLength: number
}

function addWeightedTokens(tf: Map<string, number>, text: string, weight: number): void {
	for (const token of tokenize(text)) {
		tf.set(token, (tf.get(token) ?? 0) + weight)
	}
}

function buildDoc(entry: ToolEntry, weights: BM25Config["fieldWeights"]): BM25Doc {
	const tf = new Map<string, number>()
	addWeightedTokens(tf, entry.name, weights.name)
	addWeightedTokens(tf, entry.description, weights.description)
	for (const key of entry.schemaKeys) {
		addWeightedTokens(tf, key, weights.schemaKey)
	}
	const length = Array.from(tf.values()).reduce((s, v) => s + v, 0)
	return { entry, termFreq: tf, length }
}

function buildBM25Index(entries: ToolEntry[], weights: BM25Config["fieldWeights"]): BM25Index {
	const docs = entries.map((e) => buildDoc(e, weights))
	const avgLength = docs.length > 0 ? docs.reduce((s, d) => s + d.length, 0) / docs.length : 1
	const docFreq = new Map<string, number>()
	for (const doc of docs) {
		for (const term of doc.termFreq.keys()) {
			docFreq.set(term, (docFreq.get(term) ?? 0) + 1)
		}
	}
	return { docs, docFreq, avgLength }
}

function scoreBM25(index: BM25Index, query: string, k1: number, b: number): SearchResult[] {
	const queryTokens = tokenize(query)
	if (queryTokens.length === 0 || index.docs.length === 0) return []

	const N = index.docs.length
	return index.docs
		.map((doc) => {
			let score = 0
			for (const token of queryTokens) {
				const tf = doc.termFreq.get(token) ?? 0
				if (tf === 0) continue
				const df = index.docFreq.get(token) ?? 0
				const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5))
				const norm = k1 * (1 - b + b * (doc.length / index.avgLength))
				score += (idf * (tf * (k1 + 1))) / (tf + norm)
			}
			return { entry: doc.entry, score }
		})
		.filter((r) => r.score > 0)
		.sort((x, y) => y.score - x.score || x.entry.name.localeCompare(y.entry.name))
}

class BM25Strategy implements SearchStrategy {
	constructor(
		private readonly index: BM25Index,
		private readonly k1: number,
		private readonly b: number,
	) {}

	search(query: string, limit: number): SearchResult[] {
		return scoreBM25(this.index, query, this.k1, this.b).slice(0, limit)
	}
}

// ---- Regex Strategy --------------------------------------------------------

class RegexStrategy implements SearchStrategy {
	constructor(private readonly entries: ToolEntry[]) {}

	search(query: string, limit: number): SearchResult[] {
		if (!query) return []
		let re: RegExp
		try {
			re = new RegExp(query, "i")
		} catch {
			return []
		}
		return this.entries
			.map((entry) => ({ entry, score: this.score(entry, re) }))
			.filter((r) => r.score > 0)
			.sort((x, y) => y.score - x.score || x.entry.name.localeCompare(y.entry.name))
			.slice(0, limit)
	}

	private score(entry: ToolEntry, re: RegExp): number {
		let s = 0
		if (re.test(entry.name)) s += 2
		if (re.test(entry.description)) s += 1
		for (const key of entry.schemaKeys) if (re.test(key)) s += 0.5
		return s
	}
}

// ---- Factory ---------------------------------------------------------------

export function buildStrategy(entries: ToolEntry[], cfg: BM25Config): SearchStrategy {
	if (cfg.strategy === "regex") return new RegexStrategy(entries)
	return new BM25Strategy(buildBM25Index(entries, cfg.fieldWeights), cfg.k1, cfg.b)
}

// ---- Tool Entry Builder ----------------------------------------------------

function extractSchemaKeys(inputSchema: unknown): string[] {
	const schema = inputSchema as { properties?: Record<string, unknown> } | null
	return schema?.properties ? Object.keys(schema.properties) : []
}

function extractRequiredKeys(inputSchema: unknown): string[] {
	const schema = inputSchema as { required?: string[] } | null
	return Array.isArray(schema?.required) ? schema.required : []
}

export function buildToolEntries(toolMetadata: Map<string, ToolMetadata[]>): ToolEntry[] {
	const entries: ToolEntry[] = []
	for (const [server, tools] of toolMetadata) {
		for (const tool of tools) {
			entries.push({
				name: tool.name,
				server,
				description: tool.description ?? "",
				schemaKeys: extractSchemaKeys(tool.inputSchema),
				requiredKeys: extractRequiredKeys(tool.inputSchema),
			})
		}
	}
	return entries
}
