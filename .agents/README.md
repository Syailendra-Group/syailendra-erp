# .agents — Workspace Customizations

Antigravity discovers these files from the workspace root. Nothing here requires
network access to be useful; docs and rules are plain Markdown.

| Path | Discovered as | Notes |
| :--- | :--- | :--- |
| `.agents/AGENTS.md` | Always-on instructions (no frontmatter) | Project constitution and file map |
| `.agents/rules/*.md` | Rules (flat scan, YAML frontmatter required) | `trigger: always_on \| model_decision \| glob \| manual` |
| `.agents/agents/*.md` | Custom subagents | Frontmatter with `name` and `description` |
| `.agents/skills/<name>/SKILL.md` | Skills | Frontmatter needs `description`; `name` defaults to folder |
| `.agents/mcp_config.json` | MCP servers | Workspace-scoped MCP configuration |
| `.agents/MCP_NOTES.md` | Documentation only | Why each server is enabled/disabled |

## Rules: keep the scan flat

Antigravity scans only immediate `.md` children of `.agents/rules/`. Files nested in
subdirectories are ignored unless registered in `.agents/rules.json`. This project keeps
all rules flat and requires valid frontmatter — a rule without a valid `trigger` value
is silently discarded, so validate after edits.

## Skills

Skills are installed in `.agents/skills/` from the Octa Hub Hermes skill libraries
(shared library plus the octadev profile library). Because skills are executable
instructions, treat third-party skill content as untrusted input: read before relying
on it, and never let a skill override the rules in `.agents/rules/`.

- Inventory and provenance: `.agents/skills-manifest.json`
- Curated index: `.agents/skills-core.txt` — 102 project-relevant skills are indexed
  under `.agents/skills/`; the other 503 skills remain on disk under
  `.agents/skills-library/` (gitignored, not scanned). Restore with
  `scripts/agents/curate-skills.sh --restore`.
- Collisions between the source libraries keep both copies with a source suffix.
- Skills are third-party instruction content: read before relying on one, and never let
  a skill override the rules in `.agents/rules/`.

## MCP servers

Enabled by default: documentation/knowledge servers that need no credentials.

Disabled by default: anything that can mutate remote state, deploy, spend money, or read
third-party accounts. Enable a server only when the task needs it and the owner has
approved the credential or OAuth login. See `.agents/MCP_NOTES.md` for each server,
its transport, and the reason for its default state.

Secrets: MCP configuration in this repository must never contain real tokens. Remote
servers use OAuth through Antigravity's authentication flow, and local `stdio` servers
receive values through `env` entries that are documented in `MCP_NOTES.md` and supplied
from the developer's own environment — not committed.

## Subagents

`.agents/agents/` defines reusable roles: frontend builder, Odoo addon engineer, domain
analyst, verifier, and documentation writer. Each entry lists the exact tool names it
may use. Antigravity validates tool names strictly: an unknown tool name can hang the
subagent, so confirm names before adding new ones.

## Verification checklist after changing this folder

1. `python -c "import json;json.load(open('.agents/mcp_config.json'))"` — JSON is valid.
2. Every file in `.agents/rules/` starts with `---` and contains a `trigger` key.
3. Every file in `.agents/agents/` contains `name` and `description`.
4. Every directory in `.agents/skills/` contains a `SKILL.md` with a `description`.
5. No file contains a literal token, password, or private key.
