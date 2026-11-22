#!/usr/bin/env node
/**
 * media-reconcile.mjs — read-only reconciliation between `syailendra.media` rows and the
 * object bucket. Never writes, never deletes: it prints the two mismatch sets so an operator
 * can decide what to do.
 *
 * Run (dry-run is the only mode):
 *   node --env-file=.env.local scripts/media-reconcile.mjs
 *
 * Requires the same server-only variables the app uses:
 *   ODOO_BASE_URL, ODOO_DB, ODOO_USERNAME, ODOO_API_KEY
 *   SUPABASE_STORAGE_URL, SUPABASE_STORAGE_BUCKET, SUPABASE_STORAGE_ACCESS_KEY_ID,
 *   SUPABASE_STORAGE_SECRET_ACCESS_KEY, SUPABASE_STORAGE_REGION
 */
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'

const REQUIRED = [
  'ODOO_BASE_URL',
  'ODOO_DB',
  'ODOO_USERNAME',
  'SUPABASE_STORAGE_URL',
  'SUPABASE_STORAGE_BUCKET',
  'SUPABASE_STORAGE_ACCESS_KEY_ID',
  'SUPABASE_STORAGE_SECRET_ACCESS_KEY',
  'SUPABASE_STORAGE_REGION'
]

function requireEnv() {
  if (!process.env.ODOO_API_KEY && !process.env.ODOO_PASSWORD) {
    console.error('missing env: ODOO_API_KEY or ODOO_PASSWORD')
    process.exit(2)
  }
  const missing = REQUIRED.filter((name) => !process.env[name])
  if (missing.length > 0) {
    console.error(`missing env: ${missing.join(', ')}`)
    process.exit(2)
  }
}

function odooClient() {
  const base = process.env.ODOO_BASE_URL.replace(/\/+$/, '')
  const db = process.env.ODOO_DB
  const username = process.env.ODOO_USERNAME
  const apiKey = process.env.ODOO_API_KEY || process.env.ODOO_PASSWORD
  let uid = null

  async function rpc(service, method, args) {
    const response = await fetch(`${base}/jsonrpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { service, method, args } })
    })
    if (!response.ok) throw new Error(`odoo http ${response.status}`)
    const payload = await response.json()
    if (payload.error) throw new Error(payload.error.data?.message || 'odoo error')
    return payload.result
  }

  return {
    async connect() {
      if (uid) return uid
      uid = await rpc('common', 'authenticate', [db, username, apiKey, {}])
      if (!uid) throw new Error('odoo authentication failed')
      return uid
    },
    async searchRead(model, domain, fields, limit = 500) {
      const sessionUid = await this.connect()
      return rpc('object', 'execute_kw', [db, sessionUid, apiKey, model, 'search_read', [domain], { fields, limit }])
    }
  }
}

function storageClient() {
  const endpoint = process.env.SUPABASE_STORAGE_URL.replace(/\/+$/, '')
  return new S3Client({
    endpoint: endpoint.endsWith('/storage/v1/s3') ? endpoint : `${endpoint}/storage/v1/s3`,
    region: process.env.SUPABASE_STORAGE_REGION,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.SUPABASE_STORAGE_ACCESS_KEY_ID,
      secretAccessKey: process.env.SUPABASE_STORAGE_SECRET_ACCESS_KEY
    }
  })
}

async function listKeys(client) {
  const keys = new Set()
  let token
  do {
    const page = await client.send(
      new ListObjectsV2Command({
        Bucket: process.env.SUPABASE_STORAGE_BUCKET,
        Prefix: 'media/',
        ContinuationToken: token
      })
    )
    for (const item of page.Contents ?? []) if (item.Key) keys.add(item.Key)
    token = page.IsTruncated ? page.NextContinuationToken : undefined
  } while (token)
  return keys
}

async function main() {
  requireEnv()
  const odoo = odooClient()
  const storage = storageClient()

  const rows = await odoo.searchRead(
    'syailendra.media',
    [
      ['storage_key', '!=', false],
      ['active', '=', true]
    ],
    ['id', 'storage_key', 'kind', 'res_model', 'res_id']
  )
  const objects = await listKeys(storage)
  const rowKeys = new Set(rows.map((row) => row.storage_key))

  const rowsWithoutObjects = rows.filter((row) => !objects.has(row.storage_key))
  const objectsWithoutRows = [...objects].filter((key) => !rowKeys.has(key))

  console.log(`rows_with_key=${rows.length} objects_in_bucket=${objects.size}`)
  console.log(`rows_without_objects=${rowsWithoutObjects.length}`)
  for (const row of rowsWithoutObjects.slice(0, 50)) {
    console.log(`  MISSING_OBJECT id=${row.id} kind=${row.kind} ${row.res_model}:${row.res_id} ${row.storage_key}`)
  }
  console.log(`objects_without_rows=${objectsWithoutRows.length}`)
  for (const key of objectsWithoutRows.slice(0, 50)) console.log(`  ORPHAN_OBJECT ${key}`)
  console.log('dry-run only: nothing was deleted or modified')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
