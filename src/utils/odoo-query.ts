/**
 * odoo-query.ts — Odoo 18 ORM Domain Builder Utilities
 * Syailendra Group ERP
 */

import type { OdooDomain, OdooDomainTuple } from '@/lib/odoo/types'

/**
 * Builds Polish notation OR domain for multi-value substring matching
 */
export function buildPolishOrDomain(field: string, values: string[] | string | undefined, operator: 'ilike' | '=' | 'like' = 'ilike'): OdooDomain {
  if (!values) return []
  const list = Array.isArray(values)
    ? values.filter(Boolean)
    : values
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

  if (list.length === 0) return []

  if (list.length === 1 && list[0]) {
    const val = operator === 'ilike' || operator === 'like' ? `%${list[0]}%` : list[0]
    return [[field, operator, val]]
  }

  const domain: OdooDomain = []
  for (let i = 0; i < list.length - 1; i++) {
    domain.push('|')
  }

  for (const item of list) {
    const val = operator === 'ilike' || operator === 'like' ? `%${item}%` : item
    domain.push([field, operator, val])
  }

  return domain
}

/**
 * Builds status domain supporting active, archived, or both
 */
export function buildStatusDomain(status?: string | string[]): OdooDomainTuple[] {
  if (!status) return []
  const list = Array.isArray(status)
    ? status.filter(Boolean)
    : status
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

  const hasActive = list.includes('active')
  const hasArchived = list.includes('archived')

  if (hasActive && hasArchived) {
    return [['active', 'in', [true, false]]]
  } else if (hasActive) {
    return [['active', '=', true]]
  } else if (hasArchived) {
    return [['active', '=', false]]
  }

  return []
}
