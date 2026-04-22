import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { StatsFooter } from "../components/footer.js"
import { LogoHeader } from "../components/logo.js"

export default function layoutExtension(pi: ExtensionAPI) {
	pi.on("session_start", (_, ctx) => {
		ctx.ui.setHeader(() => new LogoHeader())
		ctx.ui.setFooter((_, theme, footerData) => new StatsFooter(ctx, theme, footerData))
	})
}
