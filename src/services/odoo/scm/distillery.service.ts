/**
 * distillery.service.ts — Odoo 18 RPC Service for Distillation Units
 * Syailendra Group ERP
 */

import { odoo } from '@/lib/odoo'
import { buildPolishOrDomain, buildStatusDomain } from '@/utils'

import type { OdooDomain, OdooDomainTuple, OdooFieldValue } from '@/lib/odoo/types'
import type { DistilleryFormValues } from '@/schemas/scm/distillery-schema'
import type { DistilleryRecord } from '@/types/scm/distillery'

function sanitizeOdooString(val: OdooFieldValue): string {
  if (typeof val === 'string') return val
  return ''
}

function sanitizeOdooNumber(val: OdooFieldValue): number {
  if (typeof val === 'number') return val
  return 0
}

function sanitizeOdooBoolean(val: OdooFieldValue): boolean {
  return Boolean(val)
}

function parseDistilleryComment(commentRaw: OdooFieldValue) {
  const comment = sanitizeOdooString(commentRaw)
  const capacityMatch = comment.match(/Kapasitas:\s*(\d+)\s*Kg/i)
  const methodMatch = comment.match(/Metode:\s*([a-zA-Z_]+)/i)
  const materialMatch = comment.match(/Material:\s*([a-zA-Z0-9_]+)/i)
  const ownershipMatch = comment.match(/Ownership:\s*([a-zA-Z_]+)/i)
  const operatorMatch = comment.match(/Operator:\s*([^|\n]+)/i)
  const sanitationMatch = comment.match(/Sanitasi:\s*([a-zA-Z_]+)/i)

  return {
    boiler_capacity_kg: capacityMatch ? Number(capacityMatch[1]) : 500,
    method: methodMatch ? methodMatch[1].toLowerCase() : 'steam',
    boiler_material: materialMatch ? materialMatch[1].toLowerCase() : 'sus304',
    ownership: ownershipMatch ? ownershipMatch[1].toLowerCase() : 'internal',
    operator_name: operatorMatch ? operatorMatch[1].trim() : 'Operator Suling',
    sanitation_status: sanitationMatch ? sanitationMatch[1].toLowerCase() : 'passed'
  }
}

function mapOdooPartnerToDistillery(raw: Record<string, OdooFieldValue>): DistilleryRecord {
  const parsed = parseDistilleryComment(raw.comment)

  return {
    id: sanitizeOdooNumber(raw.id),
    name: sanitizeOdooString(raw.name),
    ref: sanitizeOdooString(raw.ref),
    phone: sanitizeOdooString(raw.phone) || false,
    street: sanitizeOdooString(raw.street),
    city: sanitizeOdooString(raw.city),
    comment: sanitizeOdooString(raw.comment) || false,
    active: sanitizeOdooBoolean(raw.active),
    boiler_capacity_kg: parsed.boiler_capacity_kg,
    method: parsed.method,
    boiler_material: parsed.boiler_material,
    ownership: parsed.ownership,
    operator_name: parsed.operator_name,
    sanitation_status: parsed.sanitation_status
  }
}

const DISTILLER_FIELDS = ['id', 'name', 'ref', 'phone', 'street', 'city', 'comment', 'active']

export interface FetchDistilleriesPaginatedParams {
  page?: number
  perPage?: number
  search?: string
  method?: string | string[]
  status?: string | string[]
  order?: string
}

export interface FetchDistilleriesPaginatedResult {
  records: DistilleryRecord[]
  totalCount: number
  page: number
  perPage: number
}

/**
 * Fetch distilleries with server-side windowing, search count, and faceted filters
 */
export async function fetchDistilleriesPaginated(params: FetchDistilleriesPaginatedParams = {}): Promise<FetchDistilleriesPaginatedResult> {
  const page = Math.max(1, params.page || 1)
  const perPage = Math.max(1, params.perPage || 20)
  const offset = (page - 1) * perPage

  const baseDomain: (OdooDomainTuple | string)[] = [['ref', '=like', 'DST%']]

  // Status domain
  const statusTuples = buildStatusDomain(params.status)
  statusTuples.forEach((t) => baseDomain.push(t))

  // Method domain using shared Polish OR helper
  const methodDomain = buildPolishOrDomain('comment', params.method, 'ilike')
  methodDomain.forEach((d) => baseDomain.push(d))

  // Search keyword domain
  if (params.search?.trim()) {
    const term = `%${params.search.trim()}%`
    baseDomain.push('|', ['name', 'ilike', term], ['ref', 'ilike', term])
  }

  const [totalCount, rawRecords] = await Promise.all([
    odoo.client.searchCount('res.partner', baseDomain as OdooDomain, undefined, { context: { active_test: false } }),
    odoo.client.executeKw<Record<string, OdooFieldValue>[]>('res.partner', 'search_read', [baseDomain as OdooDomain], {
      context: { active_test: false },
      fields: DISTILLER_FIELDS,
      offset,
      limit: perPage,
      order: params.order || 'ref asc'
    })
  ])

  return {
    records: rawRecords.map(mapOdooPartnerToDistillery),
    totalCount,
    page,
    perPage
  }
}

export async function fetchDistilleries(): Promise<DistilleryRecord[]> {
  const res = await fetchDistilleriesPaginated({ perPage: 100 })
  return res.records
}

export async function persistDistillery(values: DistilleryFormValues): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const structuredComment =
      `Kapasitas: ${values.boiler_capacity_kg} Kg | Metode: ${values.method} | Material: ${values.boiler_material} | Ownership: ${values.ownership} | Operator: ${values.operator_name} | Sanitasi: ${values.sanitation_status}\n${values.comment || ''}`.trim()

    const partnerPayload: Record<string, OdooFieldValue> = {
      name: values.name,
      ref: values.ref,
      phone: values.phone || false,
      street: values.street || false,
      city: values.city || false,
      comment: structuredComment,
      is_company: false
    }

    if (values.id) {
      await odoo.client.executeKw('res.partner', 'write', [[values.id], partnerPayload])
      return { success: true, id: values.id }
    } else {
      const newId = await odoo.client.executeKw<number>('res.partner', 'create', [partnerPayload])
      return { success: true, id: newId }
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to persist distillery unit in Odoo'
    }
  }
}

export async function updateDistilleryActiveState(id: number, active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await odoo.client.executeKw('res.partner', 'write', [[id], { active }])
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update distillery status in Odoo'
    }
  }
}
