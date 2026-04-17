export function formatCount(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
	return String(n)
}
