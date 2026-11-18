/**
 * supplier-type.service.ts — Odoo 18 RPC service for the flat Supplier Type master
 * Syailendra Group ERP (SCM Pillar)
 *
 * Model: syailendra.supplier.type (flat, cross-company, sequence-issued code).
 * No hierarchy, no tag colour, no unlink: rows are archived instead.
 */

import { odooClient } from '@/lib/odoo/client'

import type { OdooDomain } from '@/lib/odoo/types'
import type { SupplierTypeFormValues, SupplierTypeListResponse, SupplierTypeOption, SupplierTypeRecord } from '@/types/scm/supplier-type'

interface OdooSupplierTypeRaw {
  id: number
  code: string
  name: string
  description: string | false
  sequence: number
  partner_count?: number
  active: boolean
  create_date?: string
  write_date?: string
}

export interface GetSupplierTypesParams {
  page?: number
  perPage?: number
  search?: string
  active?: string[]
}

const TYPE_FIELDS = ['id', 'code', 'name', 'description', 'sequence', 'partner_count', 'active', 'create_date', 'write_date'] as const

function mapOdooSupplierTypeToRecord(item: OdooSupplierTypeRaw): SupplierTypeRecord {
  return {
    id: item.id,
    code: item.code,
    name: item.name,
    description: item.description || undefined,
    sequence: item.sequence ?? 10,
    supplierCount: item.partner_count ?? 0,
    active: item.active,
    createdAt: item.create_date,
    updatedAt: item.write_date
  }
}

export class SupplierTypeService {
  private static readonly MODEL = 'syailendra.supplier.type'

  static async getSupplierTypes(params: GetSupplierTypesParams = {}): Promise<SupplierTypeListResponse> {
    const page = Math.max(1, params.page ?? 1)
    const perPage = Math.max(1, Math.min(100, params.perPage ?? 10))
    const offset = (page - 1) * perPage
    const search = params.search?.trim() || ''
    const status = params.active ?? []

    const domain: OdooDomain = []
    if (search) {
      domain.push('|', ['name', 'ilike', search], ['code', 'ilike', search])
    }
    if (status.length === 1) {
      domain.push(['active', '=', status[0] === 'active'])
    }

    const [total, rawRecords] = await Promise.all([
      odooClient.searchCount(this.MODEL, domain, undefined, { context: { active_test: false } }),
      odooClient.searchRead<OdooSupplierTypeRaw>(this.MODEL, domain, [...TYPE_FIELDS], {
        offset,
        limit: perPage,
        order: 'sequence asc, name asc',
        context: { active_test: false }
      })
    ])

    const items = rawRecords.map(mapOdooSupplierTypeToRecord)
    const totalPages = Math.ceil(total / perPage) || 1

    return { items, total, page, perPage, totalPages }
  }

  static async getSupplierTypeById(id: number): Promise<SupplierTypeRecord | null> {
    const records = await odooClient.searchRead<OdooSupplierTypeRaw>(this.MODEL, [['id', '=', id]], [...TYPE_FIELDS], {
      limit: 1,
      context: { active_test: false }
    })
    return records.length ? mapOdooSupplierTypeToRecord(records[0]) : null
  }

  static async getSupplierTypeOptions(): Promise<SupplierTypeOption[]> {
    const records = await odooClient.searchRead<OdooSupplierTypeRaw>(this.MODEL, [['active', '=', true]], ['id', 'code', 'name'], {
      order: 'sequence asc, name asc'
    })
    return records.map((record) => ({ id: record.id, code: record.code, name: record.name }))
  }

  static async createSupplierType(data: SupplierTypeFormValues): Promise<number> {
    const vals: Record<string, string | number | boolean> = {
      name: data.name.trim(),
      sequence: data.sequence,
      active: data.active
    }
    if (data.description?.trim()) vals.description = data.description.trim()
    return odooClient.create(this.MODEL, vals)
  }

  static async updateSupplierType(id: number, data: Partial<SupplierTypeFormValues>): Promise<boolean> {
    const vals: Record<string, string | number | boolean> = {}
    if (data.name !== undefined) vals.name = data.name.trim()
    if (data.description !== undefined) vals.description = data.description.trim()
    if (data.sequence !== undefined) vals.sequence = data.sequence
    if (data.active !== undefined) vals.active = data.active
    return odooClient.write(this.MODEL, [id], vals)
  }

  static async setSupplierTypeActive(id: number, active: boolean): Promise<boolean> {
    return odooClient.write(this.MODEL, [id], { active })
  }
}
