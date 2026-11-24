# Antigravity workspace discovery schema

Verified against the product documentation (docs/rules, docs/skills, docs/subagents,
docs/mcp, docs/customization-discovery). Field names below are the contract; a typo is a
silent no-op.

## Rule locations

| Scope | Paths |
| :--- | :--- |
| Directory-scoped (workspace + every parent up to the repo root) | `<dir>/AGENTS.md`, `<dir>/GEMINI.md`, `<dir>/.agents/AGENTS.md`, `<dir>/.agents/GEMINI.md`, `<dir>/.agents/rules/*.md` (legacy `.agent/rules/*.md`) |
| Global | `~/.gemini/AGENTS.md`, `~/.gemini/GEMINI.md`, `~/.gemini/config/AGENTS.md`, `~/.gemini/config/GEMINI.md`, `~/.gemini/config/rules/*.md` |

Rules are cumulative, not replacement-based. Rules in folders *below* the workspace root
are not loaded even when the agent edits files there.

## Rule frontmatter

| Field | Required | Values / notes |
| :--- | :--- | :--- |
| `trigger` | **Yes** | `always_on`, `model_decision`, `glob`, `manual` |
| `description` | Required for `model_decision`, recommended otherwise | Injected into the prompt index; also the fallback context when an `always_on` rule exceeds the token budget |
| `globs` (or `glob`) | Required for `glob` | Comma-separated patterns; quote any pattern starting with `*` so YAML does not read it as an alias anchor |

`AGENTS.md` / `GEMINI.md` take **no** frontmatter — the entire file is always active.
Rules inside `rules/` **must** carry frontmatter; without it, or with an unrecognized
trigger value, the file is discarded without warning.
Flat scan: only immediate `.md` children of `rules/` are read. Nested files need an entry
in `.agents/rules.json`.

Use a rule for *constraints and invariants*; use a skill for *multi-step workflows*.

## Skill anatomy

```
.agents/skills/my-skill/
├── SKILL.md        # required: YAML frontmatter + instructions
├── scripts/        # optional
├── examples/       # optional
└── resources/      # optional
```

| Field | Required | Notes |
| :--- | :--- | :--- |
| `name` | No | Unique id, lowercase with hyphens; defaults to the folder name |
| `description` | **Yes** | What the skill does *and when to use it* — this is all the agent sees during discovery |

Progressive disclosure: the agent sees names + descriptions every turn, and reads the full
`SKILL.md` only when it decides the skill is relevant. Write the description in the third
person with the keywords that make the trigger recognizable.
Antigravity defaults to `.agents/skills` and still honours `.agent/skills`.

## Custom subagent frontmatter

| Property | Type | Default | Notes |
| :--- | :--- | :--- | :--- |
| `name` | string | **required** | Unique id |
| `description` | string | **required** | Used by the planner to decide when to delegate |
| `tools` | string[] | `[]` | Explicit allowlist, e.g. `view_file`, `grep_search`, `replace_file_content`, `run_command`. An unmapped name can hang the subagent |
| `mainAgent` | boolean | `true` | Selectable as the primary agent in chat |
| `subagent` | boolean | `true` | Invocable through `invoke_subagent` |
| `model` | string | `inherit` | `inherit`, `flash`, `pro` |
| `commandExecutionPolicy` | string | `sandbox` | `off`, `auto`, `eager`, `sandbox` |
| `mcpServers` | object[] | `[]` | MCP servers scoped to this subagent |
| `skills` / `plugins` | string[] | `[]` | Skill paths, e.g. `skills/my-skill` |

Locations: `.agents/agents/<name>.md` or `.agents/agents/<name>/agent.md` (workspace),
`~/.gemini/config/agents/...` (global), `plugins/<plugin>/agents/` (plugin).
Built-ins that need no definition: `research`, `browser`, `self`.
Subagent workspace options when invoked: `inherit` (same workspace), `branch` (isolated Git
worktree), `share` (shared directory storage).

## MCP configuration

```json
{
  "mcpServers": {
    "local-server": {
      "command": "node",
      "args": ["/usr/local/bin/server.js"],
      "env": { "DB_PATH": "/var/data/app.db" },
      "cwd": "/work",
      "disabled": false,
      "enabledTools": ["read_thing"],
      "disabledTools": [],
      "tools": { "read_thing": { "eager": true, "background": "off" } },
      "timeoutSeconds": 600
    },
    "remote-server": {
      "serverUrl": "https://api.example.com/mcp/",
      "headers": { "Authorization": "Bearer TOKEN_FROM_LOCAL_ENV" },
      "timeoutSeconds": 300
    }
  }
}
```

| Property | Notes |
| :--- | :--- |
| `command` / `args` / `env` / `cwd` | local stdio transport |
| `serverUrl` (or `url`) | remote Streamable HTTP only; legacy HTTP+SSE and `httpUrl` are unsupported |
| `headers` | custom HTTP headers for remote servers |
| `authProviderType` | `google_credentials` attaches Application Default Credentials |
| `oauth` | manual OAuth2 client credentials when the server supports neither CIMD nor DCR |
| `disabled` | suspend the server without deleting its config |
| `enabledTools` | allowlist; everything unlisted is hidden |
| `disabledTools` | denylist |
| `tools.<name>.eager` | register the tool eagerly instead of lazily |
| `tools.<name>.background` | `"off"` or `"always"` |
| `timeoutSeconds` | default 300s to connect / 180s per call; a positive value replaces both limits, a negative value disables both, `0`/unset keeps the defaults. A small value can prevent a slow-starting server from connecting |

Locations: `<workspace>/.agents/mcp_config.json` (workspace),
`~/.gemini/config/mcp_config.json` (global), `<plugin-root>/mcp_config.json` (plugin).
Remote OAuth is handled by the product's own authentication flow — never paste tokens into
the file.
