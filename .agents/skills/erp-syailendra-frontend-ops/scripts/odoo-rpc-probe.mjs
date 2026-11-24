#!/usr/bin/env node
/**
 * odoo-rpc-probe.mjs — read-only Odoo 18 JSON-RPC probe for ERP Syailendra.
 *
 * Authenticates with the integration credentials from .env.local, then counts a
 * domain and (optionally) repeats the same count per company context so
 * multi-company scoping can be judged from measurements, not assumptions.
 *
 * Run inside the code-server container (node lives at /opt/node/bin):
 *   node odoo-rpc-probe.mjs --model res.partner --domain '[['"'"'supplier_rank'"'"','"'"'>'"'"',0]]'
 *   node odoo-rpc-probe.mjs --model res.partner --domain '[['"'"'ref'"'"','"'"'like'"'"','"'"'FMR%'"'"']]' --rows --company-sweep
 *
 * Flags:
 *   --env <path>     .env.local path (default /home/coder/project/erp-syailendra/.env.local)
 *   --model <model>  default res.partner
 *   --domain <json>  domain array, default []
 *   --fields <json>  fields for --rows, default ["id","ref","name"]
 *   --rows           print matching rows for the base domain
 *   --order <str>    order clause for --rows (default 'id asc'); use it to prove or
 *                    disprove a sort field — Odoo answers `Invalid field 'x' on model 'y'`
 *   --limit <n>      row cap for --rows (default 50)
 *   --company-sweep  repeat the count with allowed_company_ids per company
 *
 * Never prints credentials.
 */
import fs from 'node:fs'

const argv = process.argv.slice(2)
const flagValue = (name, fallback) => {
  const index = argv.indexOf(name)
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback
}
const hasFlag = (name) => argv.includes(name)

const envPath = flagValue('--env', '/home/coder/project/erp-syailendra/.env.local')
const model = flagValue('--model', 'res.partner')
const domain = JSON.parse(flagValue('--domain', '[]'))
const fields = JSON.parse(flagValue('--fields', '["id","ref","name"]'))
const order = flagValue('--order', 'id asc')
const limit = Number(flagValue('--limit', '50'))

const env = {}
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
  if (!match) continue
  let value = match[2].trim()
  if (value.length > 1) {
    const doubleQuoted = value.startsWith('"') && value.endsWith('"')
    const singleQuoted = value.startsWith("'") && value.endsWith("'")
    if (doubleQuoted || singleQuoted) value = value.slice(1, -1)
  }
  env[match[1]] = value
}

const baseUrl = (env.ODOO_BASE_URL || '').replace(/\/+$/, '')
if (!baseUrl) {
  console.error('ODOO_BASE_URL missing in ' + envPath)
  process.exit(1)
}

async function rpc(service, method, args) {
  const response = await fetch(baseUrl + '/jsonrpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { service, method, args } })
  })
  const body = await response.json()
  if (body.error) throw new Error(body.error.data && body.error.data.message ? body.error.data.message : body.error.message)
  return body.result
}

// execute_kw takes a numeric uid — authenticate first, never pass the login string.
let uid = null
let secret = null
for (const candidate of [env.ODOO_API_KEY, env.ODOO_PASSWORD].filter(Boolean)) {
  const result = await rpc('common', 'authenticate', [env.ODOO_DB, env.ODOO_USERNAME, candidate, {}])
  if (typeof result === 'number' && result > 0) {
    uid = result
    secret = candidate
    break
  }
}
if (!uid) {
  console.error('AUTH_FAILED for ' + env.ODOO_USERNAME + ' — check ODOO_USERNAME / ODOO_API_KEY / ODOO_PASSWORD')
  process.exit(2)
}

const call = (targetModel, method, args, kwargs = {}) =>
  rpc('object', 'execute_kw', [env.ODOO_DB, uid, secret, targetModel, method, args, kwargs])

console.log('AUTH_OK uid=' + uid + ' db=' + env.ODOO_DB + ' model=' + model)
console.log('DOMAIN=' + JSON.stringify(domain))
console.log('COUNT_NO_CONTEXT=' + (await call(model, 'search_count', [domain])))

if (hasFlag('--rows')) {
  try {
    const rows = await call(model, 'search_read', [domain, fields], { limit, order })
    console.log('ROWS=' + JSON.stringify(rows))
  } catch (error) {
    console.error('ROWS_ERROR=' + error.message)
    process.exitCode = 1
  }
}

if (hasFlag('--company-sweep')) {
  const companies = await call('res.company', 'search_read', [[], ['id', 'name']], { order: 'id asc' })
  for (const company of companies) {
    const count = await call(model, 'search_count', [domain], { context: { allowed_company_ids: [company.id] } })
    console.log('COUNT_ALLOWED_COMPANY_' + company.id + '_' + String(company.name).replace(/\s+/g, '_') + '=' + count)
  }
  console.log('INTERPRET=equal_to_no_context means the current user already sees those rows; a smaller per-company count means the rule only filters once the context is sent')
}
