/**
 * apply-action-guards.mjs — one-off AST codemod: requireSession() in every exported Server Action
 * Run from repo root: node scripts/apply-action-guards.mjs
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'

const ACTIONS_DIR = 'src/actions'
const SKIP = new Set(['src/actions/auth/auth.action.ts'])
const IMPORT_LINE = "import { requireSession } from '@/lib/auth/guard'\n"

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry)
    return statSync(fullPath).isDirectory() ? walk(fullPath) : fullPath.endsWith('.ts') ? [fullPath] : []
  })
}

let changedFiles = 0
let guardedFunctions = 0

for (const file of walk(ACTIONS_DIR)) {
  if (SKIP.has(file)) continue
  const source = readFileSync(file, 'utf8')
  if (!source.includes('export async function') || source.includes('await requireSession()')) continue

  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const insertPositions = []

  sourceFile.forEachChild((node) => {
    if (!ts.isFunctionDeclaration(node) || !node.body) return
    const modifiers = node.modifiers ?? []
    const isExported = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
    const isAsync = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword)
    if (isExported && isAsync) insertPositions.push(node.body.getStart(sourceFile) + 1)
  })

  if (insertPositions.length === 0) continue

  const importPosition = source.startsWith("'use server'") ? source.indexOf('\n') + 1 : 0
  const edits = [
    { position: importPosition, text: IMPORT_LINE },
    ...insertPositions.map((position) => ({ position, text: '\n  await requireSession()' }))
  ].sort((a, b) => b.position - a.position)

  let updated = source
  for (const edit of edits) {
    updated = updated.slice(0, edit.position) + edit.text + updated.slice(edit.position)
  }

  writeFileSync(file, updated)
  changedFiles += 1
  guardedFunctions += insertPositions.length
  console.log(`${file}: ${insertPositions.length} actions guarded`)
}

console.log(JSON.stringify({ changedFiles, guardedFunctions }))
