---
name: antigravity-agent-workspace
description: "Use when wiring a Google Antigravity agent workspace."
version: 1.0.0
author: "Kael (octadev)"
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags:
      - antigravity
      - agent-workspace
      - skills
      - mcp
      - subagents
      - ssh
---

# Antigravity Agent Workspace

Covers `.agents/` for the Google Antigravity App, IDE and CLI: always-on instructions,
rules, skills, custom subagents, MCP servers, and remote editing over SSH.

Antigravity (App, IDE, CLI) discovers its customizations from a fixed layout under the
workspace root. Three of the mechanisms fail **silently** (a rule with a bad trigger, a
skill without a `description`, a rule file nested one directory too deep) and one fails
**loudly but confusingly** (an unknown tool name in a subagent definition hangs it).
Install in this order and validate mechanically, or the agent simply behaves as if the
file is not there.

## When to Use

- Standing up or repairing `.agents/` in a repository (rules, skills, subagents, MCP).
- Porting an existing skill/MCP library from another agent (Hermes profile, plugin, another
  machine) into a project workspace.
- Connecting Antigravity to a repository on a remote host over SSH.
- Diagnosing "Antigravity ignores my rule / skill / subagent".

## Discovery map

| Path | Loaded as | Hard requirement |
| :--- | :--- | :--- |
| `<dir>/AGENTS.md`, `<dir>/GEMINI.md` (each level up to the repo root) | Always-on instructions | **No frontmatter**; the whole file is the rule |
| `<dir>/.agents/AGENTS.md` \| `.agents/GEMINI.md` | Always-on instructions | Same, no frontmatter |
| `.agents/rules/*.md` | Rules | YAML frontmatter with a valid `trigger`; **flat scan only** |
| `.agents/rules.json` | Rule registry | Only needed to register rules that live in nested subfolders |
| `.agents/skills/<name>/SKILL.md` | Skills | `description` in frontmatter; `name` defaults to the folder name |
| `.agents/agents/<name>.md` or `<name>/agent.md` | Custom subagents | `name` + `description` frontmatter |
| `.agents/mcp_config.json` | Workspace MCP servers | `{"mcpServers": {"...": {...}}}` |
| global: `~/.gemini/AGENTS.md`, `~/.gemini/config/rules/*.md`, `~/.gemini/config/mcp_config.json`, `~/.gemini/config/agents/` | Machine-wide equivalents | Global `rules/` **requires** frontmatter |
| `.agent/skills`, `.agent/rules` | Legacy alias | Still discovered; prefer `.agents/` |

Exact frontmatter keys, MCP properties, and the full location table:
`references/workspace-discovery-schema.md`.

## Procedure

### 1. Fix the surface and the transport before writing anything

Ask which surface owns the workspace (App, IDE, CLI) and whether the repo is local or on a
remote host. Antigravity **cannot attach to code-server**: VS Code Web over HTTP is a
browser IDE, not a connection target. Remote editing means SSH, with the workspace
resolved on the remote host. Remote setup, account/uid requirements, and the client config
live in `references/ssh-remote-hosts.md`.

### 2. Lay down `.agents/` as a skeleton, then fill it

Create `AGENTS.md`, `rules/`, `skills/`, `agents/`, `mcp_config.json`, `README.md` — and
`MCP_NOTES.md` recording *why* each server is enabled or disabled. Keep `AGENTS.md` short:
constitution (language, secrets, evidence discipline, approval gates) plus a file map.
Depth belongs in the project's own `docs/` tree, which `AGENTS.md` points at.

### 3. Write rules flat, with valid frontmatter

```
---
trigger: model_decision        # always_on | model_decision | glob | manual
description: "..."             # REQUIRED for model_decision; recommended for all
globs: "src/app/**, src/features/**"   # singular `glob:` also accepted; required for glob
---
```

- Keep `always_on` to the constitution. Anything conditional gets `glob` (by path) or
  `model_decision` (by description) so it does not consume every turn's budget.
- One file per concern, named with a numeric prefix so reviewers can see the order
  (`00-project-constitution.md`, `10-frontend-nextjs.md`, `90-collaboration-approval.md`).
- Do **not** create subdirectories under `rules/` for tidiness. Antigravity scans only the
  immediate `.md` children; a nested rule is invisible unless registered in
  `.agents/rules.json`, and that failure produces no warning at all.

### 4. Define subagents, but do not guess tool names

Frontmatter: `name`, `description` (both required), then optional `tools`, `mainAgent`,
`subagent`, `model` (`inherit|flash|pro`), `commandExecutionPolicy`
(`off|auto|eager|sandbox`), `mcpServers`, `skills`. The Markdown body is the system prompt.

- **An unmapped or misspelled tool name in `tools:` can hang the subagent.** Use only tool
  names you have seen documented (for example `view_file`, `grep_search`,
  `replace_file_content`, `run_command`) or omit `tools` and let the default apply.
- Point at bundled skills with workspace-relative paths (`skills/<name>`), which only
  resolve if the installer actually created `.agents/skills/<name>/`.
- Split roles by responsibility, not by technology buzzword: one builder per stack area
  (frontend, backend), one domain analyst, and at least one **read-only** verifier and one
  reviewer whose `tools` list is restricted to inspection plus `run_command`.
  Verification performed by the agent that wrote the code is not verification.

### 5. Install skills with a merge-and-manifest step, never a blind copy

When the source is another agent's library (Hermes profile dirs, plugin dirs, a host-wide
`.agents/skills`), merge by directory name, keep collisions with a `--<library-tag>`
suffix, verify every `SKILL.md` has frontmatter with a `description`, and write a manifest
recording source library, path, file count, bytes and a content hash. Full algorithm,
collision policy, frontmatter repair and the curation step: `references/skill-bundle-merge.md`.

### 6. Configure MCP least-privilege-first

- Remote servers must be Streamable HTTP: `serverUrl` (or `url`). The legacy HTTP+SSE
  transport and the `httpUrl` field are not supported.
- Local servers use `command` + `args` (+ `env`, `cwd`). Anything launched with `npx`
  requires Node.js on the machine that runs the agent — say so instead of shipping a config
  that cannot start.
- Ship powerful servers `"disabled": true` with a documented reason, and put an
  `enabledTools` allowlist on anything that can deploy, execute SQL, spend money, or read a
  third-party account. `enabledTools` is an allowlist: every unlisted tool is hidden.
- No literal token ever enters the file. OAuth servers authenticate through Antigravity's own
  flow; local servers read `env` values from the developer's environment.
- Record candidate commands for not-yet-verified servers in `MCP_NOTES.md` as *candidates*.
  Never present an unverified `npx` invocation as a working configuration.

### 7. Validate, then report measured numbers

```
python3 scripts/validate_agent_workspace.py <repo-root>
```

The script asserts rule triggers/globs, subagent required keys plus skill-path existence,
skill `SKILL.md` presence and `description`, MCP JSON parseability with an enabled/disabled
summary, and greps the tree for obvious literal credentials. Report the counts it prints;
do not restate them from memory.

## Pitfalls

- **A rule with a missing or misspelled `trigger` is discarded silently.** `alwaysOn`,
  `modelDecision` (camelCase) and a missing block all fail the same way: no warning, no
  effect. Validate the key values, not just the presence of frontmatter.
- **A skill without `description` is invisible.** Imported third-party skills sometimes ship
  no frontmatter at all. Generate `name` + `description` (derive it from the first heading)
  and record that you did so in the manifest — never silently rewrite imported content and
  never leave it broken.
- **Every skill is listed in the prompt index on every turn.** Hundreds of installed skills
  are a recurring per-request context cost that dilutes skill selection, not a one-time disk
  cost. Keep a curated `.agents/skills/` and park the rest in a sibling library directory the
  scanner does not read (`.agents/skills-library/`); ship the move as a dry-run script.
- **Two source libraries with the same skill name overwrite each other on a naive copy.**
  Merge by name with a deterministic suffix and keep both copies; a lost copy is
  indistinguishable from a skill that was never installed.
- **`always_on` rules are cumulative** with `<dir>/AGENTS.md` at every level up to the repo
  root and with the global files. Budget the combination, and check whether the repo already
  has a stale root `AGENTS.md` that contradicts the new workspace — that is the file the
  agent will read first.
- **The workspace config is not a sandbox.** Product-level permissions still apply; never
  put a production-write or deploy MCP server in the default-enabled set "for later".
- **Committing an agent workspace is a size decision.** A merged multi-library skill bundle
  reaches tens of megabytes and thousands of files. Measure and report the size before
  staging, and keep the library directory gitignored so a later curation does not re-add it.

## Verification

- `python3 scripts/validate_agent_workspace.py <repo-root>` → exit 0 with counts printed.
- Confirm the skill list the product shows matches the directories on disk.
- Confirm no file under the new tree matches a credential pattern; classify documentation
  placeholders (`ghp_xx...xxxx`, `Bearer sk-xxx...xxxx`) as findings, not as secrets.

## References

- `references/workspace-discovery-schema.md` — full discovery table, rule/skill/subagent
  frontmatter keys, MCP configuration properties, timeouts, tool loading.
- `references/skill-bundle-merge.md` — merging multiple skill libraries, collision policy,
  frontmatter repair, manifest fields, curation and size reporting.
- `references/ssh-remote-hosts.md` — remote editing over SSH: why code-server cannot be
  attached, host account/uid matching, write-access probes, Windows client config.
- `scripts/validate_agent_workspace.py` — mechanical validator for the whole workspace.
