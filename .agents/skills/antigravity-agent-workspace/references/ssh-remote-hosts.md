# Remote editing over SSH (host + client)

## code-server is not a connection target

Antigravity connects to a host over SSH and resolves the workspace there. A code-server
instance is a browser IDE served over HTTP; there is nothing for Antigravity to attach to.
Do not spend a turn trying to point the product at a `:3000`/`:8080` URL — plan the SSH path
instead, or keep using the browser IDE.

## Host prerequisites (infrastructure work — needs the owner's approval)

1. A non-root account with key-only authentication.
2. An account uid/gid that **matches the repository's owning uid**, or the editor can read
the repo and fail to write it.

Check which uid that is before designing anything:

```bash
stat -c '%u:%g %a' <repo> <repo>/src
find <repo> -path <repo>/.git -prune -o -printf '%u:%g\n' | sort | uniq -c | sort -rn
```

- A repo often carries **mixed ownership** (some trees written by the in-container user,
  some by an agent running as another uid). Report the histogram instead of assuming one
  regime.
- If the target uid/gid has no passwd/group entry on the host (`getent passwd <uid>`,
  `getent group <gid>` both empty), the cheapest correct design is to create the new login
  **with that uid/gid**: it then writes exactly the same files as the existing editor, with
  no `chown` of a live tree.
- Otherwise, make the shared trees group-writable and add the new user to that group. Either
  way, normalising permissions of a live repo is a separate, approved change.

## Write-access probe: never trust `docker inspect`

`"RW": true` in the mount table only says the *container runtime* did not mark the mount
read-only. The kernel checks the host inode's owner/group against the writer's **host** uid,
so a `755` directory owned by uid 10000 is unwritable for a process running as uid 1000 —
and `stat` inside the container shows a resolved user name, which makes it look fine.

Probe it for real, from inside the container, as the user that actually writes:

```bash
docker exec -u <user> <container> sh -lc 'cd <path> && touch .probe && rm .probe && echo WRITABLE'
```

Run this per directory that matters (the workspace root, each new top-level dir, any
generated output dir). Report read-only findings as blockers rather than discovering them
mid-task when a formatter fails.

## Files created from the orchestrator host

- A `ssh host 'tar -xzf - -C <repo>'` extraction can materialise with the **source uid from
the archive**, not the SSH user's uid. Always sweep after a bulk copy:

```bash
find <new paths> \( ! -uid <target> -o ! -gid <target> \) | wc -l   # want 0
chown -R <target>:<target> <new paths>
chmod -R u+rwX,g+rwX,o+rX <new paths>
```

  `u+rwX` keeps directories traversable and scripts executable without making every file
  executable.
- Make generated helper scripts executable explicitly (`chmod 755 scripts/<area>/*.sh`) and
  verify with `stat -c '%a %n'`.
- After extraction, verify structure (`find <dir> -maxdepth 2`), JSON validity
  (`python3 -c "import json;json.load(open('...'))"`), and counts before reporting.

## Client side (Windows)

1. Generate the key: `ssh-keygen -t ed25519 -C "<user-workstation>"`, stored under
   `%USERPROFILE%\.ssh\`.
2. Add a host block to `%USERPROFILE%\.ssh\config`: `Host <alias>`, `HostName`, `Port`,
   `User`, `IdentityFile`. The alias is what the editor's connection picker will offer.
3. Keep `AllowTcpForwarding` enabled on the server when the client needs port forwarding.
4. Confirm the account can write the repo (probe above) **before** opening the project — a
   read-only workspace looks like a broken agent, not a permissions problem.
