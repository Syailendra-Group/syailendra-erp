# Source-to-target reconciliation for ERP enrichment

Use when enriching existing Odoo records from an accounting spreadsheet or another
system while completing their edit forms. This is a verification contract, not a
claim that a particular migration script or metadata codec has already passed it.

## 1. Establish source coverage

- Inventory the requested documents and workbook sheets. Extract complete relevant
  sections and table cells; record unreadable or partially read material explicitly.
- Locate the actual workbook header, then identify data rows by the source key rather
  than a fixed first-row offset or the presence of a name alone. Exclude titles,
  repeated headers, totals, and blank rows explicitly.
- Handle XLSX shared strings, inline strings, and numeric cells. Keep identifiers,
  phone numbers, postal codes, NPWP/NIK, and account numbers as strings; flag numeric
  cells whose original leading zeros cannot be recovered reliably.
- Report nonempty values per column, unique source IDs, duplicate IDs, and source
  row count. Print aggregates and redacted examples, not personal tax/account data.
- **Profile the identifier shape before writing the extraction regex.** Accounting
  exports use alphanumeric IDs; a numeric-only pattern matches nothing on an intact
  dataset and looks exactly like lost provenance. Sample the raw identifier column
  (redacted) and assert the join buckets — matched, source-only, target-only,
  duplicate — before trusting any per-field count.

## 2. Join records before assigning targets

- Resolve an explicit source identifier from stored provenance or the existing
  integration mapping. Do not silently join by supplier name or row position.
- Partition source and target rows into unique matches, duplicate/ambiguous matches,
  source-only, and target-only. Report archived and company scopes separately.
- Calculate every enrichment target on the uniquely matched subset. A populated
  source column is an upper bound, not the number of Odoo rows safe to update.
- Verify backend field types and existing importer mappings. An empty `mobile`
  column does not prove a phone number was never imported; inspect `phone` and the
  importer before reclassifying or moving values.
- Resolve region lookups with **type-aware keys** (Kota vs Kabupaten) and scope the
  city by the already-resolved province. A map that strips the type prefix merges two
  real rows and reports mass ambiguity; a bare-name fallback is acceptable only when
  exactly one candidate survives the province filter.

## 3. Produce a per-field plan

For each proposed change capture source ID, target ID, field, prior value, proposed
value, evidence/source column, and decision reason in a protected artifact.

| Current target/source relationship | Decision |
| --- | --- |
| Empty target, unambiguous supported source | Candidate fill |
| Equal values after justified normalization | Skip as already current |
| Nonempty conflicting target | Preserve and request review |
| Ambiguous/missing join or catalog match | Leave unchanged; report unresolved |
| No source evidence for the fact | Leave empty/pending; collect manually |

Use separate decisions for each field. A classification review flag does not confer
permission to overwrite a manually corrected phone, address, or tax identifier.
Before apply, compare current values with the planned before-values; defer changes
that have drifted. Preserve zero/false when they are meaningful values, and distinguish
missing, empty, zero, and Boolean defaults in completeness reports.

For phone/mobile separation, verify the exact source columns for the matched row.
Copying an evidenced mobile number and clearing an existing phone are separate
changes; clear only when its provenance and unchanged value justify it. Keep NPWP,
NIK, taxpayer name, owner name, and PIC independent.

Strip trailing free-text notes from contact values before proposing them
(`+62 … (Lama)`, `+62 … (PIC name)`), but preserve leading parenthesised area codes
(`(0271) 717417` is a valid number, not an annotation). Report the stripped count in
the plan instead of writing the note into the phone field.

Keep archive state separate from business status. If approval specifies an activity
policy, calculate its eligible matched population rather than assuming every import
row is a current active supplier. Require mutually exclusive counts to reconcile.

## 4. Preserve metadata and provenance

- Classify actual storage shapes: raw JSON object, HTML-wrapped JSON, legacy HTML or
  plain notes, malformed JSON, and non-object JSON. Preserve unsupported shapes as
  source evidence rather than dropping them on parse failure.
- Merge editable keys into the complete latest stored object. Rebuilding metadata
  from a restricted form record drops unexposed keys, even when `provenance` survives.
- Keep exact raw legacy content in a protected snapshot before conversion; display
  provenance as escaped text, not trusted HTML. If the chosen storage is an Odoo HTML
  field, test its sanitization/encoding path with ampersands, quotes, Unicode,
  angle brackets, and nested unknown keys. Plain `JSON.stringify` is not proof of a
  lossless storage round-trip.
- Do not let an unrelated edit persist invented defaults such as COD, verified actor
  type, compliance=true, or a guessed country into previously unknown records.

## 5. Verify the complete write path

1. Run pure planning/codec tests, including missing IDs, duplicate IDs, conflict
   preservation, unknown nested metadata, malformed input, and clear-vs-omit behavior.
2. Dry-run against a protected read-only export; reconcile proposed updates/skips/
   reviews and totals by field, company, and archive state.
3. Exercise the real ORM read/write/read path on an authorized disposable target;
   verify metadata survives Odoo serialization and dependent region IDs clear correctly.
4. Re-run the plan after apply and confirm no unintended further updates; test rollback
   only for rows whose current value still equals the recorded applied value.
5. Report prepared, dry-run validated, applied, and verified separately. Never substitute
   an offline function test for the runtime/ORM test or a source count for an apply count.
