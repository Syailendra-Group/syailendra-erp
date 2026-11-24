# Supplier reconciliation fixtures and mapping checks

Use this reference when reading supplier spreadsheets or implementing an offline reconciliation planner.

## XLSX parsing procedure

1. Resolve the intended sheet through workbook relationships rather than assuming the first XML worksheet is the business table.
2. Build rows from each cell's coordinate (`A`, `C`, `AA`, etc.), preserving intervening empty columns. Appending only existing XML cells shifts values under the wrong headers.
3. Decode shared strings and inline strings, concatenating all text runs inside the string container. Reading only the first text node truncates rich-text values.
4. Identify the header row explicitly; distinguish blank rows, headers, and valid data rows before reporting counts.
5. Preserve identifier and tax fields as strings. Flag formatting-dependent numeric identifiers for review instead of inventing lost leading zeros.

## Minimum meaningful fixtures

- Sparse row containing cells A and C: column B must stay empty.
- Inline string split into multiple text runs: preserve the complete text.
- Shared-string cell and a column beyond Z: resolve both correctly.
- Missing supplier ID or name: emit a review reason, not a synthetic identity.
- Duplicate source identity: exercise the actual duplicate branch and verify the result schema accepts its reason fields.
- Existing international telephone prefix: normalization must not append a second country code.
- Blank incoming field with a populated target value: propose no destructive overwrite.
- Same input twice: identical reconciliation output, aside from explicitly separate acquisition metadata.
- Repeated API page or duplicate record IDs: terminate with an explicit incomplete/error status rather than claiming full extraction.

## Mapping decisions to make explicit

| Decision | Required evidence |
| --- | --- |
| Source identity | Verified source database identity plus stable vendor ID; a spreadsheet vendor code is not automatically the API ID. |
| Supplier subset | Category rules and computed counts; retain the complete supplier population separately. |
| Odoo company | Approved ownership/sharing rule and accessible companies; do not assign all records to the login user's company by default. |
| Partner roles | Preserve existing customer status and other roles when proposing supplier changes. |
| Region | Actual target field relation and unique catalog match; unresolved names remain review items. |
| Missing attributes | Unknown stays unknown; documentation estimates are not evidence of field observations. |
| Target action | Verified target match before proposing update; no match and complete relevant lookup before proposing create. |

Keep raw fixtures synthetic in the test suite. Store real snapshots privately; summarize their results without publishing personal contact or tax data.
