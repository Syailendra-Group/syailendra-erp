---
trigger: glob
globs: "addons/**, src/services/odoo/**"
description: Odoo 18 Community addon and JSON-RPC integration rules.
---

# Odoo Backend Rules

- Target Odoo 18 Community APIs; verify behavior against installed source or official
  18.0 documentation instead of assuming Enterprise features (for example,
  `quality_control` is not available).
- Use the ORM for application reads and writes. Reserve raw SQL for reviewed migrations
  or administrative scripts.
- Operational lists must paginate and filter server-side (`search_count`,
  `search_read`); never load an unbounded record set.
- Every new model requires ACL entries and company record rules; default to least
  privilege and keep public access closed.
- Avoid `sudo()`; when unavoidable, scope the recordset and justify it in a comment.
- Enforce business invariants in model constraints and state-transition methods, not
  only in UI validation.
- Traceability records are never hard-deleted: use archive or an approved reversal that
  preserves lineage and audit history.
- The quarantine gate is implemented with stock locations/routes plus the project QC
  model; pending or rejected lots must not be reservable or consumable.
- Bump the addon version and add a migration when data or schema changes; deployment is
  a separately approved action.
