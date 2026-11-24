# Component render harness (verify a form without credentials)

Use when a document-driven form must be proven to render, validate, and bind values
while no authorized UI session exists — or after a refactor of its sections, when
only a real DOM reveals a broken import, a missing i18n key, or a dead cascade.

A green typecheck cannot see any of that; a build proves compilation only.

## Shape

```text
real feature entry (form/index.tsx)
   └─ esbuild bundle, jsx automatic, iife, platform browser
        ├─ data hooks          -> fixtures ({data:[...]})
        ├─ next/navigation     -> router + Link stub
        ├─ next/image, leaflet -> inert stubs
        └─ ui primitives       -> real files (must render for real)
   └─ bundle.js + index.html served over HTTP -> headless browser -> DOM assertions
```

The harness banner printed by the bundler (`explicit mocked … boundaries; no production
access`) is the statement of scope: no credentials, no production rows, no seeded data.

## Procedure

1. Copy `templates/component-render-bundle.mjs` into the host `.scratch/` directory and
   edit its CONFIG block (entry path, message namespace, real-component whitelist, hook
   stubs). It lives outside the repo on purpose — the harness is tooling, not a deliverable.
2. Run it where node exists (inside the project container, `/opt/node/bin` on PATH):
   `node .scratch/component-render-bundle.mjs <repoRoot> <outDir> > /tmp/bundle.log 2>&1;`
   capture the exit code on the next statement, not after a pipe.
3. **Rebuild after every source edit** to the feature. The bundle is a snapshot; asserting
   against a stale bundle is the easiest false PASS in this whole workflow.
4. Copy `bundle.js`, `index.html`, and `bundle.css` to the machine that owns the browser,
   serve them (`python3 -m http.server <port> --directory <dir>`) and open `http://127.0.0.1:<port>/index.html`.
   Keeps the harness off any public origin and needs no tunnel.
5. Drive the page with DOM queries: tab walk (text + control count per panel), empty submit
   (assert the required-message set and which tab took focus), region cascade (each child
   disabled until its parent holds a value), valid submit (inspect `window.__writes`), then
   `?mode=edit` with a synthetic record (readonly business key, code display, bound values
   per tab). Capture a screenshot as the human-readable artifact.

## Stub boundaries

| Boundary | Replace with | Because |
| --- | --- | --- |
| Query hooks (`@/hooks/**`) | `export function useX(){return {data:[fixture]}}` | no Odoo session, deterministic rows |
| Mutation hooks | `mutateAsync` pushing to `window.__writes` | proves submitted payload without a write |
| `next/navigation` | router stub (`push/replace/refresh/back`), `Link` → `<a>` | router context absent outside Next |
| `next/image` | plain `<img>` / text fallback | needs the Next image loader |
| map library + MapPicker | inert `<div data-testid="map-boundary">` | canvas/GL and tiles are irrelevant to form logic |
| server actions, services | never imported — log a warning if they appear | a silent import means a real boundary leaked |

## Pitfalls

- **Whitelist drift is the #1 crash.** Any `@/components/**` path not explicitly allowed
  resolves to `export default {}`. Add one shared component (or a new hook it imports) and
  the bundle dies with `No matching export`, whose only visible trace is the
  `Node.js vX.Y.Z` footer. Read the esbuild error list in the log, not the exit status.
- **A pipe eats the exit code.** `node bundler.mjs … | tail -5; echo $?` prints `tail`'s
  status, so a crashed build looks successful. Redirect to a log, capture `$?` immediately,
  then read the log.
- **Inputs may carry only `id`, no `name`.** Shared form-field components often render
  `id="zip_code"` and no `name`; `input[name=zip_code]` finds nothing. Query by id, and for
  React-controlled fields set the value through the prototype setter then dispatch a bubbling
  `input` event — assigning `.value` directly is dropped by React.
- **Tab panels commit asynchronously.** An element read immediately after clicking a tab can
  still return the previous panel. Wait ~1s (or poll until the expected control exists)
  before asserting; otherwise a flaky "missing input" looks like a form defect.
- **Failed submit navigates away from your tab.** Validation focuses the first failing
  section, so cached element handles go stale after every submit — re-resolve queries
  instead of reusing them.
- **Counters in tab labels are error badges.** A label like `Alamat & Lokasi1` means one
  validation error in that section; assert on it, and do not report it as a rendering bug.
- Region/country pickers are combobox buttons, not `<select>`: click the trigger, then the
  `[role=option]` item; assert the next level's `disabled` state flips.

## What it does not prove

- Server actions and the Odoo round-trip — cover that with the RPC probe
  (`scripts/odoo-rpc-probe.mjs`) and the read/write symmetry checks.
- Real query payload shapes, when a fixture is simplified.
- Route-shell hydration, middleware, auth redirects, or anything the Next server owns.
