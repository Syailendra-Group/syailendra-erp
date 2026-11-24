# 06 — Roadmap and Locked Decisions

## Current state (verified snapshot: 2026-11-23)

| Area | Observed state |
| :--- | :--- |
| Frontend | Next.js 16 App Router; SCM operational pages mostly remain placeholders / stubs |
| Odoo | Odoo 18 CE on Company VPS; DB `syailendra_erp` |
| SCM addon deployed | `18.0.1.6.0` |
| SCM addon in repo | `18.0.1.7.0` worktree change; not yet deployed |
| Traceability | Public `/trace/[lot_code]` exists; 7-layer model defined |
| Data (live snapshot) | 305 suppliers, 0 farms, 6 distilleries, 0 harvests, 0 distillations, 0 QC inspections, 23 stock lots (no lineage) |
| Partner portal | 0 partner access records, 0 submissions, 0 media rows at the queried snapshot |
| Main blockers | Low operational data; SCM UI stub; 1.7.0 requires controlled deployment; GTIN/GS1 prefix unknown |

Counts are a point-in-time DB query, not a permanent guarantee; repeat the read-only
query before planning any live operation.

## Locked decisions

| Decision | Owner choice / rule |
| :--- | :--- |
| Editor | Antigravity desktop App/IDE, Windows 11 |
| Remote development | Connect via SSH to the host repository; do not migrate the repo to a second machine unless the owner changes this choice |
| Credentials | Keep actual secrets only in `.env.local` (mode 600); `.env.example` contains names and safe placeholders only; never put credential values in Git or docs |
| `.agents/` | Include workspace files in the project repository |
| Skills | Install all previously installed/profile skills into workspace, plus a curated project skill set; keep source attribution and collision map |
| MCP | Add project MCP configuration; limit powerful servers/tools with least privilege; secrets via environment, never literals |
| Documentation language | English |
| SCM | First detailed feature specification; HRM, WMS and other pillars follow as separately reviewed documents |
| Commits/pushes | Require separate explicit owner approval before each commit or push |

## Recommended waves

| Wave | Scope | Gate |
| :--- | :--- | :--- |
| 1 | Canonical agent docs + SCM requirements + standards | Owner reviews docs and approves before workspace config |
| 2 | `.agents/rules`, MCP config, skills registry and validated skill installs | Diff review; do not expose credentials |
| 3 | Antigravity SSH account and Windows 11 SSH client setup | Atlas executes/hardens host changes; connectivity and UID test |
| 4 | SCM UI implementation plan and tests | Separate feature approval, no production deployment |
| 5 | HRM/WMS/etc. mapping | One pillar per document/review cycle |

## SSH/remote editor safety gate

Earlier probing found host repo ownership UID `10000` while code-server runs as UID
`1000`. A new SSH login must be tested for write compatibility without recursive
`chown` or altering active repo ownership. Atlas must design the UID/GID mapping,
key-only account, and sshd hardening; verify that Antigravity can edit the same repo
without code-server permission regressions before calling SSH access ready.
