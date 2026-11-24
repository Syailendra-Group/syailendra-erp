#!/usr/bin/env bash
# Read-only gate enumeration for a self-hosted Supabase Storage stack.
#
# Run it on the host that OWNS the stack (the compose project lives there):
#   ssh -F /opt/data/.ssh/config <storage-host> 'bash -s' < scripts/storage-gate-probe.sh
# or copy it over and run it in ONE ssh invocation (a redirect outside the ssh wrapper
# writes the file on the orchestrator instead of the remote host).
#
# Prints no secret VALUES (key material is masked), creates nothing, deletes nothing.
# Override the paths/containers with env vars when the stack is laid out differently.
set -u

STACK_DIR="${STACK_DIR:-/home/deploy/stack/supabase}"
STORAGE_CT="${STORAGE_CT:-supabase-storage}"
DB_CT="${DB_CT:-supabase-db}"
NGINX_CT="${NGINX_CT:-nginx}"
PUBLIC_URL="${PUBLIC_URL:-http://127.0.0.1}"

section() { printf '\n== %s ==\n' "$1"; }

section 'container presence and caps'
for c in "$STORAGE_CT" "$DB_CT" "$NGINX_CT"; do
  printf '%s: ' "$c"
  docker inspect -f '{{.State.Status}} mem={{.HostConfig.Memory}} nanocpus={{.HostConfig.NanoCpus}}' "$c" 2>/dev/null \
    || echo 'MISSING'
done

section 'size limits and backend (values masked)'
docker exec "$STORAGE_CT" env 2>/dev/null \
  | grep -iE 'FILE_SIZE|TENANT|STORAGE_BACKEND|GLOBAL_S3' \
  | sed -E 's/(KEY|SECRET|PASSWORD|TOKEN)=.*/\1=***/' \
  || echo 'cannot read storage env'

section 'buckets: id|public|file_size_limit|allowed_mime_types'
docker exec "$DB_CT" psql -U postgres -d postgres -t -A -F'|' -c \
  "select id, public, coalesce(file_size_limit::text,'none'), coalesce(allowed_mime_types::text,'any') from storage.buckets order by id;" 2>&1

section 'objects count and storage.objects policies'
docker exec "$DB_CT" psql -U postgres -d postgres -t -A -F'|' -c \
  "select 'objects', count(*)::text from storage.objects union all select 'policies', count(*)::text from pg_policies where schemaname='storage' and tablename='objects';" 2>&1

section 'storage volume footprint'
du -sh "$STACK_DIR"/volumes/storage 2>/dev/null || echo "no volume at $STACK_DIR/volumes/storage"

section 'reverse-proxy body handling'
docker exec "$NGINX_CT" nginx -T 2>/dev/null \
  | grep -nE 'client_max_body_size|proxy_request_buffering|proxy_buffering' \
  || echo 'no readable nginx config (check path-style Caddy/CDN instead)'

section 'endpoint liveness (unsigned: 403 = alive and asking for a signature)'
curl -s -o /dev/null -w 's3_endpoint=%{http_code}\n' -m 10 "$PUBLIC_URL/storage/v1/s3"
curl -s -o /dev/null -w 'public_object_path=%{http_code}\n' -m 10 \
  "$PUBLIC_URL/storage/v1/object/public/__probe_absent__/__none__.jpg"

section 'disk headroom (object bytes share this filesystem)'
df -h / | tail -1
