# MCP Notes

Schema reference: Antigravity `mcp_config.json` uses `{"mcpServers": { "<id>": {...} }}`
with either `command` (local stdio) or `serverUrl` (remote Streamable HTTP). Optional
keys used here: `args`, `env`, `disabled`, `enabledTools`, `timeoutSeconds`, `tools`.

## Default state

| Server | Transport | Default | Reason |
| :--- | :--- | :--- | :--- |
| `context7` | Remote | Enabled | Library documentation lookup; no credentials required |
| `deepwiki` | Remote | Enabled | Source-grounded repository documentation; no credentials |
| `shadcn` | Local stdio (`npx`) | Disabled | Needs Node.js/npm on the client machine; verify the CLI invocation before enabling |
| `next-devtools` | Local stdio (`npx`) | Disabled | Needs Node.js plus a running Next.js dev/build process; verify package and args first |
| `vercel` | Remote OAuth | Disabled | Can mutate deployments/projects; allowlist limits it to read-only tools |
| `supabase` | Remote OAuth | Disabled | Can execute SQL and change projects; allowlist excludes write tools |
| `prisma-postgres` | Remote OAuth | Disabled | Database provisioning/mutation surface |
| `postman` | Remote OAuth | Disabled | Workspace assets, not required for ERP coding |
| `aws-knowledge` | Remote | Disabled | Read-only documentation; enable when working with AWS topics |
| `wolfram` | Remote | Disabled | Computation companion, no ERP dependency |
| `kiwi` | Remote | Disabled | Flight search; unrelated to this project, kept for parity with the owner's library |
| `twilio-docs` | Remote | Disabled | Documentation server; enable only for messaging work |

## Enabling a disabled server

1. Confirm the task needs it and tell the owner; for OAuth or account-scoped servers,
   get explicit approval first.
2. For `stdio` servers: install Node.js on the Windows client, then verify the exact
   package name and arguments with `npx <package> --help` before relying on them. The
   commands recorded here are candidates, not verified invocations.
3. Remove `"disabled": true` (or set it to `false`) and reload the Antigravity MCP panel;
   check the live status indicator and the connection log.
4. Never paste a real token into this file. Use the server's OAuth flow, or supply a
   local environment value through `env` and keep it out of Git.

## Notes on power limits

`enabledTools` is an allowlist: when present, every tool not listed is hidden from the
agent. Keep the allowlists narrow when raising a powerful server, and prefer read-only
tools for any service that also exposes deploy, delete, or execute capabilities.

Antigravity does not support the legacy HTTP+SSE transport or the `httpUrl` field for
remote servers; use `serverUrl`/`url` with Streamable HTTP endpoints.
