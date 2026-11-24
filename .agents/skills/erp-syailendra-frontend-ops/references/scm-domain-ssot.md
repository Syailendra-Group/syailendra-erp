# SCM Domain SSOT & Agreement Check

Use this reference when planning or changing SCM master data, forms, routes, menus, or operational modules. It is a digest, not a replacement for the source documents; verify decisions against the latest sources before implementation.

## Read these sources first

- Repo business SSOT: `docs/scm/2026_SG_Sistem Traceability_Essential Oils Carrier Oils & Others.docx`.
- Relevant operating procedures: `docs/traceability/2026_09_SBI_MANUAL OPERASIONAL & STANDAR PROSEDUR OPERASIONAL (SOP).docx` and `docs/traceability/2026_09_SBI_SOP END-TO-END PROCUREMENT, PURCHASING, RECEIVING, UNBOXING, QC, DAN AFTER-SALES.docx`.
- Vault decisions: discover the latest approved supplier-alignment, upstream-operations, and menu plans under `Projects/Syailendra/ERP-Syailendra-Group/Docs/`; compare them with `Architecture/04_Traceability_Features_and_Sidebar_Architecture.md` rather than treating an older plan filename as current approval.
- Search session history for the latest owner-approved menu/model decisions when asked to restructure; classify each as locked, superseded, or still open.

Current routes and code are evidence of implementation, not proof of current design intent: earlier SCM screens may encode a concept already superseded by the business SSOT or a later owner decision. Correct a proposal explicitly when those sources disagree.

## Non-negotiable model boundaries

- **Supplier Master is unified** on `res.partner`; Petani, Penyuling, Pengepul, Koperasi, Kelompok Tani, UMKM, and Perusahaan are values of Jenis Supplier, not separate master entities or independent supplier tables.
- **Jenis Supplier** is the flat managed master `syailendra.supplier.type` (`ST-####`, `name`, `description`, `sequence`, `active`), linked from `res.partner.supplier_type_id` (Many2one). It is cross-company and archived rather than permanently deleted.
- **Kategori Pemasok** remains hierarchical `res.partner.category`, used for procurement/product grouping. It is a different axis from Jenis Supplier; never pass IDs from one model into the other's field. Category-name prefixes also feed supplier-ref import rules, so do not flatten or rename them without auditing importer/seeder consumers.
- `syailendra.farm` is a separate asset owned by one supplier; one supplier can own multiple farms. `syailendra.distillery`, `syailendra.crop`, and `product.template` are related supporting masters, not alternate supplier identities.
- **Four things named "petani/farmer" must never be conflated** when scoping a change:

  | Name | What it actually is | Fate |
  | :--- | :--- | :--- |
  | `Petani` | A **value of Jenis Supplier** on the unified supplier | Stays |
  | `syailendra.farm` (Kebun & Lahan) | The **asset** a supplier owns; harvest and distillation hang off it | Stays |
  | Legacy `/scm/farmers` feature | A **second UI over `res.partner`**, filtered by supplier category `1.1 Perorangan Petani`; no `syailendra.farmer` model ever existed | Retired — see the removal rule below |
  | `farmer` in `syailendra.partner.access.role` / submission kinds | A **portal workflow marker**, not an identity or an authorization | Stays |

  Read an owner sentence like "petani sudah tidak dipakai, hapus" against this table before acting: it can mean the dead feature, the supplier value, or the asset, and the wrong reading deletes a master the harvest chain depends on. Ask which one when the sentence does not disambiguate — and never delete `syailendra.farm` on it.
- **A supplier-owned asset is not a petani-only asset.** Farm and distillery owner selects read the **whole active Supplier Master**, with Jenis Supplier shown as the option description. Filtering owner options down to `Petani`/`Kelompok Tani` silently excludes cooperatives, UMKM and companies that legitimately own a kebun, and `syailendra.harvest` enforces `farm.partner_id == partner_id`, so a mis-sourced owner breaks the operational chain rather than a label. Before relying on the type column as a filter or a label, count how many suppliers actually carry `supplier_type_id` — an unclassified master makes the filter return almost nothing while looking correct.
- **Media and supporting documents use one generic model, `syailendra.media`** (`res_model`, `res_id`, `kind` = image|document, `role` = profile|gallery|facility|product|certificate|legal|other, `sequence`, `image`, `document`, `mimetype`, `file_size`, `caption`, `alt_text`, `company_id`). It serves supplier, farm, distillery and product at once; do not create `syailendra.farm.image`-style per-entity tables. `image` is a `fields.Image(attachment=True)` and `document` a `fields.Binary(attachment=True)` so both live in the filestore; constrain `kind`→payload and `kind`→mimetype (JPEG/PNG/WebP for images, PDF only for documents) in the model, and ship ACL for scm user/manager/api plus a company record rule. The native single-image columns (`res.partner.image_1920`, `photo_farm`, `photo_distillery`, `product.template.image_1920`) stay as the primary/cover photo — the media model holds the gallery and attachments.
- Use current backend fields as the form contract; consult the business docs for any additional fields still missing from the frontend (for example Supplier Audit/CAPA and rating detail).

## Supplier form and source-mapping procedure

1. Read the complete source sections before assigning fields to screens. Supplier identity, contacts, tax identifiers, ownership/PIC, joining year, and business status belong to Supplier Master. Production-site GPS, area, cultivation, equipment, and photos belong to the appropriate farm/distillery assets; a supplier address coordinate does not substitute for a farm's origin coordinate.
2. Model products supplied and production capacity at their actual cardinality. A supplier may have multiple products and facilities, so do not compress product-specific MOQ/lead time or site capacity into one unexplained supplier value. Keep batch events, QC, purchases, certificates, audits, and performance records in related models; show verified summaries/links on the supplier page.
3. Profile the Accurate export using its real header row and supplier identifier. Record source nonempty counts and unique identifiers separately from matched Odoo rows. Distinguish available source data, already imported values, candidate enrichments, ambiguous matches, and information requiring manual collection. Use the `odoo-data-backfill` source-reconciliation recipe before proposing apply counts.
4. Keep procurement category, supplier actor type, legal company/person type, business supplier status, and archive visibility separate. An imported row is not automatically an active supplier, and a category name alone does not prove legal entity type. Resolve contradictory policies and counts before writing.
5. Keep NPWP and NIK distinct and string-valued. Preserve the taxpayer name independently of owner/PIC names. If an approved temporary metadata home is used, preserve its complete envelope; do not silently present it as a dedicated backend field.

### Verify the composed partner model

Query the live registry read-only before concluding that a field needs an addon change:

```sql
SELECT name, ttype, relation
FROM ir_model_fields
WHERE model = 'res.partner'
  AND name IN (
    'city', 'city_id', 'district_id', 'subdistrict_id',
    'address_detail', 'address_benchmark',
    'partner_latitude', 'partner_longitude'
  )
ORDER BY name;
```

Then call `fields_get` for the same field names with attributes `type`, `relation`,
`readonly`, and `required`, followed by a bounded `search_read` using the app identity
and company context. Registry presence establishes metadata, not that the app may
read/write the field. Trace definitions across addons when interpreting behavior.

The regional addon extends `res.partner`: `city_id` targets `res.country.city`
(kabupaten/kota), `district_id` targets `res.country.district` (kecamatan), and
`subdistrict_id` targets `res.country.subdistrict` (desa/kelurahan). Verify these
relations on the target deployment; do not infer them from English labels or invent
`sub_district_id`/`village_id` aliases from an old frontend interface. Many2one is not
Many2many: its RPC read value is an ID/name pair or false, while writes use an ID or false.

### Audit address-component side effects before reuse

- Read both props and change handlers. The shared address component's `zip_code`
  is a UI contract, while partner persistence uses `zip`; map names explicitly.
- Preserve imported `street` separately from `address_detail` and
  `address_benchmark`. A selector that copies a village label into `street` can
  overwrite a complete Accurate mailing address; reuse requires an adapter or
  an explicit behavior option, not a blind prop rename.
- Treat regional centroids as map-navigation hints until a precise supplier/site
  location is confirmed. Do not silently persist a province centroid as real GPS.
- Clear descendant region IDs when a parent changes, persist those clears, and test
  the reloaded hierarchy. Preserve city text when a catalog match is unresolved;
  catalog options loading late must not erase an existing value.

## Agreed navigation shape

The recovered owner-approved structure has five groups:

1. Ikhtisar & Monitoring: Overview.
2. Mitra & Origin: Supplier as the first standalone menu, then Kebun & Lahan, Fasilitas Penyulingan, and Produk Atsiri; a supporting Master Data dropdown for Jenis Supplier, Kategori Pemasok, and Tanaman & Komoditas.
3. Operasional Rantai Pasok: Sesi Panen, Batch Penyulingan, Penerimaan Pembelian, QC, and Master Batch.
4. Keterteusurusan: Genealogy, QR labels, Mock Recall, plus the three SCM reports (genealogy,
   yield, QC) merged into this group.
5. Kepatuhan & ESG: Supplier evaluation, audits/CAPA, document vault, and export compliance.

Sidebar sizing is an owner preference: submenu and icon-mode dropdown items render larger than
shadcn defaults (`h-9 px-3 text-sm gap-2.5` on `SidebarMenuSubButton`, `min-w-64` dropdown
content, `py-2.5 text-sm` items) — apply it whenever touching `nav-group.tsx`.

Do not add a standalone Petani master menu without a new owner decision. Locked owner decisions
on the previously open choices: retire the legacy `/scm/farmers` feature (Petani data is reached
through the Supplier page filtered by Jenis Supplier = Petani; remove the menu entry first,
delete the feature once that filter exists), reports merge into the Keterteusurusan group
instead of forming a sixth group, and Produk Atsiri lives under **Mitra & Origin** at the
`/scm/products` route (renamed from `/scm/materials`, which now answers a permanent 308
redirect). Reopen any of these only with a fresh owner decision.

### Retiring a legacy feature: "menu removed" is not "feature deleted"

A retired menu entry leaves the route fully reachable by URL. Before telling the owner a
feature is gone — or that deleting it is still pending — enumerate all eight surfaces:

1. Route pages under `src/app/[locale]/(dashboard)/<pillar>/<feature>/**`.
2. `src/features/<pillar>/<feature>/**` (columns, table, dialogs, form, detail).
3. The feature context in `src/contexts/<pillar>/`.
4. Service, server action, Zod schema, hook, and type under their layer directories.
5. The i18n namespace file in both locales **plus its two imports and map entries in `src/i18n/request.ts`**.
6. Both `nav.json` blocks per locale — `items.*` and the route-key block that breadcrumbs read. A route whose `items.*` entry is gone still renders a breadcrumb label from the route-key block when opened directly.
7. Any redirects, allowlists, command-menu entries, or `revalidatePath` calls naming the route.
8. Cross-feature types that borrowed its vocabulary (e.g. `farmerName`/`farmerCode` on harvest, which actually carry the supplier's name).

Deleting 1–8 is a frontend-only change. **Ask before adding a redirect, and expect a refusal:**
this owner chose a plain deletion for the retired route, accepting that an old bookmark lands on
`404`. Offer the redirect as an option, record the answer in the plan, and never add one
unrequested — but do not treat the resulting 404 as breakage either. Delete the code **after**
the replacement filter exists, never before — otherwise the data has no home while the pages are
gone. Prove orphan status first (`grep -rn` the feature path across `src`) so the deletion does
not take a live consumer with it, and never delete the procurement category that fed the retired
master (`1.1 Perorangan Petani` drives the importer's `SUP-*` ref rules).

## Backend feasibility checks before promising a route

- Check installed addon version in `ir_module_module` and the model in `ir_model` before relying on a new model; a repo model can be absent from the deployed database until addon upgrade.
- `syailendra.harvest`, `syailendra.distillation`, and `syailendra.qc.inspection` are custom Odoo models; verify live fields/methods and record counts before claiming an operational module is ready.
- Odoo CE has `purchase.order`, `stock.picking`, `stock.lot`, and `mrp`; `quality_control` is Enterprise-only. The custom QC inspection model and quarantine stock locations provide the CE path.
- Distillation state-transition/lot-issuance behavior is a separate backend decision if the model has no transition method; do not infer it from a frontend state field.

Counts, addon versions, and menu decisions can change. Re-query live data and reread the latest plan/session before using historical numbers or treating any open choice as settled.