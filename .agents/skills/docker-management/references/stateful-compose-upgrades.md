# Stateful Compose upgrades — n8n / PostgreSQL class

Depth behind section 4 of SKILL.md for stacks where the app owns a database. Recipe proven on an n8n + PostgreSQL + external task-runner stack upgraded in place.

## Quiet window: derive, then re-check

- Get the DB role/schema from live config (`grep -h '^POSTGRES_' .env`), never assume the app name is the role. `psql -U postgres -d <db>` on an app stack typically answers `role "postgres" does not exist`; a failed query is `DATA_INCOMPLETE`, not "zero running".
- Query the execution ledger for `running`/`new`/`waiting` immediately before cutover, then again right before the recreate. A `0` measured during planning does not reserve the window.
- Do not drain by stopping ingress for a single-user instance: measure the real interruption with `StartedAt` before/after instead of claiming zero downtime. Pre-pull removes download time from the window, it does not remove the window.

## Backup that a rollback actually needs

All three, or the restore is not executable:

1. `docker exec <db> pg_dump -U <role> -d <db> -Fc > /path/pre_<version>_<ts>.dump` then `chmod 600` the dump. Verify header `PGDMP` and a table count via `pg_restore --list | grep -c 'TABLE DATA'`.
2. `cp -a compose.yaml compose.yaml.backup_<oldver>` and `cp -a .env .env.backup_<oldver>` (600).
3. Record the running image digests (`docker image inspect <image> --format '{{.RepoDigests}}'`) before the pull; that digest is the rollback pin when the tag is floating.

**Restore test is the gate, not an extra.** A dump you have never restored is an untested assumption. Run it into an isolated throwaway container built on the target image; the readiness and exit-status traps are in the SKILL.md Pitfalls table.

## Forward-only migrations

- Record the newest migration id before cutover (`SELECT id FROM migrations ORDER BY id DESC LIMIT 1`). After the upgrade it must be equal-or-greater, never lower.
- Old image tag alone does not reverse schema changes. Rollback = old tag **plus** restoring the pre-update dump (owner authorization, and state the write-loss window).
- App-side changes are mainly migration completion plus a version banner (`Cluster aligned on version X`, `Recorded version change: A -> B`) — grep for those lines instead of assuming boot success.

## Lockstep and variant matching

- App image and its runner/sidecar image share one version variable; bump both from the single variable so they cannot drift.
- Match the base-OS variant of the DB image to what the container already runs (`docker exec <db> cat /etc/os-release`) before pinning a new tag. A same-major patch on a different base is a gratuitous second change.
- Pin the target as `image: <repo>:<version>-<variant>@sha256:<digest>` so a later rebuild cannot silently float.

## Minor-release advisories (PostgreSQL class)

- Read the release notes for the exact target before executing. A patch release can still demand action: `REINDEX` for specific index types, per-column-type de-duplication fixes, or `composite_type_mismatch` behaviour changes.
- Check whether the advisory applies: `SELECT extname FROM pg_extension` (e.g. no `pg_trgm` means the GiST/trgm `REINDEX` note is moot) and `SELECT am.amname, count(*) FROM pg_index i JOIN pg_class c ON c.oid=i.indexrelid JOIN pg_am am ON am.oid=c.relam GROUP BY 1`. Also confirm `SELECT count(*) FROM pg_index WHERE NOT indisvalid` = 0 after the upgrade.
- An in-major upgrade needs no dump/restore, but a dump is still taken for rollback and for the restore test.

## Acceptance must include real production traffic

- After recreate, look for executions started *after* the upgrade timestamp, not just a synthetic probe: `SELECT id, status, "workflowId", "startedAt" FROM execution_entity ORDER BY id DESC LIMIT 8`. A scheduled workflow completing post-upgrade is stronger evidence than any hand-run test.
- `n8n execute --id <wf>` against a live instance fails with `n8n Task Broker's port 5679 is already in use` — the CLI starts its own broker. Use the ledger above, or run the CLI only when the main process is stopped.
- Report non-fatal noise explicitly as noise: upstream catalog/telemetry timeouts (`api.n8n.io`), in-image driver deprecations. Do not call the log "clean" and do not call it a failure.
