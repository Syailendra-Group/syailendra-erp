# Isolated clone staging for an addon upgrade

Use when a custom Odoo addon must be upgraded and tested WITHOUT touching the deployed
addon directory, the production data dir, or the live web port. The clone is a restored copy
of production plus a staged copy of the new module; production keeps serving the old code the
whole time.

## 1. Fresh dump of the source database

```bash
docker exec <db-container> pg_dump -U <db-user> -Fc -d <source-db> > /home/deploy/backups/<source-db>_pre_<change>_$(date -u +%Y%m%dT%H%M%SZ).dump
head -c 5 <dump> | od -c          # must print: P G D M P
sha256sum <dump>                   # record next to the size
```

## 2. Restore into a NEW database (never overwrite, never TEMPLATE)

```bash
docker exec <db-container> dropdb -U <db-user> --if-exists --force <clone-db>   # only if re-running
 docker exec <db-container> createdb -U <db-user> -T template0 <clone-db>
docker exec -i <db-container> pg_restore -U <db-user> -d <clone-db> --no-owner --exit-on-error \
  < /home/deploy/backups/<dump> > /home/deploy/backups/<clone-db>_restore.log 2>&1
```

- `CREATE DATABASE ... TEMPLATE <prod>` blocks while production sessions hold the source open.
- Leave older clones in place; they are the state earlier reported numbers came from.
- Compare aggregates on both sides before trusting the clone:
  `SELECT 'suppliers', count(*) FILTER (WHERE supplier_rank > 0) FROM res_partner;`
  plus the module row `SELECT name, latest_version, state FROM ir_module_module WHERE name='<module>';`

## 3. Neutralise the clone's automation

```bash
docker exec <db-container> psql -U <db-user> -d <clone-db> -v ON_ERROR_STOP=1 \
  -c "BEGIN; UPDATE ir_cron SET active=false; UPDATE ir_mail_server SET active=false; COMMIT;"
```

A clone whose cron still fires will email real recipients during your test run.

## 4. Stage the module inside the container

Build the archive from the module's PARENT directory so the archive root matches the
destination, then ship it in — host `/tmp` is not container `/tmp`.

```bash
tar --exclude=__pycache__ --exclude='*.pyc' -czf - -C <repo>/addons <module> > /tmp/<module>.tgz
scp /tmp/<module>.tgz <host>:/home/deploy/backups/
ssh <host> 'set -e; docker exec -u 0 odoo mkdir -p /var/lib/odoo/<stage>/addons; \
  docker cp /home/deploy/backups/<module>.tgz odoo:/var/lib/odoo/<stage>/<module>.tgz; \
  docker exec -u 0 odoo tar -xzf /var/lib/odoo/<stage>/<module>.tgz -C /var/lib/odoo/<stage>/addons; \
  docker exec -u 0 odoo chown -R 100:101 /var/lib/odoo/<stage>; \
  docker exec odoo sha256sum /var/lib/odoo/<stage>/<module>.tgz'
```

Verify the staged copy is the new code before running anything: read the staged
`__manifest__.py` version, count `def test_` in its test tree, and `grep -F -c '<new symbol>'`
for a marker unique to the change. Also copy any sibling custom addon the module depends on
into the staging addons dir — the staging config omits the production addons path.

## 5. Generate the staging config from the production config

Parse the deployed `/etc/odoo/odoo.conf` with `configparser`, then override:

| Key | Value | Why |
| :--- | :--- | :--- |
| `addons_path` | `<stage>/addons,/usr/lib/python3/dist-packages/odoo/addons` | staging first, production dir omitted |
| `db_name` / `dbfilter` | the clone database, anchored `^<clone-db>$` | never the env database |
| `data_dir` | `<stage>/data` | keeps the production filestore untouched |
| `list_db` | `False` | no DB manager exposure |
| `workers`, `max_cron_threads` | `0` | single process, no scheduled work |
| `http_port`, `http_interface`, `http_enable` | `8079`, `127.0.0.1`, `False` | never collide with the live web port |
| `logfile` | `False` | logs land in the redirected run log |

Write it with `os.open(path, O_WRONLY | O_CREAT | O_EXCL, 0o600)` so the mode is right and a
re-run cannot silently overwrite an existing staging config. Copy the production filestore
into `<stage>/data/filestore/<clone-db>` so attachment and image reads resolve.

## 6. Run the upgrade with tests against the clone

```bash
STAGE=/var/lib/odoo/<stage>
docker exec -e ODOO_RC=$STAGE/odoo.conf odoo odoo server \
  -c $STAGE/odoo.conf -d <clone-db> -u <module> \
  --http-port=8079 --stop-after-init --no-http \
  --test-enable --test-tags /<module> --log-level=info > <host-run-log> 2>&1
```

The container exports `ODOO_RC=/etc/odoo/odoo.conf`; without `-e ODOO_RC=<staging conf>` the
image's config is merged ahead of yours and `/mnt/extra-addons` serves the OLD module while
the staged copy sits unused.

## 7. Evidence to collect (all of it, or the run is unverified)

- [ ] `addons paths: [...]` line at the top of the log — the production addons dir must be ABSENT
- [ ] exit code from the actual command, not from a pipeline
- [ ] `odoo.tests.result: X failed, Y error(s) of K tests` → verdict
- [ ] `odoo.tests.stats: <module>: N tests` → quote alongside K; the two counts can differ
- [ ] count of real `ERROR`/`CRITICAL` lines (use the printed count, not `grep`'s exit code)
- [ ] migration log lines, e.g. `module <module>: Running upgrade [<ver>>] post-<name>`
- [ ] `ir_module_module.latest_version` == the manifest version, read from the clone
- [ ] expected columns in `information_schema.columns`, expected tables, expected sequences
- [ ] source database re-probed read-only afterwards and reported as `production (post-check)`

## Pitfalls

- A post-migration runs once per module version: after editing `migrations/<ver>/post-*.py`,
  `-u` against the same clone will not re-run it. Recreate the clone from the dump before every
  retest, or the `0 rows` you are looking at is the previous execution.
- An unchanged `tests.stats` count (and no migration log line) after staging a fix means the
  registry read the old tree, not that the change was inert.
- A schema ahead of the deployed addon path breaks every later CLI entry point including
  `odoo shell` on that clone — treat the clone as usable only through the staged invocation
  that created it, or re-sync the deployed addon first.
- Keep the staging config out of logs and remove it from the container when the change ships,
  since it carries DB credentials.
