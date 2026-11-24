# 05 — Build, Test, and Release

## Change gates

1. Inspect `git status` and the feature's existing conventions before edits; this is a
   shared worktree, so do not overwrite another actor's changes.
2. Define acceptance criteria, affected translations, Odoo models, and authorization.
3. Keep changes scoped; do not run database migrations or deploy production code
   without explicit approval.
4. Validate each layer; report exact commands, exit codes, and skipped gates.
5. Summarize the diff and wait for explicit commit/push approval. Never commit or push
   without per-action approval.

## Suggested local gates

Run in the repo environment (usually inside the code-server container):

```bash
npm run lint
npx tsc --noEmit
npm run test -- --run
npm run build
```

Use scripts that actually exist in `package.json`; if a script is absent, record it as
not configured instead of inventing a passing result. Test only scoped behavior first,
then run full gates when feasible.

## Feature-specific quality gates

- Verify `src/messages/id/**` and `src/messages/en/**` key symmetry.
- Test schema validation and accessible form labels/error messages.
- Test service field mapping against an authorized non-production Odoo database.
- Test company scoping and archived-record behavior for list/read RPCs.
- Test QC state transitions, stock reservation block, and audit events.
- Test public trace payload for data minimization.
- Test PDF/QR rendering at intended print dimensions and browser.

## Build/runtime caveats

- Next.js 16 uses `src/proxy.ts`; do not add a new `middleware.ts`.
- Stop the active `next-server` process before `next build`, then restart the intended
  runtime; concurrent `next build` and `next-server` may contend for `.next` output.
- Odoo CLI module upgrades in the live container must use a separate port and
  `--stop-after-init`; see the Odoo skill and project release SOP before execution.
- Addon code in the remote `/mnt/extra-addons` path is a copy, not a Git checkout.
  Deployment includes file copy, ownership verification, backup, module upgrade, and
  runtime verification; all production steps require approval.

## Release evidence

Record: commit/hash, changed paths, lint/type/test/build result, migration version,
backup/rollback reference, target environment, deployment time, health evidence,
known limitations, and approver. Do not include credentials or private runtime data.
