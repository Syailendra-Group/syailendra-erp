/**
 * supplier-category.ts — Pure helpers for the supplier category hierarchy
 * Syailendra Group ERP (SCM Pillar)
 *
 * Client-safe on purpose: no Odoo import, so forms and tables share one rule set
 * without pulling the server-only RPC client into the browser bundle.
 */

import type { SupplierCategoryOption, SupplierCategoryTag } from '@/types/scm/supplier-category'

/** Typed failure codes surfaced by the category and supplier server actions. */
export const SUPPLIER_CATEGORY_ERROR_CODES = {
  parentNotRoot: 'SUPPLIER_CATEGORY_PARENT_NOT_ROOT',
  groupHasParent: 'SUPPLIER_CATEGORY_GROUP_HAS_PARENT',
  selfParent: 'SUPPLIER_CATEGORY_SELF_PARENT',
  notAssignable: 'SUPPLIER_CATEGORY_NOT_ASSIGNABLE'
} as const

export type SupplierCategoryErrorCode = (typeof SUPPLIER_CATEGORY_ERROR_CODES)[keyof typeof SUPPLIER_CATEGORY_ERROR_CODES]

/**
 * Only a root category (one without a parent of its own) may act as a parent,
 * and a category is never offered as its own parent.
 */
export function getParentCategoryOptions(options: SupplierCategoryOption[], excludeId?: number | null): SupplierCategoryOption[] {
  return options.filter((option) => option.parentId === null && option.id !== excludeId)
}

/**
 * Assignable tags are sub-categories. Ids outside the assignable set (roots,
 * archived rows, ids that no longer exist) must be rejected before a write.
 */
export function findNonAssignableCategoryIds(ids: number[] | undefined, options: SupplierCategoryOption[]): number[] {
  const assignable = new Set(options.map((option) => option.id))
  return Array.from(new Set((ids ?? []).filter((id) => !assignable.has(id))))
}

/** Category tags that carry the id, so equal names never collapse the count. */
export function toCategoryTags(ids: number[], options: Array<Pick<SupplierCategoryOption, 'id' | 'name'>>): SupplierCategoryTag[] {
  const names = new Map(options.map((option) => [option.id, option.name]))
  return ids.flatMap((id) => {
    const name = names.get(id)
    return name ? [{ id, name }] : []
  })
}

export interface CategoryBadgeSummary {
  primary: string | null
  overflow: number
  labels: string[]
}

/** First label plus the overflow count, counted per category id and never per name. */
export function getCategoryBadgeSummary(tags: SupplierCategoryTag[] | undefined): CategoryBadgeSummary {
  const unique = new Map<number, string>()
  for (const tag of tags ?? []) {
    const name = tag.name.trim()
    if (name && !unique.has(tag.id)) unique.set(tag.id, name)
  }

  const labels = Array.from(unique.values())
  return { primary: labels[0] ?? null, overflow: Math.max(0, labels.length - 1), labels }
}

/** Map a server error code onto a localized message without swallowing unknown errors. */
export function resolveSupplierCategoryError(code: string | undefined, t: (key: string) => string, fallback: string): string {
  if (code === SUPPLIER_CATEGORY_ERROR_CODES.parentNotRoot) return t('validation.parentNotRoot')
  if (code === SUPPLIER_CATEGORY_ERROR_CODES.groupHasParent) return t('validation.groupHasParent')
  if (code === SUPPLIER_CATEGORY_ERROR_CODES.selfParent) return t('validation.selfParent')
  if (code === SUPPLIER_CATEGORY_ERROR_CODES.notAssignable) return t('validation.categoryNotAssignable')
  return code || fallback
}
