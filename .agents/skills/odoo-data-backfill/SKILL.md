---
name: odoo-data-backfill
description: "Use when backfilling existing Odoo records safely."
version: 1.0.0
author: "Octa Hub / Kael"
license: MIT
platforms: [linux]
metadata:
  hermes:
    tags:
      - odoo
      - data-migration
      - backfill
      - classification
      - idempotency
      - rollback
---

# Odoo Data Backfill & Classification

## When to Use

Use when a script must assign existing records a value that did not exist before — a lookup (Many2one to a new master), a type, a status, a review flag — across a populated production table. Also use when re-running such a script after the team has started correcting rows by hand.

This is **not** a `migrations/` script: those run once, inside the module upgrade, with no operator in the loop. A backfill runs against live data, more than once, and must be safe to re-run.

## Contract (every backfill script)

1. **Dry-run by default; `--apply` to write.** Print a plan summary and write an artifact. Writing is never the default path, so a first run cannot damage data by accident.
2. **Resolve addon-owned lookup rows by external ID.** Query `ir.model.data` for `module='<module>'`, `model='<model>'`, and read `res_id`. For imported catalogs without XML IDs, use a verified unique official code plus its parent/company scope; leave ambiguous matches for review. Never hardcode database IDs or resolve by an unqualified display name, because IDs vary across databases and names are mutable.
3. **Assert the catalog is complete before writing anything** — expected row count, every record `active`, every record carries a code, and the names match the intended set. A half-loaded catalog otherwise misclassifies the entire dataset while every individual write looks fine.
4. **One artifact per apply, never a fixed filename.** A constant path overwrites the previous snapshot, which is exactly what a later rollback needs. Timestamp it (`_<UTC stamp>.json`) and roll back from the newest, or from an explicitly passed one.
5. **Never rewrite a row a human has touched.** See the guard below.
6. **Keep the mapping pure and I/O-free** so it is unit-testable offline and replayable against a read-only export of live rows before anything is written.
7. **Rollback only reverts rows still holding what the script wrote.** Compare the current value against the recorded new value and skip on mismatch, so an edit made after the migration is never overwritten.

## Source-driven enrichment before classification

When aligning forms/data with an accounting export, complete the source-to-target
reconciliation before planning writes. Preserve source identifiers and unknown
metadata, distinguish source availability from matched target rows, and leave
unsupported facts empty or pending. Never infer business activity, ESG compliance,
or human verification merely from a row's presence or a backend Boolean default.
Follow `references/source-reconciliation.md` for the ordered procedure and acceptance
checks. Do not extrapolate the classification guard below to unrelated contact/tax
fields: those need per-field conflict checks and before/after values.

## The human-edit guard

The single most damaging failure: a second run silently reverts corrections the team made between runs. Make the per-row decision a pure function so the guard is explicit, testable, and impossible to bypass:

```python
def plan_action(previous_value, previous_flag, new_value, new_flag):
    """A row that already carries a value and is NOT flagged for review has
    been verified by a human: skip it forever."""
    if previous_value and not previous_flag:
        return 'skip', 'human_verified'
    if previous_value != new_value or previous_flag != new_flag:
        return 'update', None
    return 'skip', 'already_current'
```

Two design notes that make this work:

- The flag must mean *unverified*, so the form that lets people verify a row clears the flag **and** writes the value in the same save. If the UI writes only the value, a later run cannot tell a human choice from a policy default.
- Distinguish `already_current` from `human_verified` in the artifact. Both are skips, but only one means "a person decided this" — that difference is what you report.

## Verify before writing

Export the decision inputs read-only (`BEGIN TRANSACTION READ ONLY;` plus an aggregate of the columns that drive the decision), then run the **pure** function over that export locally:

- Assert counts **per bucket**, not just the total. A matching total hides a wrong distribution.
- Assert the first-run action counts (everything pending) and the re-run counts (everything `skip`). A correct script is idempotent by construction.
- Assert the review-flag split matches what you promised the owner.

Doing this before the first write turns a risky data change into a reviewed spreadsheet.

## Lookup tables: a many2many does not protect the row

Deleting a master/lookup record that other records point to through a **many2many succeeds**: the relation rows are removed and every referencing record silently loses the link. No `IntegrityError` is raised, so a "still referenced" error translation in the service layer is dead code — it will never fire for that model.

The same holds for a many2one with `ondelete='set null'`. Only `ondelete='restrict'` blocks it.

If permanent deletion is offered at all, compute the real usage count and show it in the confirmation ("used by N records"), and keep archive as the default path. Never rely on a foreign-key violation to protect data it does not guard.

## Pitfalls

- A flag that defaults to `False` cannot distinguish "never classified" from "human-verified" on the first run. Either treat a set value + clear flag as the verified signal (as above), or add a separate `reviewed_at`/`reviewed_by`. Decide before the first run, not after.
- `@api.constrains` uniqueness checks that ignore archived rows will block legitimate re-creation after an archive. Search with `active_test=False` and decide deliberately whether archives reserve the name.
- A computed count over another model is fine for a master list, but do not `sudo()` it: `sudo` also lifts record rules, so the number shown exceeds what the user is allowed to see.
- Testing the pure function is not testing the script. The I/O layer (XML-ID resolution, artifact writing, rollback comparison) still needs one real run against a clone database with `--test-enable`.
- **A source identifier is not necessarily numeric.** Profile actual values before writing the extraction regex: accounting exports carry alphanumeric codes (`ABD-DMK`, `V.12345`), and a `\d+` pattern reports "no provenance found" against a fully intact dataset. The symptom mimics data loss, so check a redacted sample of the raw column before concluding the source is missing.
- **Python's `False == 0` breaks emptiness checks on Odoo values.** Odoo returns `False` for an empty char/many2one, and `current in (None, '', False) and current != 0` never fires because `False != 0` is `False`. Every empty target then classifies as a conflict — a dry-run reporting hundreds of conflicts and zero fills is this bug, not dirty data. Use `value is None or value is False or value == ''`.
- **Catalog matching must respect the row type.** Stripping `Kota`/`Kabupaten` from both the source and the catalog collapses distinct rows (`Kota Bandung` vs `Kabupaten Bandung`) and turns resolvable rows into mass ambiguity. Match the typed key first, then the bare name scoped by the already-resolved parent (province), and leave still-ambiguous rows for review.
