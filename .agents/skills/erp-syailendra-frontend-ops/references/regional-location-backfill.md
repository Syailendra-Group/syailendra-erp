# Regional location backfill (supplier / farm / distillery)

Use when the owner asks to fill `city_id` / `state_id` for existing records from the
regional master data already in the database, instead of typing locations by hand.

## 1. Establish the source of truth and the gap

Two sources exist and must not be confused:

- `res.partner.city` (char) — free text imported from the accounting export.
- `res.country.city` / `.district` / `.subdistrict` — the curated catalog
  (`syailendra_region`), with `state_id` on each city row.

Measure the gap before promising coverage:

```sql
SELECT count(*) FROM res_partner WHERE supplier_rank > 0;
SELECT count(*) FROM res_partner WHERE supplier_rank > 0 AND city_id IS NOT NULL;
SELECT count(*) FROM res_partner WHERE supplier_rank > 0 AND city IS NOT NULL AND city <> '';
SELECT count(DISTINCT lower(city)) FROM res_partner WHERE supplier_rank > 0 AND city <> '';
```

Export the text values once and do the matching outside SQL — the catalog is only a few
hundred rows and the disambiguation logic is easier to read and re-run in Python.

## 2. Normalize the catalog names, not the free text

Catalog names are prefixed (`Kabupaten Bogor`, `Kota Bandar Lampung`,
`Kota Adm. Jakarta Barat`). Free text is usually bare (`Bogor`, `SOLO`).

```python
PREFIX = re.compile(r'^(kota\s+adm\.?|kabupaten|kab\.?|kota)\s+', re.I)
def norm(s):
    s = PREFIX.sub('', (s or '').strip().lower())
    return re.sub(r'\s+', ' ', s).strip()
def key(s):                      # second chance: ignore punctuation and spacing
    return re.sub(r'[^a-z0-9]', '', norm(s))
```

Keep a short alias map for names the catalog spells differently, and nothing more:
`{'solo': 'surakarta', 'denpasar timur': 'denpasar', 'medan selayang': 'medan',
'gunung kidul': 'gunungkidul'}`.

## 3. Three-way outcome, never a guess

| Outcome | Rule | Action |
| :--- | :--- | :--- |
| Exactly one catalog row for the key | Safe | Set `city_id` and derive `state_id` from that row |
| Two or more (`Kota X` vs `Kabupaten X`) | Ambiguous | Leave NULL, keep `needs_review = true`, list the city in the report |
| Zero matches (foreign, district names, abbreviations) | Unknown | Leave NULL, review flag, list in the report |

Never pick `Kota` over `Kabupaten` (or the reverse) to raise the match count — the owner
asked for the catalog's data, not a plausible-looking guess. Report the split
(`matched cities / suppliers`, `ambiguous`, `unmatched`) before writing anything.

## 4. Generate and apply

Emit one `UPDATE` per resolved city keyed on the normalized text, inside a transaction:

```sql
BEGIN;
UPDATE res_partner SET city_id = 194, state_id = 10
 WHERE supplier_rank > 0 AND lower(btrim(city)) = 'bogor';
-- ...
UPDATE res_partner SET supplier_type_needs_review = true WHERE supplier_rank > 0;
COMMIT;
```

Take a dump immediately before the write (the pre-upgrade dump is not close enough once a
migration has run), and pipe the file with `psql -v ON_ERROR_STOP=1`.

## 5. Verify by counting, then report the residue

```sql
SELECT 'with_city_id', count(*) FROM res_partner WHERE supplier_rank > 0 AND city_id IS NOT NULL;
SELECT 'needs_review', count(*) FROM res_partner WHERE supplier_rank > 0 AND supplier_type_needs_review;
SELECT 'missing', count(*) FROM res_partner WHERE supplier_rank > 0 AND city_id IS NULL;
```

State the residue explicitly (rows with no city text at all, ambiguous cities, foreign
entries) instead of implying full coverage. Only `city_id` + `state_id` are derivable from
the city catalog; `district_id` / `subdistrict_id` need a street-level match and stay empty
until someone verifies them.