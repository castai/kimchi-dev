# Authentication and custom-provider startup

Kimchi refreshes its model metadata at startup using the effective Kimchi API
key (`KIMCHI_API_KEY`, when non-empty, takes precedence over the saved key).
This refresh is separate from authentication for custom providers configured
in `~/.config/kimchi/harness/models.json`.

Before starting the agent, Kimchi captures the environment override in private
module state and deletes `KIMCHI_API_KEY` from its own process environment.
Configuration reads and mismatch warnings still use the captured key, but Bash
tools and MCP subprocesses no longer inherit it. This protects against accidental
exposure in environment dumps without overwriting the saved login or changing
the parent shell's environment.

If the metadata API rejects an environment-provided key with `401 Unauthorized`,
startup stops with this error, without opening a login dialog or modifying
`auth.json`:

> KIMCHI_API_KEY environment variable contains an invalid API key. Update or delete the environment variable, then restart Kimchi.

This applies even when a valid Kimchi credential exists in `auth.json` or custom
models are configured. Logging in again cannot fix an active environment
override, and Kimchi does not silently switch to another stored account.

If instead the rejected key came from the saved Kimchi configuration and custom
models are configured, startup warns and retains the existing model definitions.
An explicitly selected custom provider can continue using its own credentials,
even when the saved Kimchi key is expired. The failed
refresh does not overwrite the saved key, `auth.json`, or custom-provider
configuration. Kimchi authentication remains blocked while the rejected key
is effective; preserving `auth.json` does not silently switch to a stored account.

This fallback does not validate the rejected key or bypass authentication:
model requests still authenticate with the selected provider. Without custom
models, a Kimchi `401` remains an error even if Kimchi model metadata is cached.
Explicit credential validation that disables cached fallback also rejects the
key, regardless of whether custom providers exist.
