/**
 * Placeholder used by command handlers that are wired into the dispatcher
 * but not yet implemented. Lets us land the dispatcher (PR1) without the
 * integration ports (PR2) or self-update (PR3). Replaced as each command
 * gets a real implementation.
 */
export async function notYetImplemented(name: string): Promise<number> {
	console.error(`kimchi ${name}: not implemented yet on this branch.`)
	console.error("The dispatcher is wired up; the command logic lands in a follow-up.")
	return 1
}
