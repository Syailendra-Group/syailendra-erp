# Modal (ActionDialog) → Dedicated Page Conversion Checklist

When a CRUD feature outgrows its modal, convert in this order; every step keeps the build green.

1. **Form:** rework `form/index.tsx` from `{ currentRow, onSuccess, onPendingChange }` to
   `{ initialData }`; drop the `useEffect(onPendingChange)` bridge; keep `defaultValues`
   built from `initialData` (or `values:` when the record loads async) and
   `router.push('/<entity>')` on success instead of calling `onSuccess()`.
2. **PillTabs sections:** wrap the existing section components in `<PillTabs>` plus a
   `role="tabpanel"` div keyed by `activeSection`; keep `shouldUnregister: false` so fields
   in unvisited tabs still submit. Section ids live in a `SECTION_IDS` const array with a
   `labels` record — never inline the tab list.
3. **Routes:** add `create/page.tsx`, `[id]/edit/page.tsx`, `[id]/page.tsx` (detail). Edit
   and detail pages are server components: `Number(id)` guard → `notFound()` →
   `get<Entity>ByIdAction(id)` → render the feature component.
4. **Context handlers:** replace `setOpen('create'|'edit'|'view')` with `router.push(...)`
   (`useRouter` from `@/i18n/navigation`); keep only the archive/restore dialog state.
5. **dialogs.tsx:** delete the ActionDialog form and view dialog; keep the ConfirmDialog.
   Mind the actual props API — this codebase's ConfirmDialog takes `desc` (not
   `description`), `handleConfirm` (not `onConfirm`), and `cancelBtnText` (not
   `cancelText`), plus `isLoading`/`destructive`.
6. **Detail feature `detail/`:** PageHeader (back + Edit LinkButton + mono ref badge) →
   `SummaryCardGrid` → `SectionCard`s of `<DetailRow mono>` → address block.
   `DataBadge`/`StatusBadge` take `children` + `variant`
   (`success|warning|destructive|neutral|info|primary`) — never `label`/`tone` props; read
   the component source (`grep -n 'interface .*Props'`) before writing JSX against it.
   - **Address block = `<AddressCard>` beside `<LocationMapCard>` in one grid**, never a
     text `DetailRow` row of raw coordinates: `grid grid-cols-1 items-start gap-4
     lg:grid-cols-2`. `LocationMapCard` takes optional `latitude`/`longitude` and already
     suppresses the map when both are `0`/absent (`hasCoords`), so unmapped records still
     render. `farmers/detail` is the reference implementation.
   - **One address per page.** When the detail orchestrator and one of its cards both render
     `AddressCard`, the page shows the address twice — grep `AddressCard` across
     `detail/*.tsx` before adding the map and consolidate into a single full-width row.
7. **Delete the retired modal state, not just the JSX.** Removing the view `ActionDialog`
   while `context.handleView` still calls `setOpen('view')` leaves a dead branch that looks
   like a working action and does nothing. Convert `handleView` to
   `router.push('/<entity>/<id>')`, drop `'view'` from the dialog-type union, and keep only
   archive/restore state.
8. **i18n:** add tab labels and detail keys to BOTH locales, then run the parity sweep
   (flatten both key trees, diff the sets) — a missing key only surfaces as a raw key in
   the rendered UI, never as a build failure.
9. **Delete superseded files** (old section components, duplicate local field components)
   and re-point imports at the shared `@/components/form/*` equivalents — but verify a
   "duplicate" is truly equivalent before deleting it: a local `number-field.tsx` may
   export an entity-specific component (`DistilleryNumberField`) that several sections
   import by name; grep the export name across the feature first, or the build breaks
   three files at once.
10. **Loading state is part of the conversion.** An edit page that renders a bare
    `Loader2` spinner keeps the old modal feel and violates the layout-mirrored skeleton
    rule. Ship `skeleton.tsx` in the feature root mirroring PageHeader, the PillTabs row,
    and the section grid (field column + map/coordinate column for an address section)
    with `aria-busy="true"`, and render it from the edit page while the record query loads.
