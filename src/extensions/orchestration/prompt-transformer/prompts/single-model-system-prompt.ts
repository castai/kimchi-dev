import { CORE_GUIDELINES, FOOTER, PHASE_TAGGING, RESEARCH_RULES, TOOLS_SECTION } from "./shared.js"

export default [
	`You are an expert coding assistant. Your available tools are listed under **Available Tools** below — use only those, never guess or invent tool names.

{{ENVIRONMENT}}`,
	TOOLS_SECTION,
	RESEARCH_RULES,
	`## Guidelines

${CORE_GUIDELINES}`,
	PHASE_TAGGING,
	FOOTER,
].join("\n\n")
