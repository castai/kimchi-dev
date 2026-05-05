import { note } from "@clack/prompts"
import { writeTelemetryEnabled } from "../../config.js"
import { select } from "../prompt.js"
import type { WizardState } from "../state.js"

/**
 * Telemetry step — explain exactly what we collect and offer opt-in /
 * opt-out. Copy mirrors internal/tui/steps/telemetry.go verbatim because
 * privacy disclosure language is load-bearing — we shouldn't paraphrase
 * what's promised on the Go side.
 *
 * The choice is persisted to ~/.config/kimchi/config.json's
 * telemetry.enabled. $KIMCHI_TELEMETRY_ENABLED still wins over the
 * persisted value (set by readTelemetryConfig on launch), so users who
 * change their mind via env var don't need to re-run setup.
 */
export async function runTelemetryStep(state: WizardState, opts: { backable: boolean }): Promise<void> {
	note(
		[
			"Help us improve your experience by sharing anonymous usage metrics.",
			"This data enhances your Coding Report in the Kimchi console.",
			"",
			"What we collect:",
			"  • Number of requests and sessions",
			"  • Token usage and model selection",
			"  • Error rates and performance metrics",
			"",
			"What we don't collect:",
			"  • Your actual prompts or code",
			"  • File contents or sensitive data",
			"  • Personal information",
		].join("\n"),
		"Usage telemetry",
	)

	const r = await select<"on" | "off">({
		message: "Share anonymous usage data?",
		options: [
			{ value: "on", label: "Yes, share anonymous usage data" },
			{ value: "off", label: "No, keep my usage private" },
		],
		initialValue: "on",
		backable: opts.backable,
	})
	if (r.kind === "back") {
		state.back = true
		return
	}
	if (r.kind === "cancel") {
		state.cancelled = true
		return
	}

	state.telemetryEnabled = r.value === "on"
	writeTelemetryEnabled(state.telemetryEnabled)
}
