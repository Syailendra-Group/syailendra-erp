---
name: docker-management
description: Manage Docker containers, images, volumes, and Compose.
version: 1.0.0
author: sprmn24
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [docker, containers, devops, infrastructure, compose, images, volumes, networks, debugging]
    category: devops
    requires_toolsets: [terminal]
---

# Docker Management

Manage Docker containers, images, volumes, networks, and Compose stacks using standard Docker CLI commands. No additional dependencies beyond Docker itself.

## When to Use

- Run, stop, restart, remove, or inspect containers
- Audit remote registries for container image updates (read-only)
- Execute staged container updates with pre-pull, an explicit interruption window, and rollback safety
- Build, pull, push, tag, or clean up Docker images
- Work with Docker Compose (multi-service stacks)
- Manage volumes or networks
- Debug a crashing container or analyze logs
- Check Docker disk usage or free up space
- Review or optimize a Dockerfile

## Prerequisites

- Docker Engine installed and running
- User added to the `docker` group (or use `sudo`)
- Docker Compose v2 (included with modern Docker installations)

Quick check:

```bash
docker --version && docker compose version
```

## Quick Reference

| Task | Command |
|------|---------|
| Run container (background) | `docker run -d --name NAME IMAGE` |
| Stop + remove | `docker stop NAME && docker rm NAME` |
| View logs (follow) | `docker logs --tail 50 -f NAME` |
| Shell into container | `docker exec -it NAME /bin/sh` |
| List all containers | `docker ps -a` |
| Build image | `docker build -t TAG .` |
| Compose up | `docker compose up -d` |
| Compose down | `docker compose down` |
| Disk usage | `docker system df` |
| Cleanup dangling | `docker image prune && docker container prune` |
| Read-only manifest inspect | `docker manifest inspect REGISTRY/IMAGE:TAG` |

## Procedure

### 1. Identify the domain

Figure out which area the request falls into:

- **Container lifecycle** → run, stop, start, restart, rm, pause/unpause
- **Container interaction** → exec, cp, logs, inspect, stats
- **Image management** → build, pull, push, tag, rmi, save/load
- **Docker Compose** → up, down, ps, logs, exec, build, config
- **Volumes & networks** → create, inspect, rm, prune, connect
- **Troubleshooting** → log analysis, exit codes, resource issues

### 2. Container operations

**Run a new container:**

```bash
# Detached service with port mapping
docker run -d --name web -p 8080:80 nginx

# With environment variables
docker run -d -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=mydb --name db postgres:16

# With persistent data (named volume)
docker run -d -v pgdata:/var/lib/postgresql/data --name db postgres:16

# For development (bind mount source code)
docker run -d -v $(pwd)/src:/app/src -p 3000:3000 --name dev my-app

# Interactive debugging (auto-remove on exit)
docker run -it --rm ubuntu:22.04 /bin/bash

# With resource limits and restart policy
docker run -d --memory=512m --cpus=1.5 --restart=unless-stopped --name app my-app
```

Key flags: `-d` detached, `-it` interactive+tty, `--rm` auto-remove, `-p` port (host:container), `-e` env var, `-v` volume, `--name` name, `--restart` restart policy.

**Manage running containers:**

```bash
docker ps                        # running containers
docker ps -a                     # all (including stopped)
docker stop NAME                 # graceful stop
docker start NAME                # start stopped container
docker restart NAME              # stop + start
docker rm NAME                   # remove stopped container
docker rm -f NAME                # force remove running container
docker container prune           # remove ALL stopped containers
```

**Interact with containers:**

```bash
docker exec -it NAME /bin/sh          # shell access (use /bin/bash if available)
docker exec NAME env                   # view environment variables
docker exec -u root NAME apt update    # run as specific user
docker logs --tail 100 -f NAME         # follow last 100 lines
docker logs --since 2h NAME            # logs from last 2 hours
docker cp NAME:/path/file ./local      # copy file from container
docker cp ./file NAME:/path/           # copy file to container
docker inspect NAME                    # full container details (JSON)
docker stats --no-stream               # resource usage snapshot
docker top NAME                        # running processes
```

### 3. Image management & read-only update audits

**Read-only update auditing (zero pull, non-destructive):**
When requested to check for image updates across running containers without mutating the host:
- Do NOT run `docker pull` (it overwrites local images and introduces untested layers).
- Inspect running containers and Compose separately. Resolve the running image with `docker inspect CONTAINER --format '{{.Image}}'`, then inspect that exact image ID for `RepoDigests`, architecture, and labels. Query the running application version when a tag is floating. Inspecting the local tag alone can report a newer image than the container actually runs.
- Distinguish the three identifier types clearly when comparing local and remote images:
  - **Multi-arch Manifest List Digest** (`RepoDigests` / top-level `docker pull` digest) — the OCI index digest pointing to all platform manifests.
  - **Platform Manifest Digest** — the architecture-specific manifest digest inside the index (`linux/amd64`).
  - **Local Image Config ID** (`docker images --no-trunc` / `.Id`) — the local unpacked config hash, which never matches registry manifest digests. Compare `RepoDigests` to the remote index digest, not to the local image ID.
- Query remote registry manifests using `docker manifest inspect -v <image>:<tag>` to verify target tag existence and architecture support (`linux/amd64`, `linux/arm64`).
- Query registry APIs (Docker Hub API v2, GHCR API via bearer token) or release repositories to compare SemVer tags and inspect release notes/changelogs.

**Multi-node version audit workflow (proven end-to-end):**
1. **Inventory via SSH, not the agent shell.** If the agent runs inside a container (no Docker socket, no `/opt` stacks visible), run every host-side command over the SSH host alias: list stack dirs, grep `image:` lines from compose files plus version pins from `.env`, `docker ps --format`, `docker version`, and `apt-cache policy docker-ce docker-compose-plugin` on every node — the Docker apt repo lags GitHub releases, so apt candidate ≠ latest release.
2. **Query registries read-only** using `references/registry-version-audit.md`: Docker Hub API v2 tags, GHCR anonymous token flow, and official release channels. Compare within the installed major, edition, OS variant, and architecture. Report overall stable separately from the compatible maintenance target; a newer major or Debian-to-Alpine switch is a separate migration decision. Treat `scripts/version_audit.py` as a candidate-listing helper only: its bounded pagination and coarse family matching cannot establish the latest compatible stable release.
3. **Verify deployability of each candidate tag** with `docker manifest inspect IMAGE:<tag>` before recommending rollout. A GitHub release existing does not prove the image tag is published, and registries carry tags with no matching release — the registry is the deployability gate, GitHub is the changelog source.
4. **Report per node** (installed → latest stable → action), then gate every change behind the staged-update workflow in section 4. Version audits are read-only; never fold a pull or recreate into the audit turn.

Version-comparison pitfalls:
- Filter prereleases and unrelated editions before parsing. Use a family-specific full match after removing a known prefix, or a regex anchored to that prefix; an unrestricted numeric search can rank an RC counter, OS suffix, or desktop date above the server release. Treat missing patch components as zero only when the project's version scheme permits them; if the requested family has no match, report unresolved rather than substituting another family.
- Filter prereleases explicitly: GitHub releases carry a `prerelease` flag; registry tags need a name heuristic (`rc|beta|alpha|canary|pre|next|snapshot|dev`, case-insensitive). Projects publish a next-major prerelease line alongside stable — "latest release" without the filter recommends a prerelease.
- Bump lockstep image pairs together (n8n ↔ its runners image share the version); a mismatch between them breaks runner registration.
- Some repos publish two version schemes at once (semver `v0.x` server tags and date-based `vYYYY.M.D` desktop builds); identify which scheme the GitHub release channel tracks before declaring "latest".
- Never label a running floating tag (`:latest`, `:alpine`, or a major-only tag) current from its name. Compare runtime version and like-for-like registry digests; without those, mark update status unverified. A floating channel can follow mainline or prerelease rather than stable.
- Treat `apt-cache policy` as the locally cached package candidate. If index freshness is unknown, verify the vendor repository read-only or qualify the candidate; equal Installed/Candidate is not proof of current upstream versions. Do not refresh package indexes as part of a no-change audit.
- Distinguish patch, minor, and major transitions numerically; a patch-numbered target can still be a minor upgrade from the installed version. Read the full intervening release range before claiming no breaking changes.

**Build, pull, and tag:**

```bash
# Build
docker build -t my-app:latest .
docker build -t my-app:prod -f Dockerfile.prod .
docker build --no-cache -t my-app .              # clean rebuild
DOCKER_BUILDKIT=1 docker build -t my-app .       # faster with BuildKit

# Pull and push
docker pull node:20-alpine
docker login ghcr.io
docker tag my-app:latest registry/my-app:v1.0
docker push registry/my-app:v1.0

# Inspect
docker images                          # list local images
docker history IMAGE                   # see layers
docker inspect IMAGE                   # full details
docker manifest inspect IMAGE:TAG      # inspect remote manifest without pulling

# Cleanup
docker image prune                     # remove dangling (untagged) images
docker image prune -a                  # remove ALL unused images (careful!)
docker image prune -a --filter "until=168h"   # unused images older than 7 days
```

### 4. Staged container updates & controlled interruption

For updating production services safely, follow this six-stage workflow. Pre-pull reduces download time during cutover; it does not provide zero downtime for a single-instance service. Give estimated interruption and observation windows separately, then measure actual downtime.

1. **Pre-Flight Verification:**
   - Check host disk space (`df -h`, `docker system df`) to ensure sufficient capacity for new image layers.
   - Check `git status` and `git diff` on the stack repository first — uncommitted changes in `compose.yaml` (such as added networks or volume mounts) must be preserved and accounted for before patching image tags.
   - For floating tags (`:stable`, `:latest`, `:18`), record the current image ID or tag it explicitly (`docker tag <image>:<floating_tag> <image>:rollback-<date>`) before pulling so the prior image remains addressable for rollback.
   - **Before trusting any earlier snapshot, check whether the host restarted since it was taken.** Container `Up N` that is far shorter than the previous reading, or `RestartCount` freshly reset with every container sharing one `StartedAt`, means an unplanned host/daemon restart happened in between. Confirm with `uptime -s`, `who -b`, and `docker inspect <c> --format '{{.State.StartedAt}}'`, and report it as a finding — an unexplained reboot invalidates "zero running executions" and quiet-window assumptions taken before it.
   - For workflow engines, derive the database role/schema from live configuration and require successful read-only SQL before reporting execution counts. SQL/authentication errors or empty suppressed output are `DATA_INCOMPLETE`, not zero. Recheck active/new work immediately before cutover and plan how to drain or pause ingress/schedulers; an earlier `running = 0` snapshot cannot reserve a quiet window.
2. **Pre-Pull Image:** After execution approval, pull each exact approved version/variant while the old container serves; record its digest and platform. Recheck space for images plus verified backup/restore-test needs and rollback images. Allow generous transfer time without making a downtime guarantee; never pull a floating tag to discover which version will be deployed.
3. **Atomic State & Config Backup:**
   - Save compose and environment definitions (`cp -a compose.yaml compose.yaml.backup_<old_version>`, `cp -a .env .env.backup_<old_version>`, `chmod 600`), keeping backup files out of git tracking (or updating only tracked `.env.example` when committing version bumps).
   - Backup persistent database atomically: SQLite `VACUUM INTO '<backup_path>.sqlite'`, PostgreSQL `pg_dump -Fc -U "$POSTGRES_USER" -d "$POSTGRES_DB" > backup.dump` (verify dump header `PGDMP` and `pg_restore --list` table count before proceeding).
4. **Configuration Patch & Recreate:**
   - Update the image tag in `compose.yaml` (or `.env` + `.env.example`).
   - Validate with `docker compose config -q` without printing interpolated secrets. Once dependencies are confirmed healthy, use `docker compose up -d --no-deps <approved-service-names>` and inspect startup/migration logs. Include every lockstep app/runner service; leave separately scheduled database changes unapplied.
   - **Self-Dependency Guard & Gateway Cutover Pattern:** If recreating an AI gateway, proxy, or agent container that routes the current session's own inference or messaging traffic, executing `docker compose up -d` in-session immediately severs the connection. Never run bare in-session recreation for the host agent container:
     - Pre-tag the running image (`docker tag <repo>:<tag> <repo>:rollback-<old_version>`) and back up compose/environment definitions.
     - Delegate the cutover to an unattached host-side runner via `systemd-run --unit=<unit_name> <script.sh>` or detached background script.
     - Enforce a watchdog healthcheck timeout of at least **300–360 seconds** (not 60–90s): image upgrades that introduce or bump Python/runtimes run `stage2` package manager rebuilds (`pm.recovery` / virtual environment sync, ~1.5–2.5 GB) before opening the HTTP port. Setting too short a timeout triggers premature false-positive rollbacks.
     - On health failure past the timeout, the host script automatically rolls back `compose.yaml` to the saved backup and recreates from the rollback image tag.
5. **Acceptance Testing:** Verify container `Up`/`healthy` state, local and public HTTP health/readiness endpoints, worker/runner broker registration, and absence of schema migration errors.
6. **Rollback SOP (Fallback):** Define the rollback trigger and authority before cutover:
   - Stop affected application writers/workers before any database rollback; avoid unrelated full-stack teardown.
   - Compare migration identifiers with the pre-upgrade baseline. An old image alone does not reverse schema changes; use a documented, verified migration revert when supported or the matching backup.
   - Obtain explicit authorization for destructive restore unless already granted for this exact recovery action; disclose loss of writes since the recovery point. Restore into an isolated target first where practical, and keep the failing state for diagnosis.
   - Start old application and matching runner images only after the database and encryption key/data files match their expected state; rerun readiness and safe functional tests.

For n8n/PostgreSQL upgrade planning, including drain, backup completeness and minor-release advisories, use `references/stateful-compose-upgrades.md`.

### 5. Docker Compose

```bash
# Start/stop
docker compose up -d                   # start all services detached
docker compose up -d --build           # rebuild images before starting
docker compose down                    # stop and remove containers
docker compose down -v                 # also remove volumes (DESTROYS DATA)

# Monitoring
docker compose ps                      # list services
docker compose logs -f api             # follow logs for specific service
docker compose logs --tail 50          # last 50 lines all services

# Interaction
docker compose exec api /bin/sh        # shell into running service
docker compose run --rm api npm test   # one-off command (new container)
docker compose restart api             # restart specific service

# Validation
docker compose config                  # validate and view resolved config
```

**Minimal compose.yml example:**

```yaml
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      # Password comes from the POSTGRES_PASSWORD secret, not the URL
      - DATABASE_URL=postgres://mydb_user@db:5432/mydb
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

### 6. Volumes and networks

```bash
# Volumes
docker volume ls                       # list volumes
docker volume create mydata            # create named volume
docker volume inspect mydata           # details (mount point, etc.)
docker volume rm mydata                # remove (fails if in use)
docker volume prune                    # remove unused volumes

# Networks
docker network ls                      # list networks
docker network create mynet            # create bridge network
docker network inspect mynet           # details (connected containers)
docker network connect mynet NAME      # attach container to network
docker network disconnect mynet NAME   # detach container
docker network rm mynet                # remove network
docker network prune                   # remove unused networks
```

### 7. Disk usage and cleanup

#### Targeted disk-reclamation workflow (before any image/cache/volume deletion)

1. Capture a baseline from the Docker host: `df -B1 -T /`, `docker system df -v`, `docker ps -a --no-trunc`, and `docker images --digests --no-trunc`. Save a non-secret inventory/manifest to a protected backup path before removing tags.
2. Present the exact paths/tags, measured size, likely recoverable amount, and consequences (including loss of rollback or need to re-pull); obtain approval for that exact set.
3. Recheck each image by immutable image ID and list every container that references it. Use one explicit loop that prints the candidate and matching container names; abort if any reference is found or any command fails. Do not hide errors behind `|| true`, `2>/dev/null`, or a malformed variable expansion.
4. Remove only approved image tags with explicit `docker rmi <repo:tag>` (no `-f`, no broad prune); preserve active and approved rollback tags. Shared layers may remain because another image references them.
5. Verify with a fresh image inventory, `docker system df -v`, and `df -B1 -T /`; report the observed filesystem byte delta, not the sum of image virtual sizes. Separately verify all containers are still running and probe health from the correct network namespace; `running` alone is not health, and a host-side `000` against an internal loopback bind is inconclusive.

For file/cache cleanup, measure and record the exact selected paths first; never combine separate cache directories or user data into an unreviewed wildcard deletion. For backup candidates, verify the exact artifact's remote object key, byte size, and SHA-256 in every required destination; a successful routine bundle does not prove an unrelated local dump was uploaded.

```bash
# Check what's using space
docker system df                       # summary
docker system df -v                    # detailed breakdown

# Host-side measurement: always -x (nested overlay mounts are otherwise double-counted)
du -xsh /var/lib/docker /var/lib/containerd; df -hT /
stat -c '%A %U:%G %n' /var/lib/docker  # 0710 root:root → a non-root du reads ~4.0K
# Reminder: with the containerd image store, image layers sit in /var/lib/containerd
# while /var/lib/docker holds metadata — measuring the Docker root alone under-reports.

# Audit installed images vs container usage (identify unused & dangling)
docker images --format '{{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.Size}}'
docker ps -a --format '{{.Image}}\t{{.Names}}\t{{.Status}}'

# Targeted cleanup (safe)
docker container prune                 # stopped containers
docker image prune                     # dangling images
docker volume prune                    # unused volumes
docker network prune                   # unused networks

# Aggressive cleanup (confirm with user first!)
docker system prune                    # containers + images + networks
docker system prune -a                 # also unused images
docker system prune -a --volumes       # EVERYTHING — named volumes too
```

**Warning:** Never run `docker system prune -a --volumes` without confirming with the user. This removes named volumes with potentially important data.

## Pitfalls

| Problem | Cause | Fix |
|---------|-------|-----|
| Container exits immediately | Main process finished or crashed | Check `docker logs NAME`, try `docker run -it --entrypoint /bin/sh IMAGE` |
| "port is already allocated" | Another process using that port | `docker ps` or `lsof -i :PORT` to find it |
| "no space left on device" | Docker disk full | `docker system df` then targeted prune |
| Can't connect to container | App binds to 127.0.0.1 inside container | App must bind to `0.0.0.0`, check `-p` mapping |
| Permission denied on volume | UID/GID mismatch host vs container (e.g. n8n runs as node UID 1000, Odoo as UID 101, PostgreSQL alpine as UID 70) | Inspect UID with `docker run --rm IMAGE id`, then `chown -R <uid>:<gid>` host bind mounts before starting container (e.g., `chown -R 1000:1000 <data_dir>` for n8n to avoid EACCES config open errors) |
| Compose services can't reach each other | Wrong network or service name | Services use service name as hostname, check `docker compose config` |
| Ad-hoc network disconnected on recreate | `docker network connect` used at runtime without compose declaration | Declare external networks in `compose.yaml` under root `networks:<name>: external: true` |
| Extended downtime during compose update | Downloading image layers after container is already stopped | Run `docker pull <image>` before `docker compose up -d` |
| Mutating host during read-only audit | Running `docker pull` or stopping containers when auditing updates | Use `docker manifest inspect` and registry APIs (Docker Hub / GHCR) without pulling |
| App advertises "update available" but no matching image tag exists | The app's built-in version check often reads npm/GitHub releases, not the container registry — image publishing can lag or fail independently | Confirm the tag first (`docker manifest inspect IMAGE:TAG` or a registry API call) and treat the in-app badge as advisory; never plan or announce an upgrade from the app's own version endpoint alone |
| "Newest" tag absent from a registry tag listing | Registry `/tags/list` responses are paginated (100 per page) and ordered lexicographically, not by recency | Paginate with `?n=100&last=<last_tag_of_previous_page>` and sort semver numerically; never read the last element of page 1 as the latest release |
| Upgrading stateful service without rollback snapshot | In-place database schema migrations prevent downgrade | Snapshot SQLite with `VACUUM INTO` or dump DB before recreating container |
| Self-hosting container upgrade triggers premature rollback | Watchdog timeout (60–90s) is too short for stage2 venv dependency rebuilds during first-boot | Set host watchdog health probe deadline to >=300–360s and keep a pinned rollback image tag |
| Odoo single-threaded deadlock on report generation | `workers = 0` runs Odoo in a single process; hanging `wkhtmltopdf` blocks all incoming HTTP requests entirely (browser times out with 0 bytes) | Configure `workers = 2` (or more) and `max_cron_threads = 1` in `odoo.conf` so web traffic is served by dedicated HTTP workers isolated from report generators and cron |
| 9Router remote access blocked with default password | 9Router forbids remote/reverse-proxy access if admin password remains default (`123456`) | Inject `INITIAL_PASSWORD: <strong_password>` into container environment or `.env` during deployment |
| n8n deprecation drift on minor updates | Default limits for package installs, runner timeouts, and compression node quotas change between minor versions | Explicitly pin `N8N_UNVERIFIED_PACKAGES_ENABLED: "true"`, `N8N_RUNNERS_TASK_TIMEOUT: "300"`, `N8N_COMPRESSION_NODE_MAX_DECOMPRESSED_SIZE_BYTES: "2147483648"`, `N8N_COMPRESSION_NODE_MAX_ZIP_ENTRIES: "5000"`, and `EXECUTIONS_DATA_PRUNE: "true"` in compose environment |
| Monolithic/ERP stacks (Odoo, ERPNext) consume unbounded RAM | Multiprocessing spawns multiple workers each loading full ORM into RAM | Set explicit container memory limit (`limits.memory: 1200M`) and limit worker count (`workers = 2`) |
| Cleanup wipes rollback images | `docker image prune -a` removes all unused images including pinned `:rollback-*` targets | Never use `-a` on hosts maintaining rollback tags; prune specific superseded tags (`docker rmi <old_images>`) or use age filter (`--filter until=168h`) |
| Build cache not working | Layer order wrong in Dockerfile | Put rarely-changing layers first (deps before source code) |
| Image too large | No multi-stage build, no .dockerignore | Use multi-stage builds, add `.dockerignore` |
| WhatsApp API / WAHA container consumes unbounded RAM | Defaulting to headless browser engines (`WEBJS` / Puppeteer) spins up Chromium consuming 600–1200+ MiB RAM per session and spikes CPU | Force pure WebSocket engines (`WHATSAPP_DEFAULT_ENGINE=NOWEB` for Baileys or `GOWS` for whatsmeow) to keep footprint under 250 MiB and cap memory (`limits.memory: 512M`) to prevent host OOM killer invocations |
| Scanning root disk hangs on Docker host | Recursive `find /` or `du -hd1 /` traverses `/var/lib/docker/overlay2` plus every nested container `overlay` mount, causing CLI timeouts (60s+) on tens of thousands of layers | Rely on `docker system df -v` for logical sizes, scope host scans to application paths (`find /opt -type f -size +100M`), and bound every scan with `timeout N`; never run the sweep synchronously if it spans several hosts |
| `du` disagrees with `df` about Docker disk usage — root dir reads a few KB, or per-directory numbers sum to more than the filesystem holds | Two independent mechanisms: (a) `du` without `-x` descends into nested `overlay` mounts and double-counts container rootfs (`/var/lib/docker` can read ~6.8 GB when the single-filesystem truth is ~57 MB); (b) with the containerd image store, image layers live under `/var/lib/containerd` while `/var/lib/docker` holds metadata, and `/var/lib/docker` is mode `0710 root:root`, so a non-root SSH user's `du` silently prints the directory's own size (`4.0K`) | Measure with `du -xsh` / `du -xhd1 /` and reconcile against `df -h <fs>`; pair with `docker system df` and label it as Docker's accounting, not filesystem truth; check `id` and `stat -c %A %U:%G /var/lib/docker` before trusting a tiny reading. Never publish per-directory numbers that cannot be summed to the filesystem total |
| Exposing containerized admin dashboard on public subdomain without auth | Public web dashboards (such as WAHA `/dashboard` or code-server) exposed via edge reverse proxy allow unauthorized session pairing, token extraction, and QR hijacking | Enforce HTTP Basic Auth (`WAHA_DASHBOARD_USERNAME`/`WAHA_DASHBOARD_PASSWORD`), API key validation (`WAHA_API_KEY`), and automated media pruning (`WAHA_MEDIA_PRUNING_ENABLED=true`) to protect against unauthorized pairing and disk exhaustion |
| Dashboard QR scanning fails to update or disconnects | Ingress reverse proxy drops WebSocket connections needed for real-time QR stream and state transitions | Ensure edge reverse proxy (e.g. Caddy) supports WebSocket upgrades, configure timeout allowances, and bind container port to `0.0.0.0:<port>` so the upstream ingress router can reach it |
| Host Docker daemon patch upgrade restarts all containers | Default omission of `/etc/docker/daemon.json` leaves `live-restore` off (`false`), terminating running containers when `dockerd` restarts | Inspect `docker info --format '{{.LiveRestoreEnabled}}'`; enable `{"live-restore": true}` in `/etc/docker/daemon.json` and apply via `systemctl reload docker` (SIGHUP) without container downtime before running `YY.MM.x` APT upgrades in a transient `systemd-run` unit |
| Recreating dev IDE container kills hosted background web apps | Unmanaged background processes (e.g. `nohup npx next start`) inside containers like `code-server` stop on recreate and lack entrypoint auto-start | Inspect active processes (`docker exec <name> ps -ef`) before stopping, re-spawn them immediately via `docker exec -d` after `docker compose up -d`, and verify HTTP 200 |
| `pkill -f <pattern>` kills its own shell (exit 143 / SIGTERM, empty output) | `pkill -f` matches the full command line, and the pattern text appears inside the `sh -c "..."` argument of the very shell running it — so pkill matches itself (likewise a bare `pgrep -f` lists its own invocation) | Bracket one character so the pattern cannot match its own command line: `pkill -f "[n]ext-server"`, or resolve PIDs with `pgrep -f "[n]ext-server"` and kill them explicitly |
| In-container formatter/linter/build fails with EACCES right after files were copied in | `docker cp`, or a host-side `cp` into a bind-mounted repo, leaves the new files owned by root while the container process runs as its own UID (e.g. 1000) | `chown -R <uid>:<gid> <paths>` on the host after copying, before invoking in-container tooling |
| Container lifecycle failure alerts cannot run inside the failing container | When a container crashes, is OOM-killed, or stops, in-container hooks and agents terminate immediately and cannot send notifications | Stream `docker events --filter type=container --format '{{json .}}'` from an external host-level systemd unit (`After=network-online.target docker.service`, `Restart=always`). Filter for `die` (inspect `ExitCode`, `OOMKilled`, and sanitized `docker logs --tail`), and delay `start` recovery alerts by 3-5 seconds to verify stabilization (`State.Running == True`) before posting to Telegram |
| Restore test into a freshly started DB container fails (`database system is shutting down`) or "passes" against an empty database | The entrypoint runs a temporary server during init and shuts it down again, so a readiness check can answer once and then flip false; and a restore whose exit status was read through a pipe (`cmd \| tail`) always looks like success | Gate on a *sustained* `accepting connections` plus `docker inspect -f '{{.State.Running}}'` = `true`, capture `pg_restore`'s own `$?` into a file-redirected log, and assert the row counts are numeric instead of trusting the exit path |

## Verification

After any Docker operation, verify the result:

- **Container started?** → `docker ps` (check status is "Up")
- **Logs clean?** → `docker logs --tail 20 NAME` (no errors)
- **Port accessible?** → `curl -s http://localhost:PORT` or `docker port NAME`
- **Image built?** → `docker images | grep TAG`
- **Compose stack healthy?** → `docker compose ps` (all services "running" or "healthy")
- **Disk freed?** → `docker system df` (compare before/after)

## Dockerfile Optimization Tips

When reviewing or creating a Dockerfile, suggest these improvements:

1. **Multi-stage builds** — separate build environment from runtime to reduce final image size
2. **Layer ordering** — put dependencies before source code so changes don't invalidate cached layers
3. **Combine RUN commands** — fewer layers, smaller image
4. **Use .dockerignore** — exclude `node_modules`, `.git`, `__pycache__`, etc.
5. **Pin base image versions** — `node:20-alpine` not `node:latest`
6. **Run as non-root** — add `USER` instruction for security
7. **Use slim/alpine bases** — `python:3.12-slim` not `python:3.12`
