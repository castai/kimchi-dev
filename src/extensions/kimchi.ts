import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"

const KIMCHI_LABEL = "kimchi-dev | powered by Cast AI"

export default function (pi: ExtensionAPI) {
	pi.on("session_start", (_event, _ctx) => {
		pi.sendMessage({
			customType: "kimchi_session_start",
			content: KIMCHI_LABEL,
			display: true,
		})
	})
}
