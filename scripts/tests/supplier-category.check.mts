/**
 * supplier-category.check.mts — runnable self-check for the supplier category helpers.
 * Run: node --experimental-strip-types scripts/tests/supplier-category.check.mts
 * Covers normal, boundary and failure paths. No credentials, no network.
 */
import assert from 'node:assert/strict'

import {
  getCategoryBadgeSummary,
  getParentCategoryOptions,
  resolveSupplierCategoryError,
  SUPPLIER_CATEGORY_ERROR_CODES
} from '../../src/utils/supplier-category.ts'

import type { SupplierCategoryOption } from '../../src/types/scm/supplier-category.ts'

const t = (key: string): string => `T:${key}`

const options: SupplierCategoryOption[] = [
  { id: 51, name: '01. Bahan Baku & Minyak Atsiri', parentId: null },
  { id: 52, name: '1.1 Perorangan Petani', parentId: 51 },
  { id: 48, name: '04. Perlengkapan & Perantara Ekspor', parentId: null }
]

function main(): void {
  // 1. Only root categories are offered as a parent.
  assert.deepEqual(
    getParentCategoryOptions(options).map((option) => option.id),
    [51, 48]
  )

  // 2. A category is never offered as its own parent.
  assert.deepEqual(
    getParentCategoryOptions(options, 51).map((option) => option.id),
    [48]
  )

  // 3. Sub-categories are never offered as a parent.
  assert.equal(
    getParentCategoryOptions(options).some((option) => option.id === 52),
    false
  )

  // 4. Empty option lists stay empty.
  assert.deepEqual(getParentCategoryOptions([]), [])

  // 5. Boundary: no categories at all renders a placeholder, not a badge.
  assert.deepEqual(getCategoryBadgeSummary(undefined), { primary: null, overflow: 0, labels: [] })
  assert.deepEqual(getCategoryBadgeSummary([]), { primary: null, overflow: 0, labels: [] })

  // 6. A single category shows no overflow counter.
  const single = getCategoryBadgeSummary(['1.1 Perorangan Petani'])
  assert.equal(single.primary, '1.1 Perorangan Petani')
  assert.equal(single.overflow, 0)

  // 7. Two categories yield +1, three yield +2.
  const pair = getCategoryBadgeSummary(['1.1 Perorangan Petani', '05. Pemasok Botol & Tutup'])
  assert.equal(pair.primary, '1.1 Perorangan Petani')
  assert.equal(pair.overflow, 1)

  assert.equal(getCategoryBadgeSummary(['A', 'B', 'C']).overflow, 2)

  // 8. Duplicates collapse and blanks drop out.
  const messy = getCategoryBadgeSummary(['A', 'A', '   ', 'B'])
  assert.equal(messy.primary, 'A')
  assert.equal(messy.overflow, 1)

  // 9. Typed failure codes map onto localized validation keys.
  assert.equal(resolveSupplierCategoryError(SUPPLIER_CATEGORY_ERROR_CODES.parentNotRoot, t, 'fb'), 'T:validation.parentNotRoot')
  assert.equal(resolveSupplierCategoryError(SUPPLIER_CATEGORY_ERROR_CODES.groupHasParent, t, 'fb'), 'T:validation.groupHasParent')
  assert.equal(resolveSupplierCategoryError(SUPPLIER_CATEGORY_ERROR_CODES.selfParent, t, 'fb'), 'T:validation.selfParent')

  // 10. Unknown and missing errors are never swallowed.
  assert.equal(resolveSupplierCategoryError('SOME_ODOO_ERROR', t, 'fb'), 'SOME_ODOO_ERROR')
  assert.equal(resolveSupplierCategoryError(undefined, t, 'fb'), 'fb')

  console.log('SUPPLIER_CATEGORY_CHECK_OK: 18 assertions passed')
}

main()
