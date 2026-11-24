# Registry Version Audit — API Recipes (Read-Only)

Concrete query patterns for auditing image versions without pulling anything. All calls are GET-only.

## Docker Hub API v2 (hub.docker.com)
- Tag list: `GET https://hub.docker.com/v2/repositories/<owner>/<repo>/tags?page_size=100` (official images live under owner `library`).
- Responses are paginated via the `next` URL and ordered lexicographically — fetch 2–4 pages and sort semver in Python; never read the last element of page 1 as the latest.
- Each result item is an object; the tag string is `item["name"]`. Pass the string (not the dict) into regex filters.
- Anonymous access is generous; on HTTP 429 back off and retry once before giving up on that repo.

## GHCR (ghcr.io)
- Anonymous token: `GET https://ghcr.io/token?scope=repository:<owner>/<repo>:pull&service=ghcr.io` → `{"token": ...}`.
- Tags: `GET https://ghcr.io/v2/<owner>/<repo>/tags/list?n=100[&last=<last_tag_of_prev_page>]` with header `Authorization: Bearer <token>`; paginate with `last`.
- HTTP 404 on the tags endpoint means the package is not publicly visible — fall back to GitHub releases or the vendor's own release feed.

## GitHub Releases (api.github.com)
- Latest stable: `GET https://api.github.com/repos/<owner>/<repo>/releases/latest` → `tag_name`, `published_at`; it already skips prereleases.
- Recent history: `GET .../releases?per_page=10` — check the `prerelease` and `draft` flags per entry; a next-major prerelease line can be published daily alongside the stable line.
- Anonymous budget is ~60 requests/hour per IP — batch all repos into one script run instead of ad-hoc calls.
- Divergence rule: registries can carry image tags newer than the latest GitHub release (tags pushed without a release), and releases can exist before images publish. Registry tag existence (`docker manifest inspect`) is the deployability gate; GitHub is the changelog source.

## Candidate verification
- `docker manifest inspect IMAGE:<tag>` — exit 0 = tag exists; `-v` lists per-architecture manifests. Performs no pull.
- For multi-arch images confirm `linux/amd64` (and `linux/arm64` if any target node uses it).

## Tag-family filtering & sorting
- Compare within the installed tag family: `mysql:8` → tags matching `^8\.`, `postgres:18` → `^18\.`, WAHA `noweb-*` → sort by the embedded date triple, `caddy:2-alpine` → `^2\.`.
- Semver key: strip a leading `v`, use `re.search` (not an anchored match) so prefixed tags still parse; treat a missing patch segment as 0.
- Stability heuristic for registry tags: reject names matching `rc|beta|alpha|canary|pre|next|snapshot|dev` (case-insensitive).
- Host-side package sources: `apt-cache policy <pkg>` gives Installed vs Candidate from the configured repo — use it for Docker Engine / compose-plugin, and note the candidate can lag the GitHub release for weeks.
