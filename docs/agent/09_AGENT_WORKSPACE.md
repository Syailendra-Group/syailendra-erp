# 09 — Agent Workspace Guide

## Delivered layout

```
.agents/
├── AGENTS.md                  # always-on project constitution
├── README.md                  # discovery rules and verification checklist
├── MCP_NOTES.md               # per-server default state and enablement policy
├── mcp_config.json            # workspace MCP servers (least privilege)
├── skills-manifest.json       # provenance: source library, size, hash, core flag
├── rules/                     # 10 flat rules with YAML frontmatter
├── agents/                    # 5 custom subagent definitions
└── skills/                    # skill bundle (see below)
scripts/agents/
├── README.md
├── curate-skills.sh
└── install-skills.sh
docs/agent/
├── README.md, 00..10          # project documentation
├── standards/                 # Next.js, TypeScript, shadcn, Tailwind, Odoo, i18n, testing
└── features/                  # SCM (in depth) plus pillar placeholders
```

## Skill bundle

Four local libraries are merged into `.agents/skills/` by directory name:

| Order | Library | Role |
| :--- | :--- | :--- |
| 1 | `/opt/data/skills` | Shared Octa Hub library |
| 2 | `/opt/data/profiles/octadev/skills` | octadev profile library |
| 3 | `/opt/data/profiles/octadev/home/.agents/skills` | Profile Antigravity-format library |
| 4 | `/opt/data/.agents/skills` | Host Antigravity-format library |

Rules applied during install:

- `.archive` directories are excluded.
- A name already used gets a `--<library-tag>` suffix; both copies are kept.
- Four imported skills had no YAML frontmatter and received generated
  `name`/`description` frontmatter so Antigravity does not silently ignore them.
- `skills-manifest.json` records destination name, source library and path, file count,
  byte size, SKILL.md hash, and the curated `core` flag.

Curation has been applied: **102 core skills are indexed** under `.agents/skills/`
(≈12 MB, 1,074 files) and **503 non-core skills stay on disk** under
`.agents/skills-library/` (≈58 MB), which is gitignored and not scanned by Antigravity.
The core list lives in `.agents/skills-core.txt`; `scripts/agents/curate-skills.sh`
re-applies or restores it (`--apply` / `--restore`), and
`scripts/agents/install-skills.sh` rebuilds the whole bundle from the four source
libraries while honoring the core list. `scripts/agents/validate_agent_workspace.py`
validates the result mechanically (exit 0 as of 2026-11-23).

## Rules

Rules live flat in `.agents/rules/` because Antigravity scans only immediate `.md`
children there. Each file carries YAML frontmatter with a valid `trigger`
(`always_on`, `model_decision`, `glob`, `manual`); an invalid or missing trigger makes
Antigravity silently discard the rule. Keep context stable for `always_on` rules.

| Rule | Trigger | Scope |
| :--- | :--- | :--- |
| `00-project-constitution.md` | `always_on` | Language, secrets, text, evidence, approvals |
| `10-frontend-nextjs.md` | `glob` | Routes, features, components |
| `11-typescript-quality.md` | `glob` | All TypeScript sources |
| `12-ui-shadcn-tailwind-i18n.md` | `glob` | UI, tokens, forms, translations |
| `20-odoo-backend.md` | `glob` | Addons and Odoo RPC services |
| `30-scm-domain.md` | `model_decision` | Traceability domain invariants |
| `40-security-data.md` | `model_decision` | Authorization, uploads, storage, audit |
| `50-testing-gates.md` | `model_decision` | Test scope and gate reporting |
| `90-collaboration-approval.md` | `model_decision` | Commits, deploys, shared worktree |

## MCP servers

`context7` and `deepwiki` are enabled (documentation only, no credentials). Everything
that can deploy, mutate remote state, execute SQL, or read a third-party account is
shipped `"disabled": true` with a documented reason and, where relevant, an
`enabledTools` allowlist. See `.agents/MCP_NOTES.md`.

Secrets never appear in `mcp_config.json`: OAuth servers authenticate through
Antigravity's own flow, and stdio servers read values from the developer environment.

## Subagents

`.agents/agents/` defines roles with `name`, `description`, `subagent`, `mainAgent`,
`model`, and `commandExecutionPolicy`. Antigravity validates tool names strictly and can
hang on an unknown name, so the definitions avoid speculative tool lists; the reviewer
role uses only documented names (`view_file`, `grep_search`, `run_command`).

## Developer workstation

Owner workstation is Windows 11 and the chosen editor is the Antigravity App/IDE over
SSH to the repository host. Prerequisites: an SSH key pair, the repository path, and a
POSIX-capable remote shell. Host-side account creation, UID mapping, and sshd hardening
are infrastructure work and need explicit approval before execution.
