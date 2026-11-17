/**
 * supplier-type.service.ts — Odoo 18 RPC service for Supplier Types (res.partner.category)
 * Syailendra Group ERP (SCM Pillar)
 */

import { odooClient } from '@/lib/odoo/client'

import type { SupplierTypeFormValues, SupplierTypeListResponse, SupplierTypeOption, SupplierTypeRecord } from '@/types/scm/supplier-type'

interface OdooPartnerCategoryRaw {
  id: number
  name: string
  parent_id: [number, string] | false
  display_name: string
  color: number
  partner_ids: number[]
  child_ids?: number[]
  active: boolean
  create_date?: string
  write_date?: string
}

export interface GetSupplierTypesParams {
  page?: number
  perPage?: number
  search?: string
  parentId?: number | null
}

const CATEGORY_FIELDS = [
  'id',
  'name',
  'parent_id',
  'display_name',
  'color',
  'partner_ids',
  'child_ids',
  'active',
  'create_date',
  'write_date'
] as const

function mapOdooCategoryToRecord(item: OdooPartnerCategoryRaw): SupplierTypeRecord {
  const childCount = Array.isArray(item.child_ids) ? item.child_ids.length : 0
  const isParent = !item.parent_id || childCount > 0

  return {
    id: item.id,
    name: item.name,
    parentId: Array.isArray(item.parent_id) ? item.parent_id[0] : null,
    parentName: Array.isArray(item.parent_id) ? item.parent_id[1] : null,
    displayName: item.display_name,
    color: item.color || 0,
    partnerCount: Array.isArray(item.partner_ids) ? item.partner_ids.length : 0,
    isParent,
    childCount,
    active: item.active,
    createdAt: item.create_date,
    updatedAt: item.write_date
  }
}

function sortRecordsHierarchically(records: SupplierTypeRecord[]): SupplierTypeRecord[] {
  const rootNodes = records.filter((r) => r.parentId === null)
  rootNodes.sort((a, b) => a.name.localeCompare(b.name))

  const childMap = new Map<number, SupplierTypeRecord[]>()
  for (const r of records) {
    if (r.parentId !== null) {
      const existing = childMap.get(r.parentId) || []
      existing.push(r)
      childMap.set(r.parentId, existing)
    }
  }

  const result: SupplierTypeRecord[] = []
  for (const root of rootNodes) {
    result.push(root)
    const children = childMap.get(root.id) || []
    children.sort((a, b) => a.name.localeCompare(b.name))
    result.push(...children)
  }

  const processedIds = new Set(result.map((r) => r.id))
  for (const r of records) {
    if (!processedIds.has(r.id)) {
      result.push(r)
    }
  }

  return result
}

export class SupplierTypeService {
  private static readonly MODEL = 'res.partner.category'

  static async getSupplierTypes(params: GetSupplierTypesParams = {}): Promise<SupplierTypeListResponse> {
    const page = Math.max(1, params.page ?? 1)
    const perPage = Math.max(1, Math.min(100, params.perPage ?? 10))
    const offset = (page - 1) * perPage

    type DomainTuple = [string, string, string | number | boolean]
    const domain: DomainTuple[] = []

    if (params.search?.trim()) {
      domain.push(['name', 'ilike', params.search.trim()])
    }

    if (params.parentId !== undefined && params.parentId !== null) {
      domain.push(['parent_id', '=', params.parentId])
    }

    // If searching, use standard pagination directly
    // If viewing complete tree list, fetch categories to preserve hierarchical family order
    const total = await odooClient.searchCount(this.MODEL, domain)

    const rawRecords = await odooClient.searchRead<OdooPartnerCategoryRaw>(this.MODEL, domain, [...CATEGORY_FIELDS], {
      offset: params.search?.trim() ? offset : 0,
      limit: params.search?.trim() ? perPage : 100,
      order: 'name asc'
    })

    const mapped = rawRecords.map(mapOdooCategoryToRecord)
    const hierarchicallySorted = params.search?.trim() ? mapped : sortRecordsHierarchically(mapped)

    // Apply pagination slice if hierarchical sort was applied
    const items = params.search?.trim() ? hierarchicallySorted : hierarchicallySorted.slice(offset, offset + perPage)

    const totalPages = Math.ceil(total / perPage) || 1

    return {
      items,
      total,
      page,
      perPage,
      totalPages
    }
  }

  static async getSupplierTypeById(id: number): Promise<SupplierTypeRecord | null> {
    const records = await odooClient.searchRead<OdooPartnerCategoryRaw>(this.MODEL, [['id', '=', id]], [...CATEGORY_FIELDS], { limit: 1 })

    if (!records.length) {
      return null
    }

    return mapOdooCategoryToRecord(records[0])
  }

  static async getSupplierTypeOptions(): Promise<SupplierTypeOption[]> {
    const records = await odooClient.searchRead<OdooPartnerCategoryRaw>(
      this.MODEL,
      [['active', '=', true]],
      ['id', 'name', 'display_name', 'parent_id'],
      { order: 'name asc' }
    )

    const mapped: SupplierTypeOption[] = records.map((r) => ({
      id: r.id,
      name: r.name,
      displayName: r.display_name,
      parentId: Array.isArray(r.parent_id) ? r.parent_id[0] : null
    }))

    // Sort options hierarchically
    const roots = mapped.filter((m) => m.parentId === null).sort((a, b) => a.name.localeCompare(b.name))
    const childrenMap = new Map<number, SupplierTypeOption[]>()
    for (const m of mapped) {
      if (m.parentId !== null) {
        const ex = childrenMap.get(m.parentId) || []
        ex.push(m)
        childrenMap.set(m.parentId, ex)
      }
    }

    const result: SupplierTypeOption[] = []
    for (const root of roots) {
      result.push(root)
      const kids = childrenMap.get(root.id) || []
      kids.sort((a, b) => a.name.localeCompare(b.name))
      result.push(...kids)
    }

    return result.length > 0 ? result : mapped
  }

  static async createSupplierType(data: SupplierTypeFormValues): Promise<number> {
    const vals: Record<string, string | number | boolean> = {
      name: data.name.trim(),
      color: data.color,
      active: data.active
    }

    if (data.parentId) {
      vals.parent_id = data.parentId
    }

    return await odooClient.create(this.MODEL, vals)
  }

  static async updateSupplierType(id: number, data: Partial<SupplierTypeFormValues>): Promise<boolean> {
    const vals: Record<string, string | number | boolean | false> = {}

    if (data.name !== undefined) {
      vals.name = data.name.trim()
    }
    if (data.parentId !== undefined) {
      vals.parent_id = data.parentId || false
    }
    if (data.color !== undefined) {
      vals.color = data.color
    }
    if (data.active !== undefined) {
      vals.active = data.active
    }

    return await odooClient.write(this.MODEL, [id], vals)
  }

  static async deleteSupplierType(id: number): Promise<boolean> {
    try {
      return await odooClient.unlink(this.MODEL, [id])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('referenced') || errorMessage.includes('foreign key') || errorMessage.includes('still referenced')) {
        throw new Error('RELATIONAL_INTEGRITY_ERROR')
      }
      throw error
    }
  }
}
