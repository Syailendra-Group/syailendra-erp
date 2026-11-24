# ERP Syailendra — Agent Documentation Set

Documentation set for humans and AI coding agents working on the Syailendra ERP
(Next.js 16 frontend + Odoo 18 CE backend). Everything here is written in English
so that code, docs, and agent instructions share one language.

## How to use this set

1. Read `00_PROJECT_BRIEF.md` and `02_DOMAIN_GLOSSARY.md` before touching domain code.
2. Read `01_ARCHITECTURE_MAP.md` and `03_ODOO_ADDON_MAP.md` before changing data flow.
3. Read the standards that match your change (`standards/`).
4. Feature work starts from the pillar document in `features/` (SCM first).
5. Quality gates and release mechanics live in `05_BUILD_TEST_RELEASE.md`.

## Contents

| Path | Purpose |
| :--- | :--- |
| `00_PROJECT_BRIEF.md` | Business context, entities, pillars, scope |
| `01_ARCHITECTURE_MAP.md` | Runtime topology, layers, data flow |
| `02_DOMAIN_GLOSSARY.md` | Terms, batch lineage, identifier prefixes |
| `03_ODOO_ADDON_MAP.md` | Odoo models, groups, sequences, ACL |
| `04_PROCESS_AND_DATA_REQUIREMENTS.md` | Business process + required data (from PT SBI SOPs) |
| `05_BUILD_TEST_RELEASE.md` | Gates, build, deploy, rollback |
| `06_ROADMAP_OP.md` | Locked decisions and operational roadmap |
| `07_DATA_BACKLOG.md` | Known data gaps and provisioning backlog |
| `08_ACCURATE_INTEGRATION.md` | Accurate Online contract and mapping plan |
| `09_AGENT_WORKSPACE.md` | How the `.agents/` workspace is wired |
| `10_OPEN_QUESTIONS.md` | Decisions still open with the owner |
| `standards/` | Next.js, TypeScript, shadcn, Tailwind, Odoo, i18n, testing, security |
| `features/` | One document per business pillar (SCM in depth) |

## Document rules

- Language: English. Terminology follows `02_DOMAIN_GLOSSARY.md`.
- State verified facts with the evidence source (command, file, or report).
- Never present a plan as an implemented state; label status explicitly.
- Keep tables short and machine-readable; agents parse these documents.
