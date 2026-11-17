#!/usr/bin/env node
/**
 * Guard: client components may only translate namespaces their pillar provider ships.
 * Root provider ships: common, nav.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = 'src'
const PILLARS = {
  scm: ['scm', 'traceability'],
  auth: ['auth'],
  hrm: ['admin', 'hris'],
  others: ['others', 'regional'],
  wms: ['wms'],
  ftm: ['ftm'],
  crm: ['crm'],
  dcm: ['dcm'],
  imm: ['imm'],
  ai: ['ai']
}
const COMPONENT_ALLOWED = ['common', 'nav', 'regional']
const COMPONENT_EXCEPTIONS = { 'components/card/address-card.tsx': ['scm'] }

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const p = join(dir, entry)
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.tsx') ? [p] : []
  })
}

const violations = []
for (const file of walk(join(ROOT, 'features'))) {
  const rel = relative(ROOT, file)
  const pillar = rel.split('/')[1]
  const allowed = new Set(['common', ...(PILLARS[pillar] ?? [])])
  const src = readFileSync(file, 'utf8')
  for (const match of src.matchAll(/useTranslations\(\s*['"]([^'"]+)['"]/g)) {
    const top = match[1].split('.')[0]
    if (!allowed.has(top)) violations.push(`${rel}: namespace '${match[1]}' not shipped by pillar '${pillar}'`)
  }
}
for (const file of walk(join(ROOT, 'components'))) {
  const rel = relative(ROOT, file)
  const allowed = new Set([...COMPONENT_ALLOWED, ...(COMPONENT_EXCEPTIONS[rel] ?? [])])
  const src = readFileSync(file, 'utf8')
  for (const match of src.matchAll(/useTranslations\(\s*['"]([^'"]+)['"]/g)) {
    const top = match[1].split('.')[0]
    if (!allowed.has(top)) violations.push(`${rel}: namespace '${match[1]}' not allowed for shared components`)
  }
}

if (violations.length > 0) {
  console.error('i18n namespace violations:')
  for (const v of violations) console.error(' - ' + v)
  process.exit(1)
}
console.log('i18n namespace coverage: OK')
