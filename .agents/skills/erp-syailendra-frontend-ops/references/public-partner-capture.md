# Public partner capture (first-mile data entry)

Use when planning or building any surface where an **external partner** (farmer, distiller,
collector, cooperative) enters operational data themselves, instead of internal staff typing
it into the dashboard. Read `scm-domain-ssot.md` first for model boundaries.

## Verified auth surface (measure again before relying on it)

| Object | What it does | Consequence for a partner portal |
| :--- | :--- | :--- |
| `src/proxy.ts` | Global guard; public allowlist is `/`, `/login`, `/trace`, `/api`. Everything else redirects to `/login` when the token is invalid. Sets `X-Robots-Tag: noindex, nofollow, noarchive` globally. | A new public route must be added to the allowlist explicitly, or it silently redirects. noindex is already handled — do not re-add it per page. |
| `src/lib/auth/{session,token}.ts` | Stateless HMAC cookie `syailendra_session`, `httpOnly`, `sameSite=lax`, claims `v/uid/name/email/companyId/companyName/groups/isAdmin/iat/exp`, secret ≥ 32 chars. | Claims are shaped for **internal users**. A partner session needs its own cookie/claim set; do not overload `uid`/`groups` with partner semantics. |
| `src/services/odoo/auth/auth.service.ts` | Authenticates against `res.users`. | Partners are `res.partner`, **not** `res.users` — the existing login path cannot authenticate them as-is. |
| Odoo modules | `portal` and `auth_signup` installed; the only `share=true` users are system/template accounts. | "Portal is installed" is not "partner accounts exist". Count real share users before promising an Odoo-portal approach. |

## Decide the actor before the form

1. List the document's section headings and note which role each one addresses.
2. Count live partners per supplier category (`res_partner_category.name` is JSONB here).
3. If the requested role and the document's role differ, surface both numbers and ask —
   do not silently pick one. Offer a phased option (build the role the document actually
   describes first, add the other role after) rather than a merged guess.

## Landing decision: intake vs direct write

| Option | Shape | Choose when |
| :--- | :--- | :--- |
| **Intake + review + promotion** | Partner writes a submission record (payload + attachments + state machine `draft → submitted → needs_revision / rejected / approved`); internal staff approve; promotion creates the operational record. | Default for unverified external input. Keeps operational tables clean, gives revision history and an audit trail, and lets ACL stay simple. Costs one extra model and one review screen. |
| Direct write with `state=draft` | Partner writes straight into the operational model; staff confirm later. | Only when the partner is already trusted and the model has a real draft state plus partner-scoped record rules. Unverified rows otherwise become indistinguishable from operational data. |

Rules that apply to either option:

- **Promotion must be idempotent** — one submission links 1:1 to one operational record, so a
  double approve cannot duplicate a batch.
- **Never fabricate missing values.** Mark unavailable fields as "not filled"; the process
  documents require this explicitly.
- **Plausibility checks before promotion**: yield within 0–100%, weights > 0, and the event
  order harvest ≤ distillation ≤ shipment.
- **Partner scoping must be enforced inside the Odoo method, not by a record rule.** The app
  reaches Odoo through a service account and `ir.rule` is evaluated per Odoo user, so a
  `partner_id` rule isolates nothing on that path. Derive `partner_id` server-side from the
  verified access record, reject any `partner_id` supplied by the client, and prove isolation
  negatively: authenticate as partner A and show partner B's records are unreachable. Keep a
  record rule for internal users, but never treat it as the portal's boundary.
- **Public trace output only shows approved data.** Unreviewed partner input must never reach
  the consumer-facing trace page.

## Audit the promotion target chain before promising it

Read `required=True` on every model the promotion touches and count live rows in each, before
committing to an intake → promotion design:

- A required many2one to a master with **zero rows** blocks promotion outright, and the capture
  form usually does not collect that master's own required fields. Closing the gap with a
  plausible default fabricates business data.
- Required chains cascade: an operational event requires a lot, the lot requires a site, the
  site requires a classification the source form never asks for. Walk the whole chain, not
  just the top model.
- Check the **domain** on required relations too (a lot relation may be restricted to a
  delivered state) — promotion must satisfy the domain, not merely fill the id.
- Count how many partners actually have the facility/site master registered. A handful of
  sites for dozens of partners means most submissions need master creation at review time.

Surface the gap as a numbered owner decision with options — collect the extra fields in the
form, have the reviewer complete the master before approval, or relax the constraint — and
never resolve it silently.

## Credential provisioning constraint

The business concept document forbids public self-registration: credentials are issued by the
superadmin, forms are sanitized and captcha-gated, pages are unindexed, and edge protection sits
in front. Any login design must therefore be **admin-provisioned**. Before recommending or
wiring an identity provider, recover the latest owner-approved auth decision from session history
and the project SSOT, then inspect the active login route, proxy, service layer, and working-tree
diff. An uncommitted vendor login route, dependency, environment, or running auth container is
evidence of a workstream—not approval to replace the ERP's chosen identity source. Keep such a
workstream isolated from the release until the owner explicitly includes it: quarantine untracked
provider files outside the repository; restore provider-only tracked hunks in proxy, dependency,
lockfile, and locale files only after confirming those hunks are exclusive to that provider; then
verify the approved login route, redirect target, and zero provider imports before building. Do not
delete quarantined files or stage the mixed working tree as a shortcut. Evaluate approved
mechanisms on evidence, not preference:

| Mechanism | Fits when | Cost to own |
| :--- | :--- | :--- |
| Partner code + PIN, verified **inside Odoo** | Field users on low-end phones; printable access cards; no Odoo user provisioning | You own hashing, lockout, rate limiting per IP and per code, no account enumeration, and access logging. Never let the PIN reach logs or artefacts. |
| Odoo portal user per partner | You want native reset/ACL and can provision and maintain the accounts | Account lifecycle for every partner; app session must learn a portal role. |
| One-time invite / magic link | Onboarding speed matters and a messaging channel exists | Links are forwardable; needs expiry, single-use enforcement, and revocation. |

- **Probe the delivery channel before promising one.** Count non-empty `mobile`, `phone` and
  `email` across the target partner population; a category can hold zero mobile numbers, which
  rules out WhatsApp/SMS delivery until data is collected. Offer a printable access card handed
  over by a field officer as the channel-independent fallback.
- **Hash inside Odoo and make the hash unreadable.** `passlib` ships in the Odoo image
  (`pbkdf2_sha256`), so verification runs server-side without exporting secrets. Put a `groups=`
  restriction on the hash field, keep it out of every field list, and prove with `search_read`
  that no RPC path returns it. Return a generated PIN once, store only the hash, and keep it out
  of logs and artefacts.

## Hardening checklist for the partner auth surface

Run this checklist against the code before calling a partner portal safe. Each item is a
failure mode that a green build and a passing happy-path test will not reveal.

| Check | Rule | Why |
| :--- | :--- | :--- |
| Audience isolation | Separate cookie name, separate signing-secret env var, an explicit `aud` claim, and a distinct claim shape with its own verifier. Prove negatively that a staff-shaped payload signed with the partner secret is rejected, and vice versa. | A shared cookie/verifier cannot distinguish audiences; a type-guard that rejects the other shape is the isolation, so test it explicitly. |
| Secret blast radius | Give the public audience its own secret env var, mirrored as a placeholder in `.env.example`. | Rotating or leaking one audience must not invalidate or compromise the other. |
| Captcha fail-closed | Detect a missing secret AND the provider's published test secret at runtime, and refuse public login when either is present. Verify which key is a test key with `grep -c '<test-key prefix>'` on the specific env line — never print values. | A test secret makes siteverify always succeed, so the captcha silently protects nothing while looking configured. |
| Lockout parity | Every endpoint that verifies a credential — login AND self-service PIN/password change — must share one failure counter and lockout, and must check the lock before verifying. | A change endpoint without the counter is an unlimited brute-force oracle against a small secret space. |
| Secret strength | Reject repeated digits, ascending/descending sequences, and a new value equal to the old one, not just wrong length/charset. | Length-only validation accepts the most-guessed values. |
| State-machine write guard | Whitelist the fields the external account may write; refuse everything else (state, promotion result, reviewer identity, timestamps). Internal transitions call `sudo().write()` AFTER the ownership guard, and the guard must treat `env.su` as authorized. | Guarding only the payload leaves `state` writable, so a plain `write()` bypasses review entirely; a guard that ignores `env.su` also blocks your own guarded transitions. |
| Submit-time link ownership | Validate every payload reference (`farm_id`, `harvest_id`, `distillery_id`, `distillation_id`) at SUBMIT time against the access record's partner — not only at promotion, and never against the draft row's own `partner_id`. | Promotion-time guards alone let foreign/unknown references enter the review queue; checking the row's stored owner instead of the submitting access's owner passes forged drafts. |
| Restricted-field reads | Assert that explicitly requesting a `groups=`-restricted field raises an access error, and that a normal read omits it. | Odoo raises rather than silently dropping the field, so a test expecting omission fails while the control is actually correct. |
| Sequence allocation | Allocate sequences with `sudo()` inside `create` when a restricted integration account creates the record. | The account has no read access to the sequence model, so an un-elevated `next_by_code` raises on every create. |
| Chatter dependency | Decide deliberately whether a model written by the integration account inherits the mail/thread mixin. Dropping it means removing every `message_post` call on that model too. | The mixin's follower/subtype inserts require mail-table access the integration account should not have; leaving the calls behind raises `AttributeError` at the first transition. |
| Derived required fields | Never put `required=True` on a stored `related` field. | The INSERT runs before the related value is computed, so the NOT NULL constraint fails and every create path — including promotion — breaks. |
| Permissions-Policy | Scope `camera=(self), geolocation=(self)` to the portal routes instead of the global deny. | A global `camera=(), geolocation=()` silently blocks field GPS and photo capture. |
| Public allowlist | Match routes by equality/prefix AFTER stripping the locale prefix; never `pathname.includes(...)`. | Substring matching makes every path containing the fragment public. |
| Error surface | Return error CODES from the action and translate client-side; normalize a "locked" reason so it does not confirm that an account exists. | Hardcoded server-side strings leak untranslated into toasts, and a distinct locked response is an enumeration oracle. |
| Bulk credential issuance | Issue secrets per record, never on a multi-record recordset. | A multi-record call applies one secret to every record and returns only the first identifier. |

## Keep supplier identity separate from portal permissions

- Keep Petani/Farmer within the unified Supplier Master (`res.partner`). A portal `farmer`/`distiller` role selects an operational workflow; it does not create another supplier identity, and issuing access must not create duplicate partners or overwrite `supplier_type_id` to fit the current role enum.
- Do not infer harvesting permission from every upstream category. A cooperative, mixed farmer/distiller group, or raw-material company may need specific or multiple workflows; its actor type alone proves neither farm ownership nor portal authorization. Preserve the approved population goal and reconcile explicit eligibility/permissions rather than force-fitting all rows to `farmer` or declaring an unsupported reduced count final.
- Read terminology in context when documents differ. The traceability data-structure document includes farmers in Supplier Master, while operational SOPs may call only collectors/traders suppliers. Cite both usages and the approved identity model; separate process responsibilities do not require duplicate master tables.

## Automated tests versus real-provider CAPTCHA smoke

- Own application QA instead of requiring the owner to manually exercise every login/form. Run mapper, credential/PIN, session, lockout, isolation, submission, replay/idempotency and browser tests against the clone plus an isolated frontend/test harness.
- Use Cloudflare's documented dummy keys or an explicit test-provider fixture only in isolated tests; never replace production keys or relax production's fail-closed guard. The partner guard currently rejects test secrets, so define an isolated test boundary before claiming a dummy-key browser test can run. Verify production guard rejection separately.
- A production `next start` build rejects dummy keys even with `TURNSTILE_ALLOW_TEST_KEYS=true`; allow them only with `APP_ENV=test` AND a loopback `NEXT_PUBLIC_APP_URL`, and verify production still rejects them in a separate check.
- Issue fixture credentials through an Odoo shell pipe and capture the returned secret into a mode-600 file by parsing a marker line from stdout — never print it. The shell rolls back unless the script commits, and a generated PIN is returned only once.
- Report test-provider success separately from real-provider validation. Official dummy success does not prove production hostname/action checks or human/bot detection. A screenshot with “Success!” proves client-side challenge completion at capture time, not login or backend Siteverify acceptance. Ask for minimal human intervention only when a live-provider challenge actually blocks an otherwise prepared smoke test; never solve/bypass the challenge or request token/PIN values in chat.

## Open questions to resolve before implementation

- Field network coverage — decide whether offline draft + sync is required; the scope document
  raises it as an open question, and without it field input can be lost.
- Portal language(s) versus the app's symmetric `id`/`en` dictionary rule.
- Which document sections are in phase 1, and whether a shipment/delivery model is needed
  (a delivery-to-company section usually has **no** existing model — verify in `ir_model`).
