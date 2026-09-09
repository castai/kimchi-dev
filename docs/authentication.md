# Authentication and custom-provider startup

Kimchi refreshes its model metadata at startup using the effective Kimchi API
key. A non-empty `KIMCHI_API_KEY` environment variable takes precedence over
the Kimchi API key saved in `.kimchi/config.json` (project configuration) or
`~/.config/kimchi/config.json` (global configuration).
This refresh is separate from authentication for custom providers configured
in `~/.config/kimchi/harness/models.json`.

Before starting the agent, Kimchi captures the environment override in private
module state and deletes `KIMCHI_API_KEY` from its own process environment.
Configuration reads and mismatch warnings still use the captured key, but Bash
tools and MCP subprocesses no longer inherit it. This protects against accidental
exposure in environment dumps without overwriting the saved login or changing
the parent shell's environment.

Trusted Kimchi helpers, including Curator reviews and Teleport's local SSH,
rsync, and proxy processes, receive the effective Kimchi API key explicitly
through their own `KIMCHI_API_KEY` environment variable. This does not restore
the variable in the main process or write it to SSH configuration.

When the Kimchi API key is supplied through the `KIMCHI_API_KEY` environment
variable, the discovered Kimchi models and credentials are registered in memory
for that process. Startup leaves `~/.config/kimchi/harness/models.json` and the
existing `~/.config/kimchi/harness/auth.json` unchanged. Model reloads keep this
runtime override. Starting another process without `KIMCHI_API_KEY` uses the
Kimchi API key saved in `config.json` again. The shared Kimchi model cache may
belong to a different account, so it is not used as a fallback catalog for a
Kimchi API key supplied through the environment variable.

Temporary discovery failures do not stop startup, regardless of the Kimchi API
key source. If startup discovery using `KIMCHI_API_KEY` fails temporarily, the
next network-enabled model refresh (including login or reload) retries using
the same environment override. Successful recovery replaces the in-memory
catalog without writing `models.json` or `auth.json`; a restart is not required.

When the Kimchi API key comes from `config.json`, startup refreshes the shared
model cache and synchronizes that key into `~/.config/kimchi/harness/auth.json`,
the credential file used by Pi. These files have distinct roles: `config.json`
stores the saved Kimchi login; `auth.json` stores the provider credentials used
for model requests, including credentials for custom providers.

Logging in saves the new Kimchi API key in `config.json`. Kimchi synchronizes
it into `auth.json` when activating the saved credentials. An active
`KIMCHI_API_KEY` environment variable still takes precedence for the running
process. Login and setup do not write API keys to shell profiles.

If the metadata API rejects the Kimchi API key supplied through `KIMCHI_API_KEY`
with `401 Unauthorized`, startup stops with this error, without opening a login
dialog or modifying
`auth.json` or `models.json`:

> KIMCHI_API_KEY environment variable contains an invalid API key. Update or delete the environment variable, then restart Kimchi.

This applies even when a valid Kimchi credential exists in `auth.json` or custom
models are configured. Logging in again cannot fix an active environment
override, and Kimchi does not silently switch to another stored account.

If instead the rejected Kimchi API key came from `config.json` and custom models
are configured, startup warns and retains the existing model definitions.
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
