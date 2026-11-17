/**
 * supplier.service.ts — Odoo 18 RPC service for Master Supplier (res.partner)
 * Syailendra Group ERP (SCM Pillar)
 */

import { odooClient } from '@/lib/odoo/client'

import type { SupplierBankMetadata, SupplierFormValues, SupplierListResponse, SupplierPaymentTerm, SupplierRecord } from '@/types/scm/supplier'

interface OdooPartnerSupplierRaw {
  id: number
  ref: string | false
  name: string
  is_company: boolean
  company_type: string
  category_id: number[]
  phone: string | false
  mobile: string | false
  email: string | false
  vat: string | false
  country_id: [number, string] | false
  state_id: [number, string] | false
  district_id?: [number, string] | false
  sub_district_id?: [number, string] | false
  village_id?: [number, string] | false
  city: string | false
  street: string | false
  zip: string | false
  property_supplier_payment_term_id: [number, string] | false
  comment: string | false
  supplier_rank: number
  active: boolean
  create_date?: string
  write_date?: string
}

interface SupplierMetadataJson {
  bankName?: string
  accountNumber?: string
  accountHolder?: string
  legacyCode?: string
  categoryNames?: string[]
  paymentTerm?: SupplierPaymentTerm
  districtName?: string
  subDistrictName?: string
  villageName?: string
}

export interface GetSuppliersParams {
  page?: number
  perPage?: number
  search?: string
  categoryId?: number | null
  categoryIds?: number[] | null
  active?: boolean | null
}

const SUPPLIER_FIELDS = [
  'id',
  'ref',
  'name',
  'is_company',
  'company_type',
  'category_id',
  'phone',
  'mobile',
  'email',
  'vat',
  'country_id',
  'state_id',
  'city',
  'street',
  'zip',
  'property_supplier_payment_term_id',
  'comment',
  'supplier_rank',
  'active',
  'create_date',
  'write_date'
] as const

function cleanHtmlTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

function parseSupplierMetadata(rawComment: string | false): SupplierMetadataJson {
  if (!rawComment) return {}
  const cleaned = cleanHtmlTags(rawComment)
  if (!cleaned.startsWith('{') || !cleaned.endsWith('}')) return {}
  try {
    const parsed = JSON.parse(cleaned) as SupplierMetadataJson
    return parsed
  } catch {
    return {}
  }
}

function mapOdooSupplierToRecord(item: OdooPartnerSupplierRaw): SupplierRecord {
  const meta = parseSupplierMetadata(item.comment)
  const isCompany = item.is_company || item.company_type === 'company'

  const bankInfo: SupplierBankMetadata | undefined =
    meta.bankName || meta.accountNumber || meta.accountHolder
      ? {
          bankName: meta.bankName || '',
          accountNumber: meta.accountNumber || '',
          accountHolder: meta.accountHolder || ''
        }
      : undefined

  return {
    id: item.id,
    ref: item.ref || `SUP-${String(item.id).padStart(4, '0')}`,
    name: item.name,
    isCompany,
    companyType: isCompany ? 'company' : 'person',
    categoryIds: Array.isArray(item.category_id) ? item.category_id : [],
    categoryNames: meta.categoryNames || [],
    phone: item.phone || undefined,
    mobile: item.mobile || undefined,
    email: item.email || undefined,
    vat: item.vat || undefined,
    countryId: Array.isArray(item.country_id) ? item.country_id[0] : undefined,
    countryName: Array.isArray(item.country_id) ? item.country_id[1] : undefined,
    stateId: Array.isArray(item.state_id) ? item.state_id[0] : undefined,
    stateName: Array.isArray(item.state_id) ? item.state_id[1] : undefined,
    districtName: meta.districtName || (item.city ? String(item.city) : undefined),
    subDistrictName: meta.subDistrictName,
    villageName: meta.villageName,
    street: item.street || undefined,
    zip: item.zip || undefined,
    paymentTerm: meta.paymentTerm || 'COD',
    bankInfo,
    legacyCode: meta.legacyCode,
    active: item.active,
    createdAt: item.create_date,
    updatedAt: item.write_date
  }
}

export class SupplierService {
  private static readonly MODEL = 'res.partner'

  static async getSuppliers(params: GetSuppliersParams = {}): Promise<SupplierListResponse> {
    const page = Math.max(1, params.page ?? 1)
    const perPage = Math.max(1, Math.min(100, params.perPage ?? 10))
    const offset = (page - 1) * perPage

    type DomainTuple = [string, string, string | number | boolean | number[]]
    const domain: DomainTuple[] = [
      ['ref', '=like', 'SUP-%'],
      ['supplier_rank', '>', 0]
    ]

    if (params.search?.trim()) {
      const q = params.search.trim()
      domain.push(['name', 'ilike', q])
    }

    if (params.categoryIds && params.categoryIds.length > 0) {
      domain.push(['category_id', 'in', params.categoryIds])
    } else if (params.categoryId) {
      domain.push(['category_id', 'in', [params.categoryId]])
    }

    if (params.active !== undefined && params.active !== null) {
      domain.push(['active', '=', params.active])
    }

    const [total, rawRecords] = await Promise.all([
      odooClient.searchCount(this.MODEL, domain, undefined, { context: { active_test: false } }),
      odooClient.searchRead<OdooPartnerSupplierRaw>(this.MODEL, domain, [...SUPPLIER_FIELDS], {
        offset,
        limit: perPage,
        order: 'name asc',
        context: { active_test: false }
      })
    ])

    const items = rawRecords.map(mapOdooSupplierToRecord)
    const totalPages = Math.ceil(total / perPage) || 1

    return {
      items,
      total,
      page,
      perPage,
      totalPages
    }
  }

  static async getSupplierById(id: number): Promise<SupplierRecord | null> {
    const records = await odooClient.searchRead<OdooPartnerSupplierRaw>(this.MODEL, [['id', '=', id]], [...SUPPLIER_FIELDS], {
      limit: 1,
      context: { active_test: false }
    })

    if (!records.length) {
      return null
    }

    return mapOdooSupplierToRecord(records[0])
  }

  static async createSupplier(values: SupplierFormValues): Promise<number> {
    const metadata: SupplierMetadataJson = {
      bankName: values.bankName?.trim(),
      accountNumber: values.accountNumber?.trim(),
      accountHolder: values.accountHolder?.trim(),
      legacyCode: values.legacyCode?.trim(),
      paymentTerm: values.paymentTerm
    }

    const vals: Record<string, string | number | boolean | [number, number, number[]][]> = {
      ref: values.ref.trim(),
      name: values.name.trim(),
      is_company: values.companyType === 'company',
      company_type: values.companyType,
      supplier_rank: 1,
      active: values.active,
      category_id: [[6, 0, values.categoryIds]],
      comment: JSON.stringify(metadata)
    }

    if (values.phone?.trim()) vals.phone = values.phone.trim()
    if (values.mobile?.trim()) vals.mobile = values.mobile.trim()
    if (values.email?.trim()) vals.email = values.email.trim()
    if (values.vat?.trim()) vals.vat = values.vat.trim()
    if (values.street?.trim()) vals.street = values.street.trim()
    if (values.zip?.trim()) vals.zip = values.zip.trim()
    if (values.countryId) vals.country_id = values.countryId
    if (values.stateId) vals.state_id = values.stateId

    return await odooClient.create(this.MODEL, vals)
  }

  static async updateSupplier(id: number, values: Partial<SupplierFormValues>): Promise<boolean> {
    const existing = await this.getSupplierById(id)
    if (!existing) {
      throw new Error('Supplier record not found')
    }

    const metadata: SupplierMetadataJson = {
      bankName: values.bankName !== undefined ? values.bankName.trim() : existing.bankInfo?.bankName,
      accountNumber: values.accountNumber !== undefined ? values.accountNumber.trim() : existing.bankInfo?.accountNumber,
      accountHolder: values.accountHolder !== undefined ? values.accountHolder.trim() : existing.bankInfo?.accountHolder,
      legacyCode: values.legacyCode !== undefined ? values.legacyCode.trim() : existing.legacyCode,
      paymentTerm: values.paymentTerm || existing.paymentTerm
    }

    const vals: Record<string, string | number | boolean | [number, number, number[]][]> = {
      comment: JSON.stringify(metadata)
    }

    if (values.ref !== undefined) vals.ref = values.ref.trim()
    if (values.name !== undefined) vals.name = values.name.trim()
    if (values.companyType !== undefined) {
      vals.is_company = values.companyType === 'company'
      vals.company_type = values.companyType
    }
    if (values.categoryIds !== undefined) vals.category_id = [[6, 0, values.categoryIds]]
    if (values.phone !== undefined) vals.phone = values.phone.trim()
    if (values.mobile !== undefined) vals.mobile = values.mobile.trim()
    if (values.email !== undefined) vals.email = values.email.trim()
    if (values.vat !== undefined) vals.vat = values.vat.trim()
    if (values.street !== undefined) vals.street = values.street.trim()
    if (values.zip !== undefined) vals.zip = values.zip.trim()
    if (values.countryId !== undefined) vals.country_id = values.countryId || 0
    if (values.stateId !== undefined) vals.state_id = values.stateId || 0
    if (values.active !== undefined) vals.active = values.active

    return await odooClient.write(this.MODEL, [id], vals)
  }

  static async toggleSupplierStatus(id: number, active: boolean): Promise<boolean> {
    return await odooClient.write(this.MODEL, [id], { active })
  }

  static async deleteSupplier(id: number): Promise<boolean> {
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
