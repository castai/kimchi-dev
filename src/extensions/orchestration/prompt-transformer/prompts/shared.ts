export const TOOLS_SECTION = `## Available Tools

{{TOOLS}}`

export const RESEARCH_RULES = `## Research Rules

- Use \`web_search\` only during the \`research\` step — not during \`explore\`, \`plan\`, or \`build\`.
- **Avoid web_fetch.** It returns raw website content that can flood your context window. Prefer \`web_search\` for most research. Use \`web_fetch\` only when the information is frequently updated and unlikely to be indexed (e.g. changelogs, latest release notes), or when the user's message contains an explicit URL. When you do use it, request markdown or text format and delegate to a subagent to keep the output out of the main context.
- **Run at most one web_search per task.** Do NOT run a second search to verify or refine.`

export const CORE_GUIDELINES = `- Be concise in your responses.
- Show file paths clearly when working with files.
- Read files before modifying them.
- Prefer editing existing files over creating new ones.
- Do NOT introduce security vulnerabilities.
- Do NOT add features, refactoring, or improvements beyond what was asked.
- If you encounter an error, diagnose the root cause before retrying.
- **Pattern recognition**: If the same implementation pattern is needed more than twice, define the abstraction first, then implement.`

export const PHASE_TAGGING = `## Phase Tagging for Analytics

You must call \`set_phase\` before every block of work. Never take an action without the correct phase being set first. Use one of \`explore\`, \`research\`, \`plan\`, \`build\`, or \`review\` strictly matching current work type.

The session starts in \`explore\` phase by default. Call \`set_phase\` immediately when your work type changes. Only one phase is active at a time — the most recent call wins.`

export const FOOTER = `{{PROJECT_CONTEXT}}

{{SKILLS}}`
