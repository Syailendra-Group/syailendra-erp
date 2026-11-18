/**
 * supplier-category.service.ts — Odoo 18 RPC service for Supplier Categories (res.partner.category)
 * Syailendra Group ERP (SCM Pillar)
 *
 * Categories are a procurement grouping hierarchy, kept separate from the flat
 * supplier-type master (syailendra.supplier.type). Pagination is fully
 * server-side and hierarchy order comes from Odoo parent_path, so no page
 * ever loads a capped list and slices it locally.
 */

import { odooClient } from '@/lib/odoo/client'

import type { OdooDomain } from '@/lib/odoo/types'
import type {
  SupplierCategoryFormValues,
  SupplierCategoryListResponse,
  SupplierCategoryOption,
  SupplierCategoryRecord
} from '@/types/scm/supplier-category'

interface OdooPartnerCategoryRaw {
  id: number
  name: string
  parent_id: [number, string] | false
  parent_path: string | false
  display_name: string
  color: number
  child_ids?: number[]
  active: boolean
  create_date?: string
  write_date?: string
}

interface OdooSupplierCountGroup {
  __count?: number
  category_id_count?: number
  category_id: [number, string] | false
}

export interface GetSupplierCategoriesParams {
  page?: number
  perPage?: number
  search?: string
}

const CATEGORY_FIELDS = [
  'id',
  'name',
  'parent_id',
  'parent_path',
  'display_name',
  'color',
  'child_ids',
  'active',
  'create_date',
  'write_date'
] as const

function mapOdooCategoryToRecord(item: OdooPartnerCategoryRaw, supplierCount: number): SupplierCategoryRecord {
  const parentId = Array.isArray(item.parent_id) ? item.parent_id[0] : null
  const parentName = Array.isArray(item.parent_id) ? item.parent_id[1] : null
  const childCount = Array.isArray(item.child_ids) ? item.child_ids.length : 0
  const segments = item.parent_path ? item.parent_path.split('/').filter(Boolean) : []
  const depth = Math.max(0, segments.length - 1)

  return {
    id: item.id,
    name: item.name,
    parentId,
    parentName,
    displayName: item.display_name,
    color: item.color || 0,
    depth,
    supplierCount,
    childCount,
    active: item.active,
    createdAt: item.create_date,
    updatedAt: item.write_date
  }
}

/**
 * Count suppliers (supplier_rank > 0) per category in one aggregate call.
 * Falls back to per-id search_count when the aggregate is unavailable, so a
 * deprecated RPC surface can never break the page.
 */
async function fetchSupplierCounts(ids: number[]): Promise<Map<number, number>> {
  const counts = new Map<number, number>(ids.map((id) => [id, 0]))
  if (!ids.length) return counts

  try {
    const groups = await odooClient.executeKw<OdooSupplierCountGroup[]>(
      'res.partner',
      'read_group',
      [
        [
          ['supplier_rank', '>', 0],
          ['category_id', 'in', ids]
        ],
        ['category_id'],
        ['category_id']
      ],
      {}
    )

    for (const group of groups) {
      const key = Array.isArray(group.category_id) ? group.category_id[0] : null
      if (key === null || !counts.has(key)) continue
      const counted = group.__count ?? group.category_id_count ?? 0
      counts.set(key, Number(counted) || 0)
    }

    return counts
  } catch {
    const counted = await Promise.all(
      ids.map(async (id) => {
        const total = await odooClient.searchCount('res.partner', [
          ['supplier_rank', '>', 0],
          ['category_id', 'in', [id]]
        ])
        return [id, total] as const
      })
    )
    return new Map(counted)
  }
}

export class SupplierCategoryService {
  private static readonly MODEL = 'res.partner.category'

  static async getSupplierCategories(params: GetSupplierCategoriesParams = {}): Promise<SupplierCategoryListResponse> {
    const page = Math.max(1, params.page ?? 1)
    const perPage = Math.max(1, Math.min(100, params.perPage ?? 10))
    const offset = (page - 1) * perPage
    const search = params.search?.trim() || ''

    const domain: OdooDomain = []
    if (search) {
      domain.push(['name', 'ilike', search])
    }

    const [total, rawRecords] = await Promise.all([
      odooClient.searchCount(this.MODEL, domain, undefined, { context: { active_test: false } }),
      odooClient.searchRead<OdooPartnerCategoryRaw>(this.MODEL, domain, [...CATEGORY_FIELDS], {
        offset,
        limit: perPage,
        order: search ? 'name asc' : 'parent_path asc, name asc',
        context: { active_test: false }
      })
    ])

    const supplierCounts = await fetchSupplierCounts(rawRecords.map((record) => record.id))
    const items = rawRecords.map((record) => mapOdooCategoryToRecord(record, supplierCounts.get(record.id) ?? 0))
    const totalPages = Math.ceil(total / perPage) || 1

    return { items, total, page, perPage, totalPages }
  }

  static async getSupplierCategoryById(id: number): Promise<SupplierCategoryRecord | null> {
    const records = await odooClient.searchRead<OdooPartnerCategoryRaw>(this.MODEL, [['id', '=', id]], [...CATEGORY_FIELDS], {
      limit: 1,
      context: { active_test: false }
    })
    if (!records.length) return null

    const supplierCounts = await fetchSupplierCounts([id])
    return mapOdooCategoryToRecord(records[0], supplierCounts.get(id) ?? 0)
  }

  static async getSupplierCategoryOptions(): Promise<SupplierCategoryOption[]> {
    const records = await odooClient.searchRead<OdooPartnerCategoryRaw>(
      this.MODEL,
      [['active', '=', true]],
      ['id', 'name', 'display_name', 'parent_id'],
      { order: 'parent_path asc, name asc', context: { active_test: false } }
    )

    return records.map((record) => ({
      id: record.id,
      name: record.name,
      displayName: record.display_name,
      parentId: Array.isArray(record.parent_id) ? record.parent_id[0] : null
    }))
  }

  /** Real usage count for the delete confirmation (a many2many never blocks unlink). */
  static async getSupplierCategoryUsage(id: number): Promise<number> {
    return odooClient.searchCount('res.partner', [
      ['supplier_rank', '>', 0],
      ['category_id', 'in', [id]]
    ])
  }

  static async createSupplierCategory(data: SupplierCategoryFormValues): Promise<number> {
    const vals: Record<string, string | number | boolean> = {
      name: data.name.trim(),
      color: data.color,
      active: data.active
    }
    if (data.parentId) vals.parent_id = data.parentId
    return odooClient.create(this.MODEL, vals)
  }

  static async updateSupplierCategory(id: number, data: Partial<SupplierCategoryFormValues>): Promise<boolean> {
    const vals: Record<string, string | number | boolean | false> = {}
    if (data.name !== undefined) vals.name = data.name.trim()
    if (data.parentId !== undefined) vals.parent_id = data.parentId || false
    if (data.color !== undefined) vals.color = data.color
    if (data.active !== undefined) vals.active = data.active
    return odooClient.write(this.MODEL, [id], vals)
  }

  static async deleteSupplierCategory(id: number): Promise<boolean> {
    try {
      return await odooClient.unlink(this.MODEL, [id])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('referenced') || errorMessage.includes('foreign key')) {
        throw new Error('RELATIONAL_INTEGRITY_ERROR')
      }
      throw error
    }
  }
}
