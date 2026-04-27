/**
 * Cast AI Analytics API Client
 *
 * Fetches analytics, productivity metrics, and timeseries data from Cast AI.
 */

import type {
	GenerateAnalyticsRequest,
	GenerateAnalyticsResponse,
	GenerateProductivityMetricsTimeseriesRequest,
	GenerateProductivityMetricsTimeseriesResponse,
	GetProductivityMetricsRequest,
	GetProductivityMetricsResponse,
} from "./types.js"

const BASE_URL = "https://api.cast.ai"

// Hardcoded user ID as specified in requirements
const HARDCODED_USER_ID = "d1c79c82-c230-4b19-9def-dbe49bf63368"

// Hardcoded organization ID - needed for some endpoints
const FALLBACK_ORG_ID = "516442fe-054a-49e2-ac2d-9dc9b104c3d2"

interface ApiClientConfig {
	apiKey: string
	baseUrl?: string
	userId?: string
	organizationId?: string
}

export class CastAiStatsApi {
	private apiKey: string
	private baseUrl: string
	private userId: string
	private organizationId: string

	constructor(config: ApiClientConfig) {
		this.apiKey = config.apiKey
		this.baseUrl = config.baseUrl ?? BASE_URL
		this.userId = config.userId ?? HARDCODED_USER_ID
		this.organizationId = config.organizationId ?? FALLBACK_ORG_ID
	}

	/**
	 * Make an authenticated API request to Cast AI
	 */
	private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseUrl}${path}`
		const headers = new Headers(options.headers)
		headers.set("Authorization", `Bearer ${this.apiKey}`)
		headers.set("Content-Type", "application/json")
		headers.set("Accept", "application/json")

		const response = await fetch(url, {
			...options,
			headers,
		})

		if (!response.ok) {
			const errorText = await response.text().catch(() => "Unknown error")
			throw new Error(`Kimchi API error (${response.status}): ${errorText}`)
		}

		return response.json() as Promise<T>
	}

	/**
	 * Generates analytics data for the organization.
	 * Endpoint: GET /ai-optimizer/v1beta/organizations/{id}:generateAnalyticsReport
	 *
	 * Note: This endpoint requires an organization ID. It supports filtering by castai_api_key_owner_id.
	 */
	async generateAnalytics(startTime: Date, endTime: Date, organizationId?: string): Promise<GenerateAnalyticsResponse> {
		const orgId = organizationId ?? this.organizationId

		// Build filter for user - uses CEL expression
		// Filter format: castai_api_key_owner_id == "user-id"
		const filter = `castai_api_key_owner_id == "${this.userId}"`

		const params = new URLSearchParams({
			startTime: startTime.toISOString(),
			endTime: endTime.toISOString(),
			filter: filter,
		})

		return this.request<GenerateAnalyticsResponse>(
			`/ai-optimizer/v1beta/organizations/${orgId}:generateAnalyticsReport?${params.toString()}`,
		)
	}

	/**
	 * Gets aggregated productivity metrics.
	 * Endpoint: GET /ai-optimizer/v1beta/productivity-metrics
	 *
	 * Note: Supports user_id filtering.
	 */
	async getProductivityMetrics(
		startTime: Date,
		endTime: Date,
		options: {
			metricNames?: string[]
			sessionId?: string
			providerName?: string
		} = {},
	): Promise<GetProductivityMetricsResponse> {
		const params = new URLSearchParams({
			from: startTime.toISOString(),
			to: endTime.toISOString(),
		})

		// NOTE: Not filtering by user_id for productivity metrics - shows all org data
		// Analytics endpoint still filters by user via CEL expression

		// Optional provider filter
		if (options.providerName) {
			params.set("provider_name", options.providerName)
		}

		if (options.metricNames?.length) {
			for (const name of options.metricNames) {
				params.append("metric_names", name)
			}
		}

		if (options.sessionId) {
			params.set("session_id", options.sessionId)
		}

		return this.request<GetProductivityMetricsResponse>(
			`/ai-optimizer/v1beta/productivity-metrics?${params.toString()}`,
		)
	}

	/**
	 * Generates productivity metrics as time series data points.
	 * Endpoint: GET /ai-optimizer/v1beta/organizations/{organization_id}/productivity-metrics:generateTimeseries
	 *
	 * Note: This endpoint requires an organization ID. Supports user_id filtering.
	 */
	async generateProductivityMetricsTimeseries(
		startTime: Date,
		endTime: Date,
		organizationId?: string,
		options: {
			metricNames?: string[]
			sessionId?: string
			providerName?: string
		} = {},
	): Promise<GenerateProductivityMetricsTimeseriesResponse> {
		const orgId = organizationId ?? this.organizationId

		const params = new URLSearchParams({
			from: startTime.toISOString(),
			to: endTime.toISOString(),
		})

		// Note: Productivity timeseries is org-wide data (no user filter)
		// No provider_name filter - show all providers (claude-code-otel, opencode-otel)

		if (options.metricNames?.length) {
			for (const name of options.metricNames) {
				params.append("metric_names", name)
			}
		}

		if (options.sessionId) {
			params.set("session_id", options.sessionId)
		}

		return this.request<GenerateProductivityMetricsTimeseriesResponse>(
			`/ai-optimizer/v1beta/organizations/${orgId}/productivity-metrics:generateTimeseries?${params.toString()}`,
		)
	}

	/**
	 * Get the hardcoded user ID being used
	 */
	getUserId(): string {
		return this.userId
	}

	/**
	 * Get the organization ID being used
	 */
	getOrganizationId(): string {
		return this.organizationId
	}

	/**
	 * Set a different organization ID
	 */
	setOrganizationId(orgId: string): void {
		this.organizationId = orgId
	}
}

/**
 * Create a stats API client with the given API key
 */
export function createStatsClient(config: ApiClientConfig): CastAiStatsApi {
	return new CastAiStatsApi(config)
}

/**
 * Get default time range for stats queries (last 30 days)
 */
export function getDefaultTimeRange(): { startTime: Date; endTime: Date } {
	const endTime = new Date()
	const startTime = new Date()
	startTime.setDate(startTime.getDate() - 30)
	return { startTime, endTime }
}

/**
 * Get time range for stats queries (last N days)
 */
export function getTimeRange(days: number): { startTime: Date; endTime: Date } {
	const endTime = new Date()
	const startTime = new Date()
	startTime.setDate(startTime.getDate() - days)
	return { startTime, endTime }
}
