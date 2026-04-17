const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
const SPINNER_INTERVAL_MS = 80

export interface SpinnerState {
	spinnerIdx: number
	spinnerInterval: ReturnType<typeof setInterval> | undefined
}

export function tickSpinner(state: SpinnerState, invalidate: () => void): void {
	if (!state.spinnerInterval) {
		state.spinnerIdx = 0
		state.spinnerInterval = setInterval(() => {
			state.spinnerIdx = (state.spinnerIdx + 1) % SPINNER_FRAMES.length
			invalidate()
		}, SPINNER_INTERVAL_MS)
	}
}

export function clearSpinner(state: SpinnerState): void {
	if (state.spinnerInterval) {
		clearInterval(state.spinnerInterval)
		state.spinnerInterval = undefined
	}
}

export function spinnerFrame(state: SpinnerState): string {
	return SPINNER_FRAMES[state.spinnerIdx ?? 0]
}
