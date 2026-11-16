#!/usr/bin/env node
/**
 * seed-commodities.mjs — idempotent Commodity Master seeder (syailendra.crop)
 * Usage: node scripts/seed-commodities.mjs [--apply] [--retire-extra] [--companies=all|1,2] [--file=path]
 */
import { readFileSync } from 'node:fs'

const args = new Set(process.argv.slice(2))
const APPLY = args.has('--apply')
const RETIRE = args.has('--retire-extra')
const argValue = (name) => [...args].find((a) => a.startsWith(`--${name}=`))?.split('=')[1]
const COMPANIES_ARG = argValue('companies') ?? 'all'
const FILE = argValue('file') ?? 'scripts/data/commodities.seed.json'

function loadEnv() {
  const env = { ...process.env }
  try {
    for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
      if (!line.includes('=') || line.trim().startsWith('#')) continue
      const i = line.indexOf('=')
      const key = line.slice(0, i).trim()
      if (!env[key])
        env[key] = line
          .slice(i + 1)
          .trim()
          .replace(/^["']|["']$/g, '')
    }
  } catch {
    // .env.local optional when variables come from the process environment
  }
  return env
}

const env = loadEnv()
const BASE = env.ODOO_BASE_URL
const DB = env.ODOO_DB
const USER = env.ODOO_USERNAME
const SECRET = env.ODOO_API_KEY || env.ODOO_PASSWORD
if (!BASE || !DB || !USER || !SECRET) {
  console.error('Missing Odoo credentials in environment/.env.local')
  process.exit(1)
}

let rpcId = 1
async function rpc(service, method, rpcArgs) {
  const res = await fetch(`${BASE}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { service, method, args: rpcArgs }, id: rpcId++ })
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
  const data = await res.json()
  if (data.error) throw new Error(data.error.data?.message || data.error.message)
  return data.result
}

const uid = await rpc('common', 'authenticate', [DB, USER, SECRET, {}])
if (!uid) throw new Error('Authentication failed')

const exec = (model, method, methodArgs, kwargs = {}) => rpc('object', 'execute_kw', [DB, uid, SECRET, model, method, methodArgs, kwargs])

const seed = JSON.parse(readFileSync(FILE, 'utf8'))
const PARTS = new Set(['leaves', 'rhizome', 'wood', 'bark', 'seeds', 'flowers', 'fruit', 'roots'])
const seedCodes = new Set()
for (const [index, row] of seed.entries()) {
  const code = String(row.code ?? '').toUpperCase()
  if (!code || !/^[A-Z0-9]{1,10}$/.test(code)) throw new Error(`row ${index}: invalid code "${row.code}"`)
  if (seedCodes.has(code)) throw new Error(`row ${index}: duplicate code ${code}`)
  if (!row.name?.trim() || !row.latin_name?.trim()) throw new Error(`row ${index}: name/latin_name required`)
  if (!PARTS.has(row.plant_part)) throw new Error(`row ${index}: invalid plant_part "${row.plant_part}"`)
  seedCodes.add(code)
}
const companies =
  COMPANIES_ARG === 'all'
    ? (await exec('res.company', 'search_read', [[]], { fields: ['id', 'name'], order: 'id' })).map((c) => c.id)
    : COMPANIES_ARG.split(',')
        .map((v) => Number(v.trim()))
        .filter(Boolean)

const FIELDS = ['name', 'latin_name', 'plant_part', 'cultivation_status', 'description', 'active']
const summary = { create: 0, update: 0, reactivate: 0, unchanged: 0, retire: 0, companies: companies.length }

for (const companyId of companies) {
  const context = { allowed_company_ids: [companyId] }
  const existing = await exec('syailendra.crop', 'search_read', [[['company_id', '=', companyId]]], {
    fields: ['id', 'code', ...FIELDS],
    limit: 2000,
    context: { ...context, active_test: false }
  })
  const byCode = new Map(existing.map((row) => [String(row.code).toUpperCase(), row]))

  for (const record of seed) {
    const code = record.code.toUpperCase()
    const current = byCode.get(code)
    const payload = {
      code,
      name: record.name,
      latin_name: record.latin_name,
      plant_part: record.plant_part,
      cultivation_status: record.cultivation_status,
      description: record.description,
      active: true
    }

    if (!current) {
      console.log(JSON.stringify({ company: companyId, code, action: APPLY ? 'create' : 'would_create', name: record.name }))
      summary.create += 1
      if (APPLY) await exec('syailendra.crop', 'create', [{ ...payload, company_id: companyId }], { context })
      continue
    }

    const changes = Object.fromEntries(Object.entries(payload).filter(([key, value]) => (current[key] ?? '') !== (value ?? '')))
    if (Object.keys(changes).length === 0) {
      summary.unchanged += 1
      continue
    }
    const action = current.active === false && changes.active === true ? 'reactivate' : 'update'
    console.log(JSON.stringify({ company: companyId, code, action: APPLY ? action : `would_${action}`, fields: Object.keys(changes) }))
    if (action === 'reactivate') summary.reactivate += 1
    else summary.update += 1
    if (APPLY) await exec('syailendra.crop', 'write', [[current.id], changes], { context })
  }

  if (RETIRE) {
    for (const row of existing) {
      if (row.active !== false && !seedCodes.has(String(row.code).toUpperCase())) {
        console.log(JSON.stringify({ company: companyId, code: row.code, action: APPLY ? 'retire' : 'would_retire', name: row.name }))
        summary.retire += 1
        if (APPLY) await exec('syailendra.crop', 'write', [[row.id], { active: false }], { context })
      }
    }
  }
}

if (APPLY) {
  for (const companyId of companies) {
    const activeCount = await exec(
      'syailendra.crop',
      'search_count',
      [
        [
          ['company_id', '=', companyId],
          ['active', '=', true]
        ]
      ],
      { context: { allowed_company_ids: [companyId] } }
    )
    if (activeCount !== seed.length) throw new Error(`verification failed: company ${companyId} active ${activeCount}, expected ${seed.length}`)
  }
}

console.log(JSON.stringify({ mode: APPLY ? 'apply' : 'dry-run', records: seed.length, ...summary }))
