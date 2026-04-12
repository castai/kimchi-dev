import { defineConfig, mergeConfig } from "vitest/config"
import rootConfig from "../../vitest.config.js"

export default mergeConfig(
	rootConfig,
	defineConfig({
		test: {
			include: ["tests/smoke/**/*.test.ts"],
			testTimeout: 15_000,
		},
	}),
)
