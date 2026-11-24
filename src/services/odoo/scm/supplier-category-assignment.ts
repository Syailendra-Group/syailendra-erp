/**
 * supplier-category-assignment.ts — Assignable-category resolution and write guard
 * Syailendra Group ERP (SCM Pillar)
 *
 * Supplier writes accept only active sub-categories. A root category is a
 * grouping level, so a root id, an archived id or a deleted id fails before the
 * RPC write instead of silently tagging a supplier with a grouping node.
 */

import { odooClient } from '@/lib/odoo/client'
import { findNonAssignableCategoryIds, SUPPLIER_CATEGORY_ERROR_CODES, toCategoryTags } from '@/utils/supplier-category'

import type { SupplierCategoryOption, SupplierCategoryTag } from '@/types/scm/supplier-category'

interface OdooCategoryRaw {
  id: number
  name: string
  parent_id: [number, string] | false
}

const CATEGORY_MODEL = 'res.partner.category'

/** Active sub-categories only: the set a supplier may actually be tagged with. */
export async function fetchAssignableCategoryOptions(): Promise<SupplierCategoryOption[]> {
  const records = await odooClient.searchRead<OdooCategoryRaw>(
    CATEGORY_MODEL,
    [
      ['active', '=', true],
      ['parent_id', '!=', false]
    ],
    ['id', 'name', 'parent_id'],
    {
      order: 'name asc'
    }
  )

  return records.map((record) => ({
    id: record.id,
    name: record.name,
    parentId: Array.isArray(record.parent_id) ? record.parent_id[0] : null
  }))
}

/** Resolve display labels for stored ids; an RPC failure degrades to no labels. */
export async function resolveCategoryTags(ids: number[]): Promise<SupplierCategoryTag[]> {
  if (!ids.length) return []

  try {
    const records = await odooClient.searchRead<Pick<OdooCategoryRaw, 'id' | 'name'>>(CATEGORY_MODEL, [['id', 'in', ids]], ['id', 'name'], {
      limit: ids.length
    })
    return toCategoryTags(ids, records)
  } catch {
    return []
  }
}

/** Write guard: reject any id that is not an active sub-category. */
export async function assertAssignableCategoryIds(ids: number[]): Promise<void> {
  const options = await fetchAssignableCategoryOptions()
  if (findNonAssignableCategoryIds(ids, options).length > 0) {
    throw new Error(SUPPLIER_CATEGORY_ERROR_CODES.notAssignable)
  }
}
