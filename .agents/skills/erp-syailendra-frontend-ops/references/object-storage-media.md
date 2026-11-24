# Object storage for ERP media (S3-compatible, self-hosted)

Use when the owner asks that images, documents, or video move out of the Odoo filestore into
an S3-compatible service (self-hosted Supabase Storage, MinIO/RustFS, R2, S3). Read
`scm-domain-ssot.md` first: the model boundary (`syailendra.media`, one generic table) does
not change — only where the bytes live.

## Division of responsibility

| Layer | Owns |
| :--- | :--- |
| Odoo `syailendra.media` | Identity and authorization: `res_model`, `res_id`, `kind`, `role`, `storage_key`, `checksum`, `mimetype`, `file_size`, `duration`, `company_id` |
| Object storage | Bytes only, addressed by `storage_key` |
| Next.js route | The only reader/writer: session check → MIME sniff → size/quota check → put/stream with server-side credentials |

Never hand an object URL to the client and never let the browser hold a service key. Metadata
that a listing needs (mimetype, size, checksum, caption) stays in Odoo so list queries never
touch storage at all.

## Provider facts worth verifying once, not assuming

- **The S3 protocol endpoint and the storage backend are independent.** A self-hosted
  Supabase Storage serving from local files still exposes a working `/storage/v1/s3`
  endpoint; "backend is `file`" does not disable S3 clients. Confirm with an unsigned request
  (`403` = route alive and asking for a signature; `404` = endpoint off).
- **Path-style, SigV4, dummy region.** For self-hosted use `endpoint` ending in
  `/storage/v1/s3`, `forcePathStyle: true`, `signatureVersion: 'v4'`, and one consistent
  region string. Virtual-hosted style needs per-bucket DNS that does not exist here.
- **Read the limit gates outside the app before promising a byte cap.** A 50 MB video can be
  rejected by the reverse proxy (`client_max_body_size`) or by the storage service's own
  `file_size_limit` long before your handler sees it. Enumerate: proxy body limit, storage
  service limit, service memory cap (stream, never buffer the whole object), and whether a
  CDN in front is proxy-enabled (a DNS-only record has no proxy body limit).
- **`Range` is required for video.** Return `206` with `Content-Range` from the storage
  stream; a route that always answers `200` full-body makes the player re-download on seek.
- **Multipart above a few MB.** Use multipart or streaming for anything over ~5 MB so the
  service's memory cap is not the effective limit.
- **A public bucket decides READS only — it never authorises writes.** In self-hosted Supabase
  Storage the object API refuses every upload unless an RLS policy exists on `storage.objects`;
  a public bucket only bypasses that check for downloads. Uploads therefore belong on the
  S3-protocol path with the service access key (`S3_PROTOCOL_ACCESS_KEY_ID/SECRET`), and that
  path must be *proven* with a real `PutObject` → `HeadObject` → `GetObject(Range)` →
  `DeleteObject` round trip **before any UI is wired** — a working list/detail screen says
  nothing about the write. Probe recipe: `scripts/storage-gate-probe.sh`.
- **The effective byte cap is the smallest of three independent limits:** reverse-proxy body
  limit → global storage `FILE_SIZE_LIMIT` → bucket `file_size_limit`. A bucket-level limit can
  only *tighten* the global one, so read `storage.buckets.file_size_limit` as well before
  promising a per-kind cap. `pg_policies` returning zero rows for `storage.objects` is the
  normal state of a freshly deployed stack, not a misconfiguration to "fix" silently.
- **Count objects before planning a byte migration.** `storage.objects` row count plus the
  volume footprint (`du -sh <stack>/volumes/storage`) decide whether existing files must be
  moved at all: an empty bucket (only `.gitkeep`) means the work is schema + code + release,
  with no backfill and no compatibility branch for old rows.

## Prerequisites to prove before writing the storage client

Four things live outside your code, and each one silently breaks the feature if assumed:

- **The credentials exist on this host.** Count them (`grep -c '^<KEY>=' .env.local`) before
  designing anything; request them from the infrastructure owner as a mode-600 server-only
  file. Never a `NEXT_PUBLIC_*` variable, never copied out of another host's stack env, never
  printed or pasted into chat.
- **The bucket exists and you know its visibility.** A `ListBuckets` with the app key is the
  proof — not a deployment note, which may describe a bucket from an earlier backend.
- **The integration account may `create` on the media model.** A read-only ACL row
  (`1,0,0,0` for the API group) raises `AccessError` on the first upload while every list and
  detail screen keeps working, so the failure looks like a storage fault. Check the ACL row and
  probe the create with the app's own credentials before wiring the UI.
- **The disk has headroom and a quota story.** Object storage co-located with the app shares one
  filesystem, and a bucket with no configured limit grows until the disk does. Measure free
  space, state the per-file and per-entity caps, and set a disk alert before adding a video
  tier — "the bucket is fine" is not measured anywhere else in the stack.

## Write path

1. Validate the session and the target entity before accepting bytes.
2. Sniff the MIME from magic bytes (JPEG/PNG/WebP/PDF, MP4/WebM); never trust the extension
   or the browser's `Content-Type`.
3. Enforce the per-kind cap and the per-entity quota.
4. `putObject` under a non-guessable key (UUID, not a business name):
   `media/{model}/{id}/{uuid}.{ext}`.
5. Create the Odoo row with the key, checksum (SHA-256), mimetype and size.
6. If the Odoo create fails, delete the object — otherwise the bucket accumulates orphans
   that no row references.

## Read path

One route per kind (`image`, `document`, `video`) resolving `id` → row → `storage_key`, then
streaming. Session required for operational media; branding assets may stay public so the
pre-login screen renders. Whitelist the model/field pairs; anything else is `404`.

## Delete path and orphan reconciliation

Delete the storage object first, then the row, then record the action. Neither order is
self-healing: a failed storage delete leaves a byte-accessible object with no row, and a
failed row delete leaves a row pointing at nothing. Ship a read-only reconciliation report
(`rows without objects` / `objects without rows`) as a manual command rather than an
unattended job, and never let the UI claim a file is gone based on the row alone.

## Test plan that actually proves the integration

- Unit: key builder (no user input in the path), MIME sniff on both real and renamed files,
  per-kind cap, checksum.
- Integration in a clone: upload → row created with key + checksum → object present in the
  storage volume → download returns identical bytes → `Range` request returns `206` with the
  right slice.
- Negative: wrong kind, oversized file, foreign entity id, no session.
- One real upload at the stated maximum size — the only way to prove the proxy and storage
  limits allow it.
