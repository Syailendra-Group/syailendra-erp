# Syailendra ERP — Agent Operating Instructions

Always active. Applies to every task in this repository.

## Mission context

This repository is the Syailendra ERP: a Next.js 16 frontend plus Odoo 18 Community
addons for Syailendra Group (essential oils and natural commodities). Read
`docs/agent/README.md` first, then the pillar document under `docs/agent/features/`.

## Hard rules

1. Language: English in code, comments, commits, and technical documentation. UI text
   comes from `next-intl` dictionaries (`src/messages/id`, `src/messages/en`) and both
   locales must stay symmetric.
2. Secrets: never read, print, copy, commit, or embed `.env.local`, tokens, passwords,
   or private keys. Configuration names go in `.env.example`; values stay local.
3. No hardcoded UI text and no hardcoded credentials or endpoints in components.
4. Evidence discipline: never report a command, test, build, or deployment as
   successful unless it was executed and its real output was observed. Report skipped
   or blocked work explicitly.
5. Approval gates: do not commit, push, deploy, run database migrations, alter Odoo
   production data, or change infrastructure without explicit owner approval for that
   specific action.
6. Small, focused, reversible changes. Inspect existing code and conventions first and
   preserve unrelated uncommitted work in this shared worktree.
7. Keep files under 300 lines; split features instead of growing files.
8. Do not invent business rules. Domain requirements come from
   `docs/agent/features/**` and `docs/agent/04_PROCESS_AND_DATA_REQUIREMENTS.md`;
   open items are tracked in `docs/agent/10_OPEN_QUESTIONS.md`.

## Where things live

| Concern | Location |
| :--- | :--- |
| Project documentation | `docs/agent/` |
| Rules (this directory) | `.agents/rules/` |
| Skills | `.agents/skills/<name>/SKILL.md` |
| MCP servers | `.agents/mcp_config.json` |
| Subagent roles | `.agents/agents/` |
| Routes | `src/app/[locale]/...` |
| Features | `src/features/<pillar>/<feature>/` |
| Odoo services | `src/services/odoo/<pillar>/` |
| Server actions | `src/actions/<pillar>/` |
| Shared types | `src/types/<pillar>/` |
| Zod schemas | `src/schemas/<pillar>/` |
| Odoo addons | `addons/<addon>/` |

## Definition of done

Acceptance criteria are satisfied, the relevant gates were actually run, and the result
was verified against real output. Otherwise report the task as incomplete or partially
verified, with the blocker named.
