/**
 * supplier-category.check.mts — runnable self-check for the supplier category helpers.
 * Run: node --experimental-strip-types scripts/tests/supplier-category.check.mts
 * Covers normal, boundary and failure paths. No credentials, no network.
 */
import assert from 'node:assert/strict'

import {
  findNonAssignableCategoryIds,
  getCategoryBadgeSummary,
  getParentCategoryOptions,
  resolveSupplierCategoryError,
  SUPPLIER_CATEGORY_ERROR_CODES,
  toCategoryTags
} from '../../src/utils/supplier-category.ts'

import type { SupplierCategoryOption } from '../../src/types/scm/supplier-category.ts'

const t = (key: string): string => `T:${key}`

const options: SupplierCategoryOption[] = [
  { id: 51, name: '01. Bahan Baku & Minyak Atsiri', parentId: null },
  { id: 52, name: '1.1 Perorangan Petani', parentId: 51 },
  { id: 48, name: '04. Perlengkapan & Perantara Ekspor', parentId: null },
  { id: 49, name: '05. Pemasok Botol & Tutup', parentId: 48 }
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

  // 5. Empty tag lists render a placeholder, not a badge.
  assert.deepEqual(getCategoryBadgeSummary(undefined), { primary: null, overflow: 0, labels: [] })
  assert.deepEqual(getCategoryBadgeSummary([]), { primary: null, overflow: 0, labels: [] })

  // 6. A single category shows no overflow counter.
  const single = getCategoryBadgeSummary(toCategoryTags([52], options))
  assert.equal(single.primary, '1.1 Perorangan Petani')
  assert.equal(single.overflow, 0)

  // 7. Two categories yield +1, three yield +2.
  const pair = getCategoryBadgeSummary(toCategoryTags([52, 49], options))
  assert.equal(pair.primary, '1.1 Perorangan Petani')
  assert.equal(pair.overflow, 1)

  const triple = getCategoryBadgeSummary([
    { id: 52, name: '1.1 Perorangan Petani' },
    { id: 49, name: '05. Pemasok Botol & Tutup' },
    { id: 53, name: '1.2 Perorangan Penyuling' }
  ])
  assert.equal(triple.overflow, 2)

  // 8. Duplicate ids collapse and blank names drop out.
  const messy = getCategoryBadgeSummary([
    { id: 52, name: '1.1 Perorangan Petani' },
    { id: 52, name: '1.1 Perorangan Petani' },
    { id: 49, name: '   ' },
    { id: 49, name: '05. Pemasok Botol & Tutup' }
  ])
  assert.equal(messy.primary, '1.1 Perorangan Petani')
  assert.equal(messy.overflow, 1)

  // 9. Distinct ids sharing one name stay distinct: the count follows ids.
  const sameName = getCategoryBadgeSummary([
    { id: 10, name: 'Kelompok Petani' },
    { id: 20, name: 'Kelompok Petani' }
  ])
  assert.equal(sameName.primary, 'Kelompok Petani')
  assert.equal(sameName.overflow, 1)
  assert.equal(sameName.labels.length, 2)

  // 10. Ids with no resolved name never invent a label.
  assert.deepEqual(getCategoryBadgeSummary(toCategoryTags([999], options)), { primary: null, overflow: 0, labels: [] })

  // 11. Assignable ids accept sub-categories only.
  const assignableOptions = options.filter((option) => option.parentId !== null)
  assert.deepEqual(findNonAssignableCategoryIds([52, 49], assignableOptions), [])
  assert.deepEqual(findNonAssignableCategoryIds([], assignableOptions), [])
  assert.deepEqual(findNonAssignableCategoryIds(undefined, assignableOptions), [])

  // 12. Roots, unknown ids and duplicates are reported once each.
  assert.deepEqual(findNonAssignableCategoryIds([51, 48, 999, 52, 52], assignableOptions), [51, 48, 999])

  // 13. An empty assignable set rejects every requested id.
  assert.deepEqual(findNonAssignableCategoryIds([52], []), [52])

  // 14. Typed failure codes map onto localized validation keys.
  assert.equal(resolveSupplierCategoryError(SUPPLIER_CATEGORY_ERROR_CODES.parentNotRoot, t, 'fb'), 'T:validation.parentNotRoot')
  assert.equal(resolveSupplierCategoryError(SUPPLIER_CATEGORY_ERROR_CODES.groupHasParent, t, 'fb'), 'T:validation.groupHasParent')
  assert.equal(resolveSupplierCategoryError(SUPPLIER_CATEGORY_ERROR_CODES.selfParent, t, 'fb'), 'T:validation.selfParent')
  assert.equal(resolveSupplierCategoryError(SUPPLIER_CATEGORY_ERROR_CODES.notAssignable, t, 'fb'), 'T:validation.categoryNotAssignable')

  // 15. Unknown and missing errors are never swallowed.
  assert.equal(resolveSupplierCategoryError('SOME_ODOO_ERROR', t, 'fb'), 'SOME_ODOO_ERROR')
  assert.equal(resolveSupplierCategoryError(undefined, t, 'fb'), 'fb')

  console.log('SUPPLIER_CATEGORY_CHECK_OK: 28 assertions passed')
}

main()
