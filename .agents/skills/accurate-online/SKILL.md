---
name: accurate-online
description: "Use when integrating or migrating Accurate Online data."
version: 1.2.0
author: Kael (Octa Hub)
license: MIT
metadata:
  hermes:
    tags: [accurate, accurate-online, cpssoft, accounting, odoo, erp, migration, api]
    category: software-development
---

# Accurate Online Integration & Reconciliation

Use this workflow to inspect, reconcile, and migrate Accurate Online data into an ERP such as Odoo. Keep extraction, planning, and database application as separately authorized operations.

## 1. Establish scope and evidence

1. Read the user's current approval, project documentation, existing integration code, and Git status. Preserve unrelated changes.
2. During plan-only requests, inspect and research without changing code, configuration, or databases. Treat skill installation as a change unless separately authorized.
3. After approval, complete the authorized read-only reconciliation and local tooling without repeatedly requesting the same permission. An approval to reconcile does not authorize import, module upgrades, purge, commit, or push.
4. Resolve the actual target from current runtime configuration and verify its version and database; historical deployment notes may describe a previous host.
5. Inspect credential names and file permissions without displaying values. Keep raw supplier snapshots private and outside version control; reports should contain aggregates or redacted examples.

## 2. Verify the authentication contract before connecting

1. Consult official Accurate documentation: https://accurate.id/api-integration/ and its linked authentication/API examples. Developer documentation may require authorized login.
2. Identify the credential flow actually provisioned. Do not assume every credential called `API_TOKEN` is an OAuth access token, or that every integration requires the same database-session flow.
3. Verify the documented meaning of app key, database ID, token, signature secret, timestamp, and session before constructing requests. **Never substitute `ACCURATE_APP_KEY` for `ACCURATE_DB_ID` merely because the latter is absent.** Variable names and nonempty values do not establish interchangeability.
4. For a documented OAuth/session flow, verify the current database-opening URL and use the returned host/session as specified. For a token/signature flow, verify the exact signing input, algorithm, timestamp format, and headers from authoritative documentation before implementing it. Do not guess these from an unrelated integration.
5. Confirm source database/company identity with a minimal documented read request before extracting business records. Record failures without dumping request headers, tokens, or raw exceptions that may expose secrets.

## 3. Extract a complete, attributable snapshot

1. Verify endpoint base paths, supported fields, filtering, and pagination parameter names for the chosen API contract; do not assume bare `page`/`pageSize` or blindly concatenate `/accurate` and `/api`.
2. Fetch every required page with bounded timeouts and retries appropriate for read requests. Detect repeated pages and duplicate source IDs to prevent loops or silent truncation.
3. Compare collected unique IDs against the API's reported total when available. Otherwise state the termination evidence and completeness limitation explicitly.
4. Preserve raw source values, retrieval time, source database identity, and source record IDs. Retrieve details only where necessary for the approved mapping.
5. Distinguish the complete supplier population from business subsets such as farmers/distillers. Compute category counts from the collected data rather than conflating a subset count with the overall total.

## 4. Inspect the target and reconcile before applying

1. For Odoo, authenticate using configured credentials and allowlist read operations such as `fields_get`, `search_count`, and `search_read`. Inspect partner fields, categories, region relations, companies, and relevant existing records.
2. Label counts with the account/company visibility under which they were obtained. Use `active_test=False` when archived records are part of duplicate detection.
3. Match on a verified stable source identity scoped to its source database. Treat source code and numeric API record ID as distinct until their relationship is verified. Use names only to suggest manual review.
4. Do not use free-text `comment` as the sole idempotency key. Specify a dedicated source-identity field or mapping with an appropriate uniqueness constraint before a future import.
5. Classify records as matched, changed, source-only, target-only, duplicate, or ambiguous. Do not claim `create` or `update` is established when the target has not been inspected.
6. Keep missing/duplicate identities and ambiguous region/company mappings in `review`; never invent names, IDs, geography, farm area, commodities, or cultivation methods to make a record pass.
7. Preserve existing nonempty target values when source values are blank unless an explicit clearing rule is approved. Do not reset customer roles while importing suppliers, force company ownership, or label every supplier with a farmer-specific prefix.
8. Keep NIK and NPWP as strings with distinct meanings. Validate before transforming; do not coerce to numbers or copy tax identifiers into general comments. Normalize phones conservatively without duplicating country codes, retaining the raw value for audit.
9. If legitimate legacy gaps conflict with required fields, propose a scoped schema decision. Do not globally weaken validation simply to pass an import.

## 5. Deliver a tested planner and stop at the agreed gate

1. Keep the offline planner separate from network extraction and database application so its read-only behavior is reviewable.
2. Test sparse XLSX columns, rich/shared strings, missing IDs, duplicates, normalization, deterministic output, pagination termination, and API failures as applicable. See [Supplier reconciliation fixtures](references/supplier-reconciliation.md).
3. Report actual executed checks, extraction completeness, counts by reconciliation outcome, unresolved mappings, and artifacts. Distinguish completed checks from delegated or pending work.
4. Produce proposed backend changes only after reconciling the data with the live schema. Obtain the separately required approval before writes, upgrades, destructive cleanup, commit, push, or deployment; do not treat a proposed action file as authorization to apply it.
