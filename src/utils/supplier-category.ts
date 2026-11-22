/**
 * supplier-category.ts — Pure helpers for the supplier category hierarchy
 * Syailendra Group ERP (SCM Pillar)
 *
 * Client-safe on purpose: no Odoo import, so forms and tables share one rule set
 * without pulling the server-only RPC client into the browser bundle.
 */

import type { SupplierCategoryOption } from '@/types/scm/supplier-category'

/** Typed failure codes surfaced by the category server actions. */
export const SUPPLIER_CATEGORY_ERROR_CODES = {
  parentNotRoot: 'SUPPLIER_CATEGORY_PARENT_NOT_ROOT',
  groupHasParent: 'SUPPLIER_CATEGORY_GROUP_HAS_PARENT',
  selfParent: 'SUPPLIER_CATEGORY_SELF_PARENT'
} as const

export type SupplierCategoryErrorCode = (typeof SUPPLIER_CATEGORY_ERROR_CODES)[keyof typeof SUPPLIER_CATEGORY_ERROR_CODES]

/**
 * Only a root category (one without a parent of its own) may act as a parent,
 * and a category is never offered as its own parent.
 */
export function getParentCategoryOptions(options: SupplierCategoryOption[], excludeId?: number | null): SupplierCategoryOption[] {
  return options.filter((option) => option.parentId === null && option.id !== excludeId)
}

export interface CategoryBadgeSummary {
  primary: string | null
  overflow: number
  labels: string[]
}

/** First label plus the overflow count for compact table badges. */
export function getCategoryBadgeSummary(names: string[] | undefined): CategoryBadgeSummary {
  const labels = Array.from(new Set((names ?? []).map((name) => name.trim()).filter(Boolean)))
  return { primary: labels[0] ?? null, overflow: Math.max(0, labels.length - 1), labels }
}

/** Map a server error code onto a localized message without swallowing unknown errors. */
export function resolveSupplierCategoryError(code: string | undefined, t: (key: string) => string, fallback: string): string {
  if (code === SUPPLIER_CATEGORY_ERROR_CODES.parentNotRoot) return t('validation.parentNotRoot')
  if (code === SUPPLIER_CATEGORY_ERROR_CODES.groupHasParent) return t('validation.groupHasParent')
  if (code === SUPPLIER_CATEGORY_ERROR_CODES.selfParent) return t('validation.selfParent')
  return code || fallback
}
