---
name: erp-syailendra-frontend-ops
description: "ERP Syailendra frontend ops: build, gates, runtime, release."
version: 1.5.0
author: "Kael (octadev)"
license: MIT
platforms: [linux]
metadata:
  hermes:
    tags:
      - erp-syailendra
      - nextjs
      - build
      - i18n
      - release
---

# ERP Syailendra Frontend Operations

## When to Use

Use whenever working on the ERP Syailendra Next.js app: running quality gates,
building, restarting the demo runtime, wiring i18n namespaces, writing Odoo RPC
service layers, or releasing a frontend build together with an Odoo addon upgrade.

Workflow for the ERP Syailendra Next.js 16 app — repo `/opt/octa/workspace/erp-syailendra`
on host `octa-host`, served at `https://demo.octalectzz.my.id` (Caddy edge → next-server on
port 3000). Coding standards live in `octadev-coding-rules-*`; this skill carries the
environment map, gate sequence, and runtime/release mechanics.

## Shared worktree, attribution and approval batching

Several actors write to this repo daily; `.env.example` and feature trees routinely carry
uncommitted work that is not yours. When a repo-wide gate is blocked by another active
workstream, use the isolated verification recipe in
`references/isolated-worktree-validation.md` instead of repairing or building over their files.

- **Attribute before you revert, apologise, or report scope creep.** Compare the line against a
  pre-change snapshot: `git show HEAD:<path>` for a committed baseline, or the pre-patch archive
  (`/tmp/octadev-backup-*/…tgz`) for work that was already dirty when you started. A domain,
  selector, or mapping that already exists in the snapshot predates your patch — state which
  snapshot proves it and leave the code alone; reverting it undoes another actor's decision and
  is indistinguishable from a regression.
- **Land a multi-file signature change as ONE approved batch.** A tool-approval prompt can expire
  mid-sequence and does not carry over to the next call. When the batch straddles "new helper
  signature" and "its call sites", an expired prompt leaves the tree non-building with no way to
  finish the change. Assemble every file first (scratch copies plus an applier whose anchors
  assert exactly one match), then submit once — never ship the helper alone and assume the
  follow-up call will be approved minutes later. If a write IS refused, report the exact
  applied/pending split (which files hold the new contract, which still call the old one) and say
  plainly that the tree is intermediate; never describe the change as landed. See
  `references/isolated-worktree-validation.md` when unrelated edits block integrated quality gates.
- **Turn every reviewer or subagent finding into an executable probe before it enters a report.**
  "The counter collapses equal labels" is verified by running the helper with two distinct ids
  that share a name and asserting the overflow; "scope creep" is verified with
  `git show HEAD:<path> | grep`. Record the observed output, then separate *code defect* from
  *current data impact*: a defect is real even when the live catalog has zero occurrences, so
  report both numbers — zero duplicate rows weakens the blast radius, not the bug.

## Required workflow for document-driven form changes

1. Inventory the requested document folder, extract complete relevant sections (including tables), and record which files/sections were actually read. Do not call a folder fully reviewed after reading paragraph prefixes or only one document. Separate source requirements, approved decisions, and implementation assumptions.
   - **Read the section headings for the ACTOR they name, then count that actor's live population before designing anything role-scoped.** A form can be requested under one partner role's name while every section belongs to another; the master-data distribution decides who can actually use the feature. Query the per-category partner counts and put both numbers in the plan — a portal built for a role with two records while eighty records sit in the neighbouring role is a design error, not a data gap.
   - **Treat a heading or row annotated `tidak perlu` / "not needed" as excluded scope**, and state the remaining active field count explicitly so the exclusion is visible in the mapping matrix rather than silently dropped or silently implemented.
2. Build one mapping matrix: source section/column → business entity → live Odoo field/type → frontend value/schema → read/write behavior → verification. Keep unsupported source fields explicitly unresolved instead of inventing storage or defaults. Use `references/scm-domain-ssot.md` for SCM boundaries and the live-field recipe.
   - **When the captured data must become an operational record, audit `required=True` and live row counts across the WHOLE target model chain before promising the write path.** A required many2one to a master holding zero rows blocks the write, and the source form rarely collects that master's own required fields — so the gap is an owner decision, not a default to invent. Chain-walk recipe: `references/public-partner-capture.md`.
3. Verify inherited fields across installed addons before changing an approved design. One Python class or a TypeScript interface cannot prove a field absent; check the registry and `fields_get`, then read the requested fields with the application's credentials.
4. Batch the baseline, target files, consumers, shared-component props, and translations into bounded reads. After each dependency is resolved, implement a small testable slice rather than repeatedly announcing another final inspection. Preserve unrelated working-tree hunks and validate remote-file drift before copying edits from a mirror.
5. Exercise the affected persistence behavior and form interaction before reporting completion. A generator written to scratch is only a prepared artifact: execute it, verify the target diff, and run the relevant gates. Report prepared, applied, tested, and deployed states separately; an illustrative tool-call block is not an executed tool call.

- **Treat uncommitted integrations as unapproved workstreams.** Before staging, building, or changing the release path, classify every modified/untracked path against the active plan and owner decisions. A new identity-provider route, dependency, environment variable, or service container is evidence of another workstream, not authorization to replace an approved Odoo auth path; isolate it and ask before bundling or deleting it.
- **Map a legacy-feature removal across every layer before deleting.** Inventory routes, feature components, contexts, services, actions, hooks, schemas, types and both locale maps; grep callers plus domain concepts that must remain. After deletion, run typecheck, lint and locale checks, inspect the built App Router manifest for the old route, and test the route with an authenticated session because unauthenticated middleware may redirect unknown and real routes alike.
- **Make shared date filters opt-in and prove the entire filter path.** Existing tables must remain unchanged by default; opted-in tables must synchronize URL edges, query parameters and backend boundaries, reset pagination when the range changes, and clear both edges from toolbar reset. Convert inclusive calendar days from the business timezone to the backend's UTC convention. Test start/end-of-day, invalid and reversed dates, then select a range in the browser and assert exact URL parameters; a visible picker alone does not prove filtering works.
- **For async master-data pickers, verify the UI callback reaches the query.** Use a bounded server-side search, include the business discriminator label in each option, and pass SelectForm search text through a deferred value to a query key containing that text. Exercise a known match beyond the initial option batch in a browser; the service returning matching rows is insufficient if the shared picker drops the callback. Search by business code only when the server domain explicitly supports it and the browser probe verifies it.
- **Separate identity uploads from record-owned media in create forms.** Keep a pre-save identity image control where supported; gallery and documents require a persisted record id, so the new assets tab should show an InfoAlert until save, then mount the reusable media section. Verify both create and edit modes.
- **After a shared-tree build, prove which artifact is served and clean up test auth.** Check the running Next PID's cwd and start time against the intended project and `.next/BUILD_ID`; probe authenticated and unauthenticated route behavior separately, since a 307 is only evidence of the auth guard. Remove temporary session artifacts and browser cookies after testing. Never include session tokens or passwords in logs or reports.

7. **Deliver a plan before asking execution questions.** For plan-only requests, complete the read-only audit, write the numbered plan with recommended options and stop-gates, and then ask only the decisions that block execution. Do not turn unresolved design choices into a precondition for delivering the requested plan.
   - **Define every operational term the plan introduces, or drop it.** Coined process vocabulary (a named production window, a phase label, an internal shorthand) reads as a blocker to the owner: "maksudnya?" is a signal that the plan failed to explain itself, not that the owner missed something. State the concrete action and its blast radius (what becomes briefly unavailable, for how long, who triggers it) and say explicitly which phases can proceed now versus which wait for an owner-gated production step. A plan whose only open item is a term the owner has to ask about has not delivered its decision list.
   - **When the owner answers a decision with a choice you recommended against, record the residual risk once, in the plan document, then design to their choice.** Re-arguing it in the next message burns a turn and reads as obstruction; the mitigation list and the accepted-risk statement are where it belongs.

### Reactive edit-form contract

- Render the feature's layout-matched `skeleton.tsx` until the record query resolves, then bind the real record through RHF `values` (never invented business defaults). Existing neighboring forms using cached `defaultValues` do not establish an exception.
- RHF deep-compares `values`: an equal-content refetch does not reset the form, but a genuinely changed server value still can. Add `resetOptions: { keepDirtyValues: true }` when unsaved edits must survive, and key/reset the form per entity id so one record's edits cannot leak into another.
- Define clearing semantics end-to-end (control → Zod → form type → action payload → service). Align nullable/optional unions: `undefined` that means "omit" in a partial update cannot also mean "clear".
- Preserve `0` with `value ?? ''` (never `|| ''`) for numeric fields, and mark programmatic user selections and region descendant clears with `shouldDirty: true`.

## 1. Environment Map

- Reach the repo with `ssh -F /opt/data/.ssh/config octa-host` — the SSH config lives at
  `/opt/data/.ssh/config`, never `~/.ssh/config`.
- The `code-server` container bind-mounts `/opt/octa/workspace → /home/coder/project`:
  host `/opt/octa/workspace/X` == container `/home/coder/project/X`. Files created at a
  host `/home/coder/...` path are invisible inside the container.
- Node/npm exist only at `/opt/node/bin` inside the container. Prefix every build command:
  `docker exec code-server bash -lc "export PATH=/opt/node/bin:$PATH && cd /home/coder/project/erp-syailendra && ..."`
  — a bare `npm`/`node` under `sh -lc` exits 127.
- Write ad-hoc in-container probes (env inspection, JSON reads, one-off checks) as `node -e`
  or a small `.js` file rather than `python3 -c`: `node` is on that exported PATH while
  `python3` is not on the container's default PATH, so a `python3` probe dies with
  `command not found` and reads like a data or script problem instead of an interpreter one.
- `.env.local` lives inside the container at the project root (mode 600). Copy it with
  `cp` when scaffolding an isolated build; never print or transmit its contents.
- Query the live database from the DB container on `hostinger-vps` — `psql` is not on that
  host's PATH: `docker exec odoo-db psql -U odoo -d syailendra_erp -c "<sql>"`. Always pass
  `-d`; `-U odoo` alone connects to a database named `odoo` that does not exist.
  **Resolve the container by the exact name `odoo-db`.** That host also runs `supabase-db`, which
  a fuzzy `docker ps | grep -iE "db|postgres"` matches first; psql against it then fails with
  `FATAL: Peer authentication failed for user "odoo"`, which reads like a bad credential rather
  than the wrong container. `docker exec odoo-db psql -U odoo -d syailendra_erp ...` is the only
  spelling that works — never auto-pick the DB container by pattern.
  **Do not assume the Odoo/DB containers exist on `octa-host` or `ddistillers-vps`** —
  `docker ps` there returns only gateway/Router/n8n containers and `No such container: odoo-db`.
  Locate them first with a one-line sweep before concluding a service moved:
  `for h in octa-host hostinger-vps ddistillers-vps; do ssh -F /opt/data/.ssh/config $h 'docker ps --format "{{.Names}}|{{.Status}}" | grep -iE "odoo|postgres"'; done`.
- **Odoo domain operators are RPC-only, not SQL.** `['default_code', '=like', 'EO-%']` in
  `execute_kw` means prefix match; pasted into `psql` it raises `type "like" does not exist`.
  Use `default_code LIKE 'EO-%'` in raw SQL and keep `=like` for domains.
- **Nested SSH loses this host's aliases.** `ssh octa-host 'ssh ddistillers-vps ...'` fails
  with `Can't open user config file /opt/data/.ssh/config` because that config exists only
  on the orchestrator host. Run each hop from the machine that owns the config, or pass
  `-i/-p/user` explicitly. A wrong host answered `Permission denied (publickey)` when the
  alias `ddistlers-vps` simply did not exist there — resolve the alias before concluding
  keys are broken.
- **SQL over SSH: never inline `\x27`.** psql receives it literally and fails with
  `syntax error at or near "\"`. Wrap escaping yourself in a quoted heredoc delimiter:
  `docker exec -i odoo-db psql -U odoo -d syailendra_erp -t -A -F"|" <<"SQL" ... SQL`
  (run over `ssh host '...'` with single quotes outside), then use plain `'literal'`
  inside. Keep the heredoc delimiter quoted and label rows with a text first column
  (`SELECT 'supplier_total', count(*)::text FROM ... UNION ALL ...`) so one round trip
  returns a readable key|value report.

## 2. Quality Gate Sequence

Before the full build, sanity-check changed App Router conventions and generated route types:

- Route handlers (`app/**/route.ts`) export HTTP methods and supported route config directly; do **not** add `'use server'` to a route-handler module, because Next then treats it as a Server Action file and rejects config exports such as `runtime`/`dynamic`.
- `app/manifest.ts` must use the current metadata manifest convention and default export (`MetadataRoute.Manifest` shape); a named-only exported object can fail the generated manifest route wrapper.
- After moving or removing App Router pages, stale `.next/types` may still reference the old route and break `tsc --noEmit`; remove only that generated types directory, then rerun typecheck (do not clear active `.next` build output during a running server/build).

Run gates in this order inside the container; fix before advancing:

```bash
npm run typecheck                                     # tsc --noEmit
npx eslint                                            # 0 problems required
./node_modules/.bin/prettier --check "src/**/*.{ts,tsx,json}"
node scripts/check-i18n-client-namespaces.mjs         # namespace coverage
npm run build
```

- Prettier is not on PATH; always invoke `./node_modules/.bin/prettier`.
- A prettier glob containing `[locale]` or `(dashboard)` is not a path: the shell reads the
  brackets as a character class and prettier answers `No files matching the pattern`. Format
  those trees with `find "src/app/[locale]/(dashboard)/<area>" -name '*.tsx' -print0 |
  xargs -0 ./node_modules/.bin/prettier --write`.
- After any programmatic JSON rewrite, run `prettier --write` on the touched files
  before the check gate, or the gate fails on formatting alone.
- A full `next build` runs 4–9 minutes here and outlives a foreground tool timeout,
  discarding the output you needed to judge it. Run it backgrounded with an exit
  sentinel and read the verdict afterwards:

```bash
docker exec code-server bash -lc "export PATH=/opt/node/bin:\$PATH && cd /home/coder/project/erp-syailendra && (npm run build > /tmp/build.log 2>&1; echo \"EXIT_CODE=\$?\" >> /tmp/build.log)"
```

  Judge the gate from `grep -E "Compiled successfully|Failed to compile|EXIT_CODE" /tmp/build.log`.
  A fresh `.next/BUILD_ID` plus present manifests does **not** prove a clean finish —
  report the gate only from the `EXIT_CODE=0` line together with the compile line.
- When the driving session may end before the build finishes, run the build DETACHED
  inside the container (`docker exec -d code-server bash -lc "... (npm run build >
  /tmp/build.log 2>&1; echo EXIT_CODE=$? >> /tmp/build.log)"`) instead of a
  tool-background SSH job. Keep exactly one build writing a given `.next` directory: inspect
  each `next-build` PID and `/proc/<pid>/cwd` before retrying or clearing `.next/lock`; never
  remove generated files or a lock while another builder still owns that project, because
  concurrent builds can delete each other's temporary manifest chunks and fail with ENOENT.
  Stop only the confirmed target-project build, not isolated verification servers. Afterwards
  inspect the log, process state and `.next` mtime. If a controlled Turbopack build still fails
  after stale writers are gone, try the supported Webpack backend (`npm run build -- --webpack`)
  as a single serialized build, and judge success only from its exit sentinel and complete route
  output.

## 3. Build & Restart the Runtime

- `next build` while `next-server` is running fails with "Another next build process is
  already running". Stop it first with the bracketed pattern `pkill -f "[n]ext-server"`
  — the brackets stop pkill from matching its own command line.
- Restart with PATH exported, or `nohup npm run start` dies instantly with
  `npm: not found` while the wrapping shell still exits 0:

```bash
docker exec code-server bash -lc "export PATH=/opt/node/bin:\$PATH && cd /home/coder/project/erp-syailendra && pkill -f '[n]ext-server'; sleep 2"
docker exec -d code-server bash -lc "export PATH=/opt/node/bin:\$PATH && cd /home/coder/project/erp-syailendra && nohup npm run start > /tmp/next-server.log 2>&1 &"
```

- Verify with `pgrep -af "[n]ext-server"`, the `✓ Ready` line in the log, and
  `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/`.
- Before retrying a start after a command chain fails during later verification, check process
  and health first: the earlier start may already have succeeded, and a second `npm run start`
  will fail with `EADDRINUSE` and can overwrite the healthy server's log.
- **A detached start that answers `EADDRINUSE` leaves the OLD build serving.** After a detached
  `npm run build`, the previous `next-server` is still alive on :3000 and keeps serving the
  previous `BUILD_ID`; a new `nohup npm run start` dies instantly with
  `Error: listen EADDRINUSE` while `curl` still returns 200 from the stale process. Always
  `pkill -f "[n]ext-server"` before starting, then prove the served build by comparing the
  process start time with `.next/BUILD_ID`'s mtime (`ps -o lstart= -p <pid>`,
  `stat -c %y .next/BUILD_ID`) — a 200 response alone cannot tell you which build is live.
- The demo is down from `pkill` until the restart completes; a `000`/connection-refused
  during a build is expected, not a regression.
- **`Failed to find Server Action "<hash>". This request might be from an older or newer
  deployment.`** means the browser still holds an action id from a previous build: rebuild,
  restart, then hard-reload the tab before judging the fix. A stale tab renders the old
  component tree against the new server and looks like a regression that no code change
  explains.
- **A 404 on a route whose `page.tsx` exists means the served build predates the route.**
  `BUILD_ID` alone proves only *which* build is running, not which routes it contains. Compare
  the page file's mtime against `.next/BUILD_ID` and confirm the route is compiled in with
  `grep -c '/<segment>' .next/app-paths-manifest.json`; then report the feature as written but
  not built (an unreleased wave), not as broken. The mirror-image trap is a route that answers
  `307` — the auth proxy redirects every unauthenticated path including unknown ones, so a
  redirect is evidence of the guard, never of the route.
- `$(...)` in a remote command is expanded by the HOST shell before `docker exec` runs,
  so a build-id check silently prints an empty value. Keep the substitution inside the
  container quotes:
  `docker exec code-server bash -lc 'cd /home/coder/project/erp-syailendra && echo BUILD_ID=$(cat .next/BUILD_ID)'`

## 4. i18n Workflow

- Namespace files: `src/messages/{id,en}/<pillar>/<ns>.json`, registered in
  `src/i18n/request.ts` (import plus both locale maps).
- Sidebar labels live in `src/messages/{id,en}/common/nav.json` — the `items.*` block
  AND the route-key block — plus `src/data/sidebar-data.ts`; a new route needs all four.
- **The two nav.json blocks carry two independent labels for the same route.** Renaming a
  menu means editing the route-key entry as well as `items.*`; fixing only one leaves the
  page header showing the old name (e.g. a route renamed to "Produk Atsiri" still rendering
  "Master Material"). `grep -n '"<key>"' src/messages/{id,en}/common/nav.json` and expect
  two hits per locale before declaring the rename done.
- `id` and `en` must stay 100% key-symmetric; audit every static `t('...')` key against
  both locale files before declaring a feature done.
- **Every Zod constraint carries a localized message.** `.min()/.max()/.int()` without
  `{ message }` renders Zod's English default under the field
  (`Too big: expected string to have <=10 characters`), which looks like a language bug to
  the owner. Use the shared resolver with interpolation —
  `msg('validation.maxLength', 'Maximum {max} characters', { max })` — and add the key to
  both locales. A green typecheck never sees this: trigger the error in the render harness
  (see §10) and assert no `Too big|Too small|expected string` text appears in the DOM.
- **Status labels live once, in `common.status.*`.** Lifecycle and domain statuses ("Aktif",
  "Nonaktif", "Diarsipkan", "Operasional", "Perawatan", "Karantina", "Lulus") are shared
  vocabulary; module namespaces keep only module-specific prose. Column factories receive `t`
  as a prop, so migrating them means adding a `tCommon` prop and passing
  `useTranslations('common')` from the table — not calling a hook inside the factory.
  Prune the module keys with a predicate that matches the **call**, `t('status.x')`: grepping
  the bare key string also matches `tCommon('status.x')` and silently keeps every duplicate
  alive. After adding a translator to a component, `react-hooks/exhaustive-deps` fires on the
  memos that use it — a blind `[t,` → `[t, tCommon,` replace can hit the wrong memo, so run
  run eslint and fix the reported line numbers.

  - **next-intl redirect signature.** `redirect` imported from `@/i18n/navigation` takes `{ href, locale }`, not a bare path string. Resolve `locale` with `getLocale()` from `next-intl/server`, then `redirect({ href: '/mitra/login', locale })` followed by an explicit `return` — `redirect()` returns `void`, so TypeScript does not narrow the null case and the fall-through branch errors on a possibly-null value.

  ## 5. Release Safety

- **Preserve the owner's manual edits before planning a fix in a file they touched.** A
  request like "change the layout in X" often arrives after the owner already edited X by
  hand: run `git status --porcelain` and `git diff <path>` first, and treat an unstaged hunk
  as their intent (`octadev-coding-rules` rule 211). A deleted column, a moved button, or a
  changed section order is a decision, not drift to be restored — build the new work around
  it and say so in the plan. Sweeping it into a "cleanup" revert silently undoes their work
  and they will notice on the next page load.
- **A column removed from the table is not a filter removed from the toolbar.** The faceted
  filter block and the column are independent: dropping `supplierTypeId` from `columns.tsx`
  leaves the `columnId: 'supplierTypeId'` entry in `table.tsx` filtering rows by a value no
  longer rendered anywhere. Ask whether the facet stays, and record the answer in the plan —
  removing both on assumption loses a filter the owner still uses.
- **Asset/media tabs in a create form need a record id.** `MediaSection` (gallery + PDFs) is
  keyed by `recordId`, so an unsaved record cannot upload to it. Keep the primary image
  (`image_1920`) uploadable pre-save, and render an `InfoAlert` ("save first, then add
  gallery/documents") in the assets tab instead of an empty dropzone that silently fails.
- **Table filters carry no counts.** `DataTableFilterField` options are `{label, value, icon}`
  only; put no per-option counts there. Category counts belong to a tab/pill strip, so when
  tabs move out of the table, drop the count query rather than leaving it firing on every
  page load.

- The frontend reads Odoo fields over RPC. Never serve a build that reads fields or
  models the deployed addon does not provide — release the addon upgrade and the
  frontend build together. See `odoo-addon-release-verification` for the
  schema-ahead-of-addon pitfall.
- **Removing a field is a two-sided change, and the frontend side ships first.** Dropping a
  field from the model drops the column on upgrade, so every read/write that still names it
  starts failing immediately. In the same change: remove it from the TS type, the Odoo raw
  interface, the mapper, the `*_FIELDS` list, the Zod schema, the RHF defaults, the form
  control and its section map, the table column, the read-only dialogs/detail rows, and both
  locale files. Deploy the decoupled frontend build first (it still works against the old
  schema), then upgrade the addon. Finish with `grep -rn '<field>' src addons scripts` — a
  leftover one-off policy script (`scripts/apply_*_policy.py`) is a real hit and should be
  deleted, not ignored.
- HTTP status cannot prove route health: the auth proxy answers 307 for every
  unauthenticated path, including unknown routes. Prove which build is served by the
  process working directory and BUILD_ID (`readlink /proc/<pid>/cwd`,
  `cat .next/BUILD_ID`).
- Before trusting a master-data page, confirm its model exists in the live database. A
  service can target a model that ships only in a newer addon: the page still builds and
  renders, then every request fails with `Object <model> doesn't exist`. Cross-check the
  repo manifest against the deployed module and the model registry:
  `SELECT name, latest_version FROM ir_module_module WHERE name = 'syailendra_scm'` and
  `SELECT model FROM ir_model WHERE model = '<model>'`. Repo version ahead of
  `latest_version` means the page is not deployable until the addon upgrade lands.
- A runtime log tail cannot date an error: prove an error is historical by comparing the
  log file's mtime with the change/upgrade completion time (`stat -c %y <log>` on both
  sides). Report "no new errors since <timestamp>", never "log is clean", from a tail
  whose lines carry no timestamps.
- **Label every verification count with the database and run it came from.** A migration that
  failed on the first clone, was fixed, and was retested on a fresh clone produces numbers
  from three different states; quoting the first clone's `0` next to the production run's
  `10` reads as a production failure and forces a retraction. State `clone (pre-fix)`,
  `clone (post-fix)`, `production (post-upgrade)` explicitly, and only call a phase verified
  from the query against the database you actually upgraded.
- An approval prompt that expires or times out is a refusal: stop the production step and
  report the prepared state (staged files, backups, remaining steps). Never retry the
  command, rephrase it into another tool, or treat silence as consent.
- Clone a test database by restoring the dump (`pg_restore -Fc --create`), never
  `CREATE DATABASE ... TEMPLATE <prod>` — template cloning fails while production sessions
  hold the source database open.
- Addon data backfills ship as `migrations/<new_version>/post-*.py` with
  `def migrate(cr, version)` and an early return when `version is None`; build the env with
  `api.Environment(cr, odoo.SUPERUSER_ID, {})` and bump `__manifest__.py` version in the
  same change, or the migration never runs.
- Upgrade an addon on this Odoo 18 image through the CLI dispatcher as
  `docker exec odoo odoo server -c <config> -d <database> -u <addon> --http-port=8079 --stop-after-init`.
  A bare `odoo -u <addon>` can exit successfully while loading the registry without
  upgrading the module; the explicit `server` subcommand is required. Run the exact
  upgrade against a restored clone first, with `--log-level=info`, then prove the target
  module's `ir_module_module.latest_version`, expected columns in `information_schema`,
  migration/backfill counts, and zero `ERROR`/`CRITICAL` log entries. Exit code 0 by itself
  is not proof that `-u` ran. Only then, with an explicit production approval and a verified
  DB/filestore/addon rollback set, repeat against production, restart Odoo, and verify its
  health endpoint plus the affected RPC path using application credentials. If a temporary
  config contains DB credentials, keep it out of logs and remove it from the container
  after the operation.
- **A staging `--addons-path` does not win over the image's `ODOO_RC`.** The Odoo container
  exports `ODOO_RC=/etc/odoo/odoo.conf`, and that file's `addons_path` is merged ahead of the
  one you pass on the CLI — so `/mnt/extra-addons` keeps serving the OLD module while your
  staged copy sits unused. The upgrade then exits 0, the migration never logs, and the test
  count stays at the pre-change number. Fix: write a staging config whose `addons_path` lists
  the staging dir first and omits the production addons dir, copy any sibling custom addons
  into the staging dir, and run with `docker exec -e ODOO_RC=<staging conf> odoo odoo server
  -c <staging conf> ...`. Confirm from the `addons paths:` line at the top of the log that the
  production path is absent before trusting any result.
- **An unchanged test count means your code was not loaded.** After staging a change, compare
  `odoo.tests.stats: <addon>: N tests` with the previous run; an identical N (and no migration
  log line) is evidence the registry read the old tree, not that the change is inert. Grep a
  marker string unique to the new code INSIDE the container before re-running.
- **A post-migration runs once per module version.** After editing
  `migrations/<version>/post-*.py`, `-u` against the same database will not run it again —
  Odoo already recorded that migration for the version. Drop and recreate the clone from the
  dump (`dropdb`/`createdb`/`pg_restore`) before every retest, or the `0 rows` you are looking
  at is the previous execution, not your new script.
- **A migration's own log line is not evidence the data landed.** `migrated N rows` comes from
  the counter you wrote; verify after `Modules loaded` with a real query
  (`SELECT count(*) FROM product_template WHERE atsiri_metadata IS NOT NULL`) plus one sample
  row's content. A log saying `N` while the table holds `0` means the write path failed —
  stop, report the phase as applied-but-unverified, and do not continue to the next phase.
- **Odoo's rich-text `description` wraps JSON in editor markup.** Stored values look like
  `{"en_US": "<p>{\"cas_number\": ...}</p>"}`. `json.loads` on that text raises, and a
  `except ValueError: continue` loop then reports `0 rows` while looking healthy. Strip tags
  first (`re.sub(r'<[^>]+>', '', text)`) then `html.unescape(...)` before parsing.
- **Deploying addon files to the Odoo host needs container privilege.** The addon directory is
  owned by uid `100:101`; the SSH deploy user cannot overwrite it and has no passwordless
  sudo, but is in the `docker` group. Ship the tree with `docker cp /tmp/<addon>.tgz odoo:/tmp/`
  then `docker exec odoo sh -c "tar -xzf /tmp/<addon>.tgz -C /mnt/extra-addons && chown -R 100:101 /mnt/extra-addons/<addon>"`.
  Extracting as the host user fails with `Cannot open: File exists` — that is a permission
  error, not an existing-file conflict, so do not delete the deployed addon to "fix" it.
- **Host `/tmp` is not container `/tmp`.** Piping a tarball to `ssh host 'cat > /tmp/x.tgz'`
  and then running `docker exec odoo tar xzf /tmp/x.tgz` extracts whatever stale archive was
  already inside the container, so old code runs and the failures you chase are phantoms.
  Always `docker cp /tmp/x.tgz odoo:/tmp/` first, then extract, then verify a marker of the new
  code inside the container (`docker exec odoo grep -F -c '<new symbol>' <path>`) before the
  upgrade/test run. When relaying between two remote hosts, pipe
  `ssh hostA 'tar czf - <dir>' | ssh hostB 'cat > /tmp/x.tgz'` from the machine that owns the
  SSH config, then `docker cp` on the destination.

## 6. Git

- **A parked multi-wave working tree is the default state of this repo, not an anomaly.** Before
  staging anything, bucket the entries (`git status --porcelain | cut -c1-2 | sort | uniq -c`)
  and date the newest files against the last commit (`find src addons scripts -newermt '<commit
  time>'`). Files that appear after the last commit but are absent from the active plan are
  usually another actor's work in progress — a second login route, a new vendor SDK in
  `package.json`, a `src/lib/<vendor>/` tree. Ask before bundling: a per-wave `git add` for an
  approved feature otherwise sweeps that workstream into the commit, and `git diff --stat`
  cannot tell you whose code it is.
- Commit and push from the host (`git -C /opt/octa/workspace/erp-syailendra ...`), never
  inside the container — the container's SSH keys fail host-key verification.
- Git pathspecs containing `[locale]`/`(dashboard)` need `:(literal)` when named
  explicitly; staging a whole directory (`git add -- src`) sidesteps that Git-specific issue.
  For shell commands, quote each such path as a single-quoted argument: `set -f` disables
  glob expansion only and does **not** make parentheses shell-safe.
- Remove `__pycache__`/`*.orig` under `scripts/` before staging; `git add` of a directory
  sweeps deploy leftovers into the commit.
- `git mv` stages the rename immediately. Under a no-commit stop-gate, unstage with
  `git reset HEAD -- <old-path> <new-path>` and confirm with
  `git diff --cached --name-status` — staged renames make `git status` mix staged and
  unstaged sections, which is easy to misreport.
- When the owner approves "commit and push semua perubahan", inspect what that sweeps in
  before staging: the tree may already hold another actor's uncommitted work. Run
  `git diff --cached -i -G'password|secret|api_key|token' --name-only` after `git add -A` and
  read every hit — a match on `process.env`/`env.get` is safe, a literal is not. Name the
  bundled scope in the commit body and report file count plus areas to the owner; never let
  unrelated hunks look like this session's change.
- **Business documents copied into `docs/` carry commercial data.** Supplier exports, stock-card workbooks and vendor proposals contain per-kg buy prices, full SKU catalogs and quoted fees. Confirm the Git remote is private before staging them — probe it anonymously with `curl -s -o /dev/null -w '%{http_code}' https://api.github.com/repos/<owner>/<repo>`, where `404` means private-or-absent and `200` means the world can read it (stop and ask). Name the sensitivity in the report, and never copy those files into public artefacts, decks or object storage.
- **Verify a published file from the commit object, not the worktree.** Once the tree is dirty
  again for other reasons, a worktree grep proves nothing about what shipped; re-read the blob
  that landed (`git show <sha>:<path> | grep -c '<token>'`) before reporting that the exclusion
  held. A file deliberately left dirty after the commit is the intended end state, not a
  failure — say so explicitly instead of reporting a "clean tree".
- Deliver an approved multi-line commit body by writing it to a file on the host
  (`ssh host 'cat > /tmp/msg.txt'`) and committing with `git commit -F /tmp/msg.txt`.
  A long `-m` payload nested inside SSH quoting risks truncation, and the approved
  body silently never reaches history.
- **Exclude one workstream's hunk from a shared file without touching the working tree.**
  When a file such as `.env.example` mixes your keys with another actor's block, staging the
  file stages both. Rewriting the file to drop the foreign lines destroys their edit. Stage a
  filtered blob instead: build the desired content in a scratch file, then
  `git hash-object -w --path <file> /tmp/staged.txt` → `git update-index --cacheinfo
  100644,<sha>,<file>`. The index gets your version, the working tree keeps theirs, and
  `git diff --cached -- <file>` plus `git diff -- <file>` prove the split before committing.
  Assert the excluded marker is absent from the staged blob (`git show :<file> | grep -c`)
  rather than trusting the construction.

## 7. Odoo RPC Service Patterns

- Counting related records server-side: `read_group` over `execute_kw` aggregates
  many2many fields correctly in Odoo 18 — group on the m2m field and read
  `<field>_count` (`__count` is not guaranteed on m2m rows). Groups with zero matching
  records are OMITTED from the result, so initialize `0` for every requested id before
  merging group rows, and validate the shape against `search_count` with the same
  domain before a service layer relies on it.
- **Read-path and write-path symmetry.** Trace each editable field through control,
  schema, action, RPC payload, backend field, mapper, and reloaded form. Test setting,
  clearing, and reloading it; a schema-only field can silently disappear on save.
  When a list's source changes to a discriminator (category/type), assign that same
  discriminator on create (`category_id: [[6, 0, [id]]]`) so the saved record remains
  visible. Fail loudly when the discriminator cannot be resolved.
- **Validate only what crosses the network boundary in a server action.** UI-only fields
  (a confirmation input) belong to the form schema; requiring them in the action's schema
  rejects every valid payload with a generic invalid-input error. Share strength/format
  rules through one builder consumed by both schemas so form and action cannot drift apart.
- **`required=True` on a stored related field breaks the INSERT.** Odoo writes the row
  before computing the related value, so the column's NOT NULL constraint fires
  (`null value in column "partner_id" of relation ...`) and every create path through
  that model fails, including promotion code. Derived fields must stay nullable — drop
  `required`, keep `store=True`; integrity comes from the source field, not the mirror.
- **A non-manager write guard must honour `env.su`.** Guarded transitions authorize
  themselves (ownership check, then `record.sudo().write(...)`) to protect staff-only
  fields from a portal API account; a guard written as `self.env.user.has_group(manager)`
  alone rejects those internal writes because the superuser is not in the group — the test
  suite fails on the transition, not on the abuse. Write the guard as
  `self.env.su or self.env.user.has_group(...)` so real callers stay restricted while
  the sudo-elevated transitions still pass. Prove both sides with tests: an API account
  writing `state` directly must get UserError, and the guarded transition must succeed.
- **Preserve mixed-format comment metadata.** Inspect actual stored values before
  treating an Odoo HTML `comment` as JSON. Merge edits into the complete freshly read
  metadata object; reconstructing it from a form DTO drops unexposed keys such as tax
  names and future importer fields. Preserve legacy provenance and malformed/non-object
  content without rendering it as trusted HTML. Test HTML sanitization and entity
  escaping through an Odoo round-trip before calling a codec lossless; offline JSON
  parsing alone is insufficient. See `odoo-data-backfill` for reconciliation rules.
- **JSONB conversion is per-model, not global — check the column type before using `->>`.** In this deployment `product_template.name/description` and `res_partner_category.name` are JSONB, while `res_partner.name` and `syailendra_supplier_type.name` are plain `varchar`; applying `->>'en_US'` to the latter raises `operator does not exist: character varying ->> unknown`. Confirm with `SELECT column_name, data_type FROM information_schema.columns WHERE table_name='<t>'` before writing the query. A translation-shaped column is not proof of JSONB — custom models declare `Char` with a `translate=True` name and store one locale only.
- **Never `GROUP BY 1` when the first select item concatenates an aggregate.** Postgres resolves the ordinal to the whole expression and fails with `aggregate functions are not allowed in GROUP BY`. Group by the bare expression (`GROUP BY c.name->>'en_US'`) and get the column separator from `psql -F"|"`, not from `||chr(9)||` inside the select list.
- **Odoo 18 stores `name` and `description` as JSONB (`{"en_US": "<p>...</p>"}`), not text.**
  A domain `['description', 'ilike', 'category']` — or any `ilike` on those columns — fails
  with `operator does not exist: jsonb ~~* unknown` in raw SQL and silently returns **0 rows**
  through RPC. Verify before writing a filter:
  `SELECT count(*), count(*) FILTER (WHERE description IS NOT NULL) FROM product_template;`
  then use JSONB operators (`description ? 'key'`, `description->>'en_US'`) or, for catalog
  discrimination, the `default_code` prefix (`EO-%`, `FG-%`, `RAW-%`, `PKG-%`) instead.
  Symptom the owner reports: "table kosong padahal di summary ada angkanya" — summary counts
  come from a different query than the table list.
- **Assemble multi-leaf Odoo domains in prefix (Polish) order.** Inline arrangements like
  `[leafA, '|', leafB, '|', leafC]` raise `Domain ... is syntactically not correct`. Use an
  assembler: an OR group emits `len(leaves) - 1` `'|'` tokens then the leaves; joining
  groups emits `len(groups) - 1` `'&'` tokens then each group. Probe the assembled domain
  with `search_count` over RPC before wiring it into a service.
- **Every part handed to the domain assembler must be a flat list of leaves.** A nested
  three-element list (`['&', ['atsiri_category', '=', false], ['default_code', '=like', 'RAW-%']]`)
  is indistinguishable from a field leaf to Odoo's normaliser, which then fails with
  `Invalid field product.template.& in leaf (...)`. Build with `flatten(op, parts)` — each part
  is pushed with `...` into one level — and OR over leaves by wrapping each one first
  (`leaves.map((leaf) => [leaf])`). `''` (the empty string) is itself a valid domain element
  in RPC, so `['&', ['a', '=', 1], '']` is accepted while `[...]` nestings are not; a
  domain `true`/`false` inside an RPC probe script dies with `ReferenceError: false is not
  defined` — the host language, not Odoo, is at fault there.
- **Prove a category filter against the real domain shape, not a copy of it.** Reproduce the
  service's assembler in the probe (same `flatten`/`orGroup` code, same prefix table) and
  compare `search_count` per category with the numbers the table renders. A count read from
  an older hand-written domain validates nothing about the code that will ship. And when a
  category tab/filter changes the visible rows, check the variation is real: an empty result
  from a valid but over-restrictive domain looks identical to a broken query, so count the
  base domain (all categories) first to separate "filter works" from "filter returns 0".
  **Nested SSH heredocs are expanded locally**; a `false`/`true` literal in a probe script fed
  through `<<'EOF'` still arrives mangled unless the delimiter is single-quoted on the
  *outermost* ssh call — write the probe with `node -e` inline or a base64 payload instead.
- **Never filter on a column that is not populated.** A field can exist in the schema
  and still be NULL on every row because its migration ships with an unreleased addon
  version. Check `SELECT count(<col>) FROM <table>` first; on zero, the usable
  discriminator is the existing m2m/tag relation, not the new field.
- **Never assume `res.partner` lacks region columns.** Stock Odoo has only `city` (char),
  `state_id`, `country_id`; this deployment adds `city_id` (→`res.country.city`),
  `district_id` (→`res.country.district`), `subdistrict_id` (→`res.country.subdistrict`),
  `address_detail`, `address_benchmark` through the `syailendra_region` addon. Grep the addon
  **and** `SELECT name, ttype, relation FROM ir_model_fields WHERE model='res.partner'` before
  concluding a field is unavailable — a wrong conclusion silently downgrades the form design.
  Coordinate columns are named per model (`res.partner.partner_latitude/partner_longitude`
  versus `latitude/longitude` on the farm and distillery models), so resolve the names from
  `information_schema.columns` before counting geographic coverage.
- **Multi-company scoping follows one established shape**: a server action resolves
  `companyScope()` from `getSession().companyId`, the service accepts
  `allowedCompanyIds?: number[]`, and the client wraps it into
  `context.allowed_company_ids`. `commodity` and `farm` are the reference
  implementations; extend that shape rather than inventing a second one. Audit recipe:
  `references/multi-company-scope-audit.md`.
- **Verify a service over RPC with real auth, not a hand-rolled call.** `execute_kw`
  takes the numeric `uid`; passing the login string fails with
  `invalid literal for int()`. Authenticate first via
  `common.authenticate([db, login, secret])`, trying `ODOO_API_KEY` before
  `ODOO_PASSWORD`. Use `scripts/odoo-rpc-probe.mjs` instead of rebuilding this each time;
  it parses `.env.local` in-process so no credential is ever printed.
- Reconcile counts across layers before reporting them: RPC `search_count` respects
  `active_test` (archived records excluded) while raw SQL counts every row — when RPC and
  SQL disagree by a small number, split the SQL count by `active` before calling it a
  discrepancy. And after an addon upgrade, re-run the RPC probe against the NEW model
  with the app's own credentials before trusting any page that reads it.
- **Name the key-casing contract on every RPC dict response.** A custom model method that
  returns a plain dict comes back snake_case (`access_id`, `partner_id`, `must_change_pin`,
  `locked_until`), while a TS mapper written against camelCase reads `raw.accessId` and gets
  `undefined` — so `Number(raw.accessId ?? 0)` folds a perfectly valid response into `0` and a
  green build hides a login that mints a session with zero ids. Read the key the backend
  actually sends (or convert the dict centrally), and never default an identity field to
  `0`/`''`: a missing required key must fail the mapping loudly, not degrade into a
  plausible-looking empty session. Cover it with an offline assertion over a literal backend
  dict — normalizing *and* failure paths — because no typecheck sees which key Odoo returns.
- **Never derive a required attribute by defaulting every unmatched row to one value.** A
  planner fed a whole-category export that assigns `role = DISTILLER if cat == '1.2' else
  FARMER` silently invents an attribute for every other category — upstream portals end up
  describing packaging/equipment/export suppliers as farmers. Count the categories in the
  source first, report the distribution, and treat the unmatched set as an owner decision
  rather than a default.
- **Key identity on the business code, never on a mutable display name.** De-duplication on
  `(lowercased name, province, city)` collapses genuinely distinct records whenever those
  fields are blank or shared, and a legitimate duplicate code then escapes the check. Use the
  unique `ref`/code as the identity key and treat the name as a label to preserve — never
  rewrite a real name into a synthesized `partner-{code}` during create.
- **An `except Exception: pass` around a model lookup reports "unverified" instead of
  failing.** A wrong model name (`res_country_city` for the real `res.country.city`) is
  swallowed and the caller records the item as merely unverified, so the run looks healthy
  while that validation never happened. Resolve model names against the addon registry and
  let a lookup error surface as an error.
- **Prove a provisioning/plan helper offline before pointing it at a server.** Import the
  module (`importlib.util.spec_from_file_location`) and call its pure planner with a fake
  Odoo object exposing only `search_read` — a stub returning a partner whose `ref` already
  exists is enough to expose an "already exists in target" branch that skips creating the
  missing access. Run the helper against a clone's own database name given as an argument
  (never the env database) and reject a target whose name or host resolves to production.
- **An approved population count is not a classification decision.** An owner gate such as
  "create portal access for all N suppliers" approves a magnitude, not an attribute: re-derive
  the eligible set from the source document's own categories, put the per-category
  distribution in the plan, and surface the delta (approved N vs document-backed M) as a
  fresh numbered decision. Executing the approved number silently assigns an invented
  attribute to every row the document does not classify — and the wrong ones are the rows
  nobody will check.

## 8. Scripted Edits over SSH

- **Pushing files from a local mirror:** files written over SSH land owned by the SSH user
  (uid `10000` on this host) while `code-server` runs as uid `1000`. `prettier --write` then
  fails with `EACCES: permission denied` on exactly the files that need reformatting (the
  ones already clean report `(unchanged)` and hide the problem).
  `docker exec -u 0 code-server chown 1000:1000 <files>` before the format gate — a
  directory `chown` without `-R` does **not** reach its contents, so enumerate the files.
- **No JS/TS test runner exists** (no vitest/jest/tsx in `package.json`; `npm test` absent).
  Node 22.23 runs a real `.ts` module directly:
  `node --experimental-strip-types <file>.mts` — enough to assert pure codecs imported from
  repo source (type-only imports are erased). Data/migration scripts are covered by Python
  unittest under `scripts/tests/`.
  A `.mts` check that imports repo modules with explicit `.ts` extensions fails the typecheck
  gate with `TS5097` because `tsconfig.json` includes `**/*.mts`; add
  `"allowImportingTsExtensions": true` (safe while `noEmit` is true) rather than excluding the
  check from typechecking. Leave one runnable assert-based check per non-trivial pure module
  (normal, boundary and failure paths) and run it as a gate alongside typecheck/eslint/prettier.
  If the check prints an assertion total, derive that number mechanically from executed
  assertion calls and verify the printed value against the test source; named scenarios and
  comments are not assertion counts.
- Long multi-line rewrites pass through the host shell before reaching the container, so
  payload characters are interpreted twice — and a quoted heredoc still gets shredded when
  the payload itself contains backticks or `$()`. Deliver patches as base64 instead: write
  the patch script to the local scratch dir, `base64 -w0` it, then
  `ssh host "echo '<b64>' | base64 -d > /tmp/patch.py && python3 /tmp/patch.py"`.
  Keep the decode redirect and the interpreter **inside the same `ssh` invocation**: a base64
  pipeline run without the `ssh` wrapper decodes the payload onto the orchestrator, so the
  remote file is never created and the follow-up call dies with
  `bash: /tmp/x.sh: No such file or directory` — which reads like a missing file rather than a
  mis-placed redirect. Re-run it as one `ssh` call rather than debugging the script.

- Wrap the remote command in SINGLE quotes (`ssh host 'python3 - << "PYEOF" ...'`).
  Inside double quotes the local shell expands `$`, backticks and `$(...)`, and `"""`
  closes the string outright — a Python block written with triple double quotes is the
  reliable way to produce `syntax error near unexpected token`.
- **Single quotes inside the payload break an outer single-quoted ssh command.** A Python
  patch script whose anchors contain `'field': 'value'` terminates the outer quoting, so the
  remote interpreter receives a mangled literal and the script dies on `AssertionError` for an
  anchor that plainly exists in the file. Do not debug the anchor — deliver the script as a
  FILE (`scp` it, then `python3 /tmp/patch.py <root>`) or base64 it. File delivery is the
  default for any patch containing quotes; inline heredocs are only safe for quote-free bodies.
- **Parentheses in a grep pattern need `grep -F` inside nested `docker exec sh -c "..."`.**
  The pattern reaches `sh` unquoted and fails with `Syntax error: "(" unexpected`, which looks
  like a broken command rather than a quoting problem. Use `grep -F -c '<literal>'` for symbol
  checks, or move the check into a script file.
- **Never carry NUL-delimited output across a shell boundary.** `git ls-files -z` (or any `-z`
  mode) piped into an interpreter reached through `ssh`/`docker exec` dies with an
  embedded-null error that reads like a parse bug in your own script. Have the remote write the
  list to a file and read it in-process there, or drop `-z` when no path can contain a newline.
- Paths containing `[locale]` / `(dashboard)` break bash parsing and globbing; pass them
  as single-quoted arguments, or disable globbing with `set -f`.
- `sed -i` exits 0 when the pattern matched nothing, so a failed substitution looks
  exactly like a successful one. Prefer an anchored read-modify-write that asserts the
  old string exists, and re-read every touched region (`sed -n 'A,Bp'`, `grep -n`) before
  claiming the edit landed. (The native `patch` tool only reaches local files; edits on
  `octa-host` must go through the shell, which is why the verification step matters.)
- For structured rewrites use a quoted heredoc delimiter (`<< 'PYEOF'`) and plain string
  replaces; regex-escape-heavy `sed` on TypeScript source silently misses.
- Close with `git diff --check` and `git diff -- <paths>` to prove the change set.
- **Never delete a JSX block by slicing to a generic closing marker.** Cutting from
  `<Controller ... name="x"` to the first `      />` stops at a nested prop and leaves orphan
  `</FormFieldWrapper>)}/>` closers, producing a cascade of `TS17002`/`TS1005`/`TS1128`.
  Replace the whole block by exact literal text, or delete by balanced tags, then run
  Then run `npm run typecheck` immediately after any codemod that removes JSX. The same trap applies to
    regex-deleting an object literal: a single-line pattern removes the header and leaves
    `active: 'success',` stranded at function scope, reported twenty lines away from the edit.

  ### Deploying frontend files to the code-server container

  - **Host `/tmp` ≠ container `/tmp`.** Stage on the host, `docker cp` into the container, then extract and run gates inside via `docker exec code-server bash`. Piping to `ssh host 'cat > /tmp/x.tgz'` then extracting inside the container re-extracts whatever stale archive is already inside — phantom failures. See `references/container-deploy-frontend.md`.
  - **Fix ownership before prettier.** Files written over SSH land as uid `10000`; `code-server` runs as uid `1000`. `docker exec -u 0 code-server chown 1000:1000 <files>` before the format gate — directory `chown` without `-R` does not reach contents; enumerate files.

  ## 9. Data Provenance & Stub Detection

The owner requires real data and rejects a demo that presents seeded or mocked rows as
operational records. Classify every dataset before describing it, and never upgrade a
class in a report.

| Class | How to prove it | How to describe it |
| :--- | :--- | :--- |
| Imported real | Rows reconcile with the source export (`scripts/daftar-pemasok.xlsx`) | "imported from the Accurate export, N rows" |
| Reference catalog | Origin metadata inside the seed JSON (`source_file`), seeded per company | "reference catalog, not transaction data" |
| Pilot seed | Hand-picked rows written by a seed script (`scripts/output/*_seed_plan.json`) | "pilot seed, pending field verification" |
| Mock | Imported from `@/data/scm-demo-data` | "stub page, no backend" |

- A page of roughly 50–150 lines that imports `MOCK_*` from `@/data/scm-demo-data` is a
  stub, not a feature. Report it as such and never cite its rows as evidence of working data.
- When a restructure adds sidebar entries for modules that do not exist yet, wire them to
  honest placeholder pages (PageHeader + InfoAlert, dedicated i18n namespace such as
  `scm.comingSoon`, registered in `request.ts` for both locales) — never mock rows or fake
  KPIs. The placeholder states the module is not implemented and shows no data.
- Accounting exports do not contain operational events. Harvest sessions, distillation
  batches and QC records cannot be "real from Accurate" — state that limit instead of
  seeding them and calling the result real.
- Reading an `.xlsx` without `openpyxl`: cells may be shared strings (`t="s"`), numeric, or
  `inlineStr` (`<is><t>`). A parser handling only the first two returns an empty header and
  makes a valid export look corrupt.

### Operational-chain readiness (before promising an operational or label feature)

A pillar can have every route, sidebar entry and stub page in place while the chain behind it
holds zero records. Measure the chain, not the menu:

```bash
docker exec -i odoo-db psql -U odoo -d syailendra_erp -t -A -F"|" <<"SQL"
SELECT 'module_version', latest_version FROM ir_module_module WHERE name='syailendra_scm'
UNION ALL SELECT 'suppliers', count(*)::text FROM res_partner WHERE supplier_rank > 0 AND active
UNION ALL SELECT 'farms', count(*)::text FROM syailendra_farm
UNION ALL SELECT 'harvests', count(*)::text FROM syailendra_harvest
UNION ALL SELECT 'distillations', count(*)::text FROM syailendra_distillation
UNION ALL SELECT 'stock_lots', count(*)::text FROM stock_lot
UNION ALL SELECT 'lots_with_harvest', count(*)::text FROM stock_lot WHERE harvest_id IS NOT NULL
UNION ALL SELECT 'lots_with_distillation', count(*)::text FROM stock_lot WHERE distillation_id IS NOT NULL;
SQL
```

- **`stock_lot > 0` is not evidence the traceability chain has data.** Fixture lots carry
  plausible business names (`DSTB-2026-09-001`, `RM-AGO-2026-001`, `FG-AGO-2026-0045`) while every
  link column is NULL. Always report the linked counts beside the raw count, and state plainly
  that the chain is empty when the links are zero.
- **Classify a pillar module with two probes, not one:** grep the page for
  `@/data/scm-demo-data` / `MOCK_*` *and* check whether `src/features/<pillar>/<module>/` exists
  at all. An absent feature directory means no service/action/hook layer behind the page, so the
  module is an unimplemented placeholder whatever its rendered content looks like — that is
  stronger evidence than the page's line count.
- **Inventory the print/render stack before planning a QR or label feature.** Grep
  `package.json` for a QR / barcode / PDF dependency; when none exists, choosing between
  client-side SVG QR, server-generated PDF, and print-ready HTML/CSS (`@page`) is a dependency
  and licensing decision that belongs in the plan as an explicit owner choice, not an implied
  implementation detail. The same probe decides whether label preview can be verified in-page.

## 10. Images and media: two storage tiers, one rule about bytes

Media splits by tier, and the tiers have different homes:

| Tier | Examples | Bytes live in | Read path |
| :--- | :--- | :--- | :--- |
| Identity column | `res.company.logo_*`, `res.partner.image_1920`, `photo_farm`, `photo_distillery`, `product.template.image_1920` | Odoo filestore (`ir.attachment`, `/opt/app/data/odoo/web/filestore/<db>/`) with auto-generated `_256/_512/_1024/_1920` variants | Next route proxying `/web/image/<model>/<id>/<field>/<size>` |
| Gallery, documents, video | `syailendra.media` rows (`kind` = image/document/video) | S3-compatible object storage (`storage_key`); Odoo keeps metadata + authorization | Session-gated Next route streaming the object, with `Range` |

The invariant both tiers share: **bytes never travel through the app as base64 in a payload.**
Endpoint shape, size gates, and the write/read/delete paths for the object-storage tier:
`references/object-storage-media.md`. Do not re-litigate the tier choice — when the owner moves
gallery media to object storage, the filestore rule keeps applying only to the identity columns.

- **Never include an image field in a `searchRead` list query.** A 1920px JPEG arrives
  base64-inflated (~1.4× raw) per row inside the JSON-RPC response — that is what makes the
  page crawl. Read images for a single record only.
- Serve through a Next.js route proxying `/web/image/<model>/<id>/<field>/<size>` with
  service credentials, responding binary + `Cache-Control: public, max-age=86400, immutable`.
  Render via a thin `OdooImage` component: `256` in tables, `1024` in detail pages.
- **Base64 upload over RPC is only legitimate for an identity column**, and even there
  compress client-side and cap the size first. Anything in the gallery tier is streamed to
  object storage instead — a 50 MB video as base64 over JSON-RPC inflates ~1.4× and buffers
  the whole object inside the app process. Prove an identity-column fix by comparing list
  payload size before/after at the same page size.
- **`?size=` only resizes `fields.Image`.** A plain `fields.Binary` (site-config logos) is
  served at full size regardless of the size parameter, and `information_schema` shows no
  column for attachment-stored binaries at all — verify storage via `ir_model_fields` plus
  `ir_attachment.file_size`, not the table schema. For thumbnails prefer the auto-resized
  mixin variants (`res.company.image_128`, ~6 KB) over raw columns (`logo_web`, ~237 KB+).
- **Relocating bytes to object storage keeps Odoo as metadata + authorization only.** When
  the owner routes images/documents/video to S3-compatible storage, the shape is: the Odoo
  row keeps `res_model`/`res_id`, `kind`, `role`, `storage_key`, `checksum`, `mimetype`; the
  bytes go to a bucket key; every read goes through one Next.js route that checks the
  session and streams with server-side credentials. Never expose the object URL to the
  client and never let the browser talk to the bucket with a service key. Endpoint shape,
  `Range` for video, multipart above ~5 MB, and the size-limit gates that live outside app
  code: `references/object-storage-media.md`.
- **A newly added media `kind` (e.g. `video`) is an addon change, not a UI toggle.** The
  `kind` selection, its mimetype allowlist, the ACL for the integration account, and the
  read route all move together; ship the addon and the frontend build as one release and
  prove the storage write in a clone before production.
- **Guard the write path against proxied URLs.** A value starting with `/` means
  "unchanged" — only genuine base64 reaches `cleanBase64`/`write`, and `null` clears the
  logo. Without this guard one untouched save round-trips the URL string into the binary
  field and corrupts it. `resolveImageSrc()` already passes `/`-prefixed paths through, so
  `<ImageViewer>`/`<FileDropzone>` previews work with URLs unchanged.
- **Whitelist and gate the proxy route.** Only enumerated model/field pairs may be proxied
  (anything else → 404); operational media (farm/distillery photos) requires a session
  (401 without), while branding logos stay public so the pre-auth login screen renders.
  Verify with the matrix: non-whitelisted 404, protected-without-session 401, traversal
  404, invalid id 400.

## 11. Reusable form controls & faceted filters

`/src/components/form/` owns the shared controls (`TextField`, `NumberField`,
`TextareaField`, `SelectForm`, `FormFieldWrapper`, `use-address-cascade`).

- When a reusable control exists, every form uses it — no per-feature copies, no raw
  `<Input>`/`<Controller>` blocks in new code. Creating it is a one-time act; the same change
  sweeps existing forms onto it rather than leaving two styles.
- A transform-on-type input (lowercase / uppercase / strip spaces) ships with **all
  transforms OFF by default**, opted in per field. Defaulting `lowercase`/`noSpaces` to true
  mangles names, addresses, and free text the moment another form reuses the component. Opt
  in only for identifiers: username (lowercase + no spaces), email (lowercase), every
  business code/ref (uppercase + no spaces).
- `createColumnFiltersHandler(keys)` writes **every** key it receives on each change, so a
  handler given one changed filter blanks the others. Merge the previous `columnFilters`
  state with the changed item before serializing; passing fewer keys does not fix it.
- **A filter block that exists is not a working filter.** `filters={...}` can render every
  facet and still do nothing: the table is controlled (`state.columnFilters`), so unless each
  filter entry also carries `selectedValues` (from `getArrayFilter('<key>')`) and an
  `onFilterChange` that calls `createColumnFiltersHandler(FILTER_KEYS)`, a click never reaches
  the URL or the query. Audit per entry, not per file: `grep -c "onFilterChange"` must be at
  least the number of filter entries, and `grep -c "filterConfigs\|filters="` only proves the
  toolbar renders. Confirm the fix by selecting an option and watching the request params
  change, not by seeing the faceted menu open.
- **Never let the shared URL-state hook invent a sort column.** `useDataTableUrlState`
  collapses every column except `name` into `ref` when it builds `orderOdoo`, so a table on
  a model without `ref` (`product.template`, most non-partner models) sends `order='ref asc'`,
  Odoo answers `Invalid field 'ref'`, and the list renders empty while the summary cards — a
  second query with no `order` — keep showing counts. Map the column id straight through,
  fall back to the table's own `defaultSort`, and give tables whose column id differs from
  the Odoo field an explicit opt-in `sortMap` (e.g. `code` → `ref`, `code` → `default_code`).
  Audit every `accessorKey` against the live model before declaring a table sortable; with
  one shared hook the blast radius is every table in the app, not the one page being fixed.
- **A server action that catches an RPC error and returns `{ records: [], totalCount: 0 }`
  converts a broken query into a believable "no data yet" screen.** Return a discriminated
  result (`{ ok: true, data } | { ok: false, error }`) or rethrow a typed error, and render an
  explicit error state; the empty-state message must never stand in for a failed request.
  Check the server log for the catch's `console.error` line before believing an empty table
  means zero rows.

### Renaming a feature folder, module and i18n namespace

- Under a no-commit gate use `mv`, not `git mv` — `git mv` stages immediately and turns one
  approved refactor into a mixed staged/unstaged tree the owner did not approve.
- Rename identifiers with a camelCase boundary, not `\b`: `\bMaterial[A-Z]` silently misses
  `getMaterialOptions` and `toMaterialFormValues` because `tM` has no word boundary. Inside
  the scoped feature files a plain substring replace (`Material` → `Product`) is the reliable
  first pass; verify with `grep -rn '<OldToken>' <scoped dirs>` afterwards.
- **Check the target i18n key for a collision before renaming.** `nav.json` already carried
  `breadcrumbs.products` meaning a generic "Produk"; renaming `breadcrumbs.materials` onto it
  would have silently overwritten an unrelated label. Decide the winner explicitly, move the
  value you want onto the live segment key, and delete the now-dead key instead of leaving
  both.
- Keep an explicit exclusion list and re-grep after the sweep: distillery `materials.*` and
  `boiler_material` describe boiler construction, and the `material` field on demo lot/harvest
  rows is unrelated to the product master.
- A renamed route needs permanent redirects for `/old`, `/old/:path*`, `/:locale/old` and
  `/:locale/old/:path*`, plus updated `revalidatePath` calls; verify with a `curl` that
  returns 308 to the new path before claiming the rename is complete.

## 11b. Authenticated browser verification without typing credentials

- Diagnose Turnstile rendering through CDP `DOM.getDocument` with `pierce=True`, not only `document.querySelectorAll('iframe')`: the challenge iframe can sit inside a closed shadow root and be invisible to ordinary selectors. Record frame origin and layout bounds separately from `turnstile.getResponse()` length. A rendered frame with an empty response proves rendering only, not CAPTCHA completion or end-to-end validation; never bypass the challenge to make an automated test pass.
- **Dummy-key E2E needs an isolated PRODUCTION build with an explicit test marker.** A `next start` build rejects Cloudflare dummy secrets even with `TURNSTILE_ALLOW_TEST_KEYS=true` (correct fail-closed); allow them only when ALL of `TURNSTILE_ALLOW_TEST_KEYS=true`, `APP_ENV=test`, and a loopback `NEXT_PUBLIC_APP_URL` hold (see `partner-turnstile.ts`). Dev mode in this environment silently fails to hydrate React on both Turbopack and webpack (`__react*` props absent on every element), so browser E2E must run against a snapshot production build on a separate port with its own `.env.local` (clone DB), reached through a private loopback proxy for a secure context.
- **Wait for the CAPTCHA response input to be non-empty before clicking submit.** The dummy widget resolves asynchronously after mount, and an early click fails schema validation with no visible error — poll `input[name=cf-turnstile-response]` length in a loop instead of sleeping a fixed interval.
- **Drive native date inputs through the JS value setter, not typed keystrokes.** Use `Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'YYYY-MM-DD')` plus dispatched `input`/`change` events — typing characters into `<input type=date>` garbles it into a wrong year.
- **Rate limits are in-memory; lockouts live in the database.** Restarting the test instance clears rate limits but not account lockout — reset both (manager unlock + freshly issued PIN) before re-running credential tests, or the next run dies on `locked`/`rate_limited` left by the previous run.

A signed application session is an authentication credential, not a test fixture. Never
read its signing secret, mint or re-sign a token, replay a captured cookie, or inject a
fabricated session through CDP. For authenticated UI verification, use the normal login flow
with `browser_vault` filling a saved credential; if no authorized credential is available,
stop at the login boundary and report that authenticated behavior is unverified. See
`references/session-recovery-browser-verification.md` for the approved browser workflow.
- A map or coordinate-dependent component cannot be proven from empty data. Query the live
  rows first (`SELECT ... WHERE latitude <> 0`); when none exist, verify and report the
  zero-coordinate guard/empty state, and state plainly that marker rendering is unverified
  rather than implying the map works.

## 12. Render verification without credentials

Prove a document-driven form actually renders when no authorized UI session exists: bundle
the real feature entry with esbuild, replace every data/transport boundary with an explicit
test stub, serve the static output, and drive it in headless Chromium. No credentials, no
production rows, no seeded data — the harness banner states the boundary.

- Cover create mode (all sections), empty-submit validation (required messages + auto-focus
  of the failing tab), the region cascade (child disabled until its parent is picked), a
  valid submit (inspect the captured payload keys), and edit mode via a synthetic
  `initialData` (readonly ref, digital code, every tab's bound values).
- A `@/components/**` import missing from the resolve whitelist silently becomes
  `export default {}`, so a named import throws `No matching export` and the only visible
  trace is the `Node.js vX.Y.Z` footer with exit code hidden behind a pipe. Read the
  esbuild error list before touching application code.
- Recipe, stub list, and DOM-driving pitfalls: `references/component-render-harness.md`;
  starting point: `templates/component-render-bundle.mjs`.
- Authenticate only through the normal login flow using a credential saved/furnished by
  `browser_vault`; the vault must fill secrets itself. Never read a password from `.env.local`,
  paste one into browser automation, mint or re-sign a session cookie, or inject a fabricated
  session to bypass authentication. If no saved login exists, use `browser_vault`'s
  user-entered save-login prompt; if it is declined or unavailable, stop at the login boundary
  and report authenticated UI checks as unverified. Do not bypass CAPTCHA/Turnstile.
  Browser steps and what to assert: `references/session-recovery-browser-verification.md`.

## 13. Next.js App Router API Routes — Odoo JSON-RPC with Partner Auth

When a frontend feature needs a backend route the Odoo service layer cannot reach directly (file uploads, partner-scoped mutations, outbox runner targets), implement a Next.js App Router route handler under `src/app/api/<area>/<sub>/route.ts`.

### Authentication boundary

Every partner-facing route must verify the partner session first:

```ts
const session = await getPartnerSession()
if (!session) {
  return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
}
```

`getPartnerSession()` reads `syailendra_partner_session` from cookies and verifies the HMAC. Staff routes use `getSession()` instead — never mix the two guards; the partner guard rejects staff cookies and vice versa.

### Request shape: multipart/form-data

Partner submission routes accept `multipart/form-data`, not JSON:

```ts
const form = await req.formData()
const kind = String(form.get('kind') || '')
const payloadRaw = String(form.get('payload') || '{}')
const photo = form.get('photo')
```

Validate `kind` before parsing; reject missing/invalid with 400. Parse `payload` with `JSON.parse` inside try/catch → `INVALID_PAYLOAD` 400.

### Typing the Odoo payload

Use `OdooObjectValue` (`{ [key: string]: OdooFieldValue }`) from `@/lib/odoo/types`, NOT `OdooFieldValue` or `Record<string, unknown>`:

```ts
import type { OdooObjectValue } from '@/lib/odoo/types'
let payload: OdooObjectValue = {}
payload = JSON.parse(payloadRaw) as OdooObjectValue
```

`OdooFieldValue` is a union including primitives — assigning `payload.lat = value` fails because `lat` does not exist on a primitive union. `OdooObjectValue` is the index-signature type that accepts arbitrary string keys.

### Calling Odoo model methods via executeKw

`odooClient.executeKw(model, method, args, kwargs)` passes `args` directly to Odoo's `execute_kw`. The convention used across the repo:

```ts
// action_submit(self, access_id) → args = [[recordId], accessId]
await odooClient.executeKw<boolean>(
  'syailendra.partner.submission',
  'action_submit',
  [[recordId], session.accessId],
  {}
)
```

`args[0]` is always the recordset array `[recordId]`; positional method args follow in `args[1], args[2], ...`. `kwargs` goes last as an object.

### File uploads

Route partner submission yang menerima lampiran memakai pipeline media bersama:
validasi session + ownership → MIME sniff dan size cap → stream ke S3-compatible object
storage di server → simpan `storage_key`/checksum/mimetype/size di `syailendra.media` Odoo.
Baca objek hanya lewat Next.js route yang memeriksa sesi dan streaming dengan server-side
credentials; untuk video, pass-through `Range`. Detail credential, endpoint self-hosted,
batas reverse proxy, multipart dan orphan reconciliation: `references/object-storage-media.md`.

Jangan menulis upload ke `public/uploads`, jangan taruh URL publik di payload partner,
dan jangan kirim byte media sebagai base64 melalui JSON-RPC. Pastikan baris Odoo dapat
dibuat dengan ACL account integrasi, dan hapus objek orphan bila pembuatan metadata gagal.

### Error code extraction

Odoo raises `UserError`/`ValidationError` with messages like `CODE: Bahasa Indonesia text`. Extract the code for the frontend:

```ts
const message = error instanceof Error ? error.message : String(error)
const codeMatch = message.match(/^(E_[A-Z_]+):/)
return NextResponse.json(
  { success: false, error: message, code: codeMatch ? codeMatch[1] : null },
  { status: 400 }
)
```

The frontend cuts at the first `": "` and displays the remainder; the `code` field lets it route by error type.

### Gates for new route files

Run scoped gates on the new route only — never a full repo sweep for a single route:

```bash
# Typecheck (zero errors in the new file)
export PATH=/opt/node/bin:$PATH
docker exec code-server bash -lc "cd /home/coder/project/erp-syailendra && npm run typecheck" | grep route.ts

# Prettier
./node_modules/.bin/prettier --check "src/app/api/<area>/<sub>/route.ts"
# If not clean:
docker exec -u 0 code-server bash -lc "... prettier --write ... && chown 1000:1000 ..."

# ESLint
npx eslint "src/app/api/<area>/<sub>/route.ts"
```

Prettier is not on PATH inside the container; use `./node_modules/.bin/prettier`. Files written over SSH or via `docker cp` land as uid 10000 while `code-server` runs as uid 1000 — `chown 1000:1000 <files>` before the format gate, or prettier fails with `EACCES`. Directory `chown` without `-R` does not reach contents; enumerate the files.

### Container PATH

`npm`/`node` are not on the default PATH inside `code-server`. Prefix every command:

```bash
docker exec code-server bash -lc "export PATH=/opt/node/bin:$PATH && cd /home/coder/project/erp-syailendra && ..."
```

A bare `npm`/`node` under `sh -lc` exits 127.

### What not to do

- Do not import `OdooFieldValue` from `@/lib/odoo/client` — it is re-exported from `./types` and not exported by the client module itself. Import `type OdooObjectValue` from `@/lib/odoo/types`.
- Do not pass `session.accessId` as a bare string to `executeKw` args without wrapping the record id in an array: `[[recordId], accessId]`, not `[recordId, accessId]`.
- Do not store base64 image data in the payload — write to disk and reference the public URL.
- Do not mix `getPartnerSession()` (partner cookie) with `getSession()` (staff cookie) in the same route; they use different secrets and audiences.
- Do not auto-pump an offline outbox from `enqueue()` when the submitting form also POSTs directly — the two send paths race and create duplicate records. One send path per user action; the pump runs on explicit sync or reconnect.

## References

- `references/runtime-restore.md` — restore the demo to a clean HEAD build when the
  working tree holds unreleased changes (isolated checkout + hardlinked node_modules).
- `references/isolated-worktree-validation.md` — when another actor's dirty files block the
  integrated typecheck/build: sibling clone from the tracked baseline, explicit file overlay,
  hard-linked `node_modules`, ownership fix, isolated port, and the reconcile step.
- `references/scm-domain-ssot.md` — SCM model boundaries, authoritative business documents,
  and the agreed menu shape; read before planning an SCM restructure.
- `references/multi-company-scope-audit.md` — prove whether cross-company data is
  actually leaking, then apply `allowed_company_ids` without changing what users see.
- `scripts/odoo-rpc-probe.mjs` — read-only JSON-RPC probe: authenticate once, count a
  domain, print rows with an explicit `--order`, and sweep the same count per company
  context. Use `--order` to reproduce an invalid-sort-field failure before touching code.
- `references/component-render-harness.md` — esbuild + headless-Chromium harness that
  verifies a form's sections, validation, cascade, and edit-mode binding without a session.
- `templates/component-render-bundle.mjs` — copy-and-edit bundler entry for that harness.
- `references/skill-discovery-and-scoping.md` — search skills.sh/MCP for a new domain and
  decide install-vs-skip on evidence, then turn the audit into numbered decisions before
  writing any plan.
- `references/modal-to-page-conversion.md` — checklist for converting an ActionDialog CRUD
  feature to dedicated create/edit/detail pages (context router handlers, ConfirmDialog and
  DataBadge props APIs, detail layout, duplicate-component verification).
- `references/public-partner-capture.md` — external partner-facing data capture: the
  verified auth surface, actor/role decision, intake-vs-direct landing trade-off, the
  no-public-signup constraint from the business SSOT, and the partner-auth hardening
  checklist (audience isolation, fail-closed captcha, lockout parity, state-write guard).
  Read before planning or reviewing any portal.
- `references/regional-location-backfill.md` — match free-text `city` to the
  `res.country.city` catalog: normalization, alias map, ambiguous-vs-unmatched policy, SQL
  shape, and the coverage counts to report.
- `references/object-storage-media.md` — moving `syailendra.media` bytes to S3-compatible
  storage: metadata/authorization split, endpoint shape for self-hosted services, the size
  gates that live outside app code, `Range`/multipart rules, and the write/read/delete plus
  reconciliation paths.
- `scripts/storage-gate-probe.sh` — read-only enumeration of every gate that lives outside
  the app for the self-hosted storage stack: buckets (visibility + limits), `storage.objects`
  rows vs policies, volume footprint, `FILE_SIZE_LIMIT`, reverse-proxy body limit, unsigned
  endpoint liveness, container caps and disk headroom. Run before promising a byte cap.
