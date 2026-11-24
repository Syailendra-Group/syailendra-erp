---
trigger: model_decision
description: Commit, deploy, migration, and coordination policy including shared-worktree handling.
---

# Collaboration and Approval Policy

- This is a shared worktree: before editing, run `git status` and preserve changes that
  are not yours. Never stage or revert another actor's work.
- Present a diff summary plus gate results, then wait for explicit approval before each
  `git add`, `git commit`, or `git push`.
- Production Odoo addon deployment, module upgrade, database migration, data purge,
  credential rotation, and infrastructure change each require explicit approval naming
  the exact action.
- Coordinate host-level and shared-infrastructure work with the infrastructure
  specialist instead of changing hosts directly.
- Prefer isolated verification (temporary addons path, scratch database or clone) over
  touching production paths.
- Record durable decisions and execution reports in the Obsidian vault under
  `Projects/Syailendra/ERP-Syailendra-Group/` and `Profiles/octadev/`; keep the
  repository documentation updated when behavior or contracts change.
