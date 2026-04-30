import { arch, platform } from "node:os"
import { getVersion } from "../utils.js"

export async function runVersion(_args: string[]): Promise<number> {
	console.log(`kimchi ${getVersion()}`)
	console.log(`  platform: ${platform()}/${arch()}`)
	console.log(`  node:     ${process.version}`)
	return 0
}
