# Deploying Frontend File Changes to the code-server Container

## Pattern

Files are staged on the host, copied into the `code-server` container with `docker cp`, then extracted and verified inside via `docker exec code-server bash`.

```bash
# 1) Stage on the host (never /home/coder/... — invisible inside the container)
tar czf /tmp/wave.tgz <files>
scp -q -F /opt/data/.ssh/config /tmp/wave.tgz octa-host:/tmp/wave.tgz

# 2) Copy into container (host /tmp is NOT container /tmp)
ssh -F /opt/data/.ssh/config octa-host 'docker cp /tmp/wave.tgz code-server:/tmp/wave.tgz'

# 3) Extract inside container, fix ownership, run gates
ssh -F /opt/data/.ssh/config octa-host '
  cd /opt/octa/workspace/erp-syailendra
  tar xzf /tmp/wave.tgz -C .
  docker exec -u 0 code-server chown 1000:1000 <extracted files>
  docker exec code-server bash /tmp/gate.sh
'
```

## Pitfalls

- **Host `/tmp` ≠ container `/tmp`.** Piping to `ssh host 'cat > /tmp/x.tgz'` and then running `docker exec code-server tar xzf /tmp/x.tgz` extracts whatever stale archive is already inside the container — old code runs and the failures you chase are phantoms. Always `docker cp` first, then extract, then verify a marker of the new code inside the container.
- **Ownership.** Files written over SSH land as uid `10000`; `code-server` runs as uid `1000`. `prettier --write` fails with `EACCES: permission denied` on exactly the files that need reformatting. Run `docker exec -u 0 code-server chown 1000:1000 <files>` before the format gate — a directory `chown` without `-R` does **not** reach contents, so enumerate the files.
- **Bracket paths.** Paths containing `[locale]` or `(dashboard)` break shell globbing and character classes; pass them as single-quoted arguments, or use `find ... -print0 | xargs -0 ...`.
- **Gates run inside the container.** `prettier`, `eslint`, `tsc`, and the i18n namespace checker all live at `/opt/node/bin` inside `code-server`; prefix with `export PATH=/opt/node/bin:$PATH` or invoke `./node_modules/.bin/prettier` from the project root.
