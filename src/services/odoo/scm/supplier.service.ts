/**
 * supplier.service.ts — Odoo 18 RPC service for Master Supplier (res.partner)
 * Syailendra Group ERP (SCM Pillar)
 */

import { odooClient } from '@/lib/odoo/client'

import { buildSupplierComment, mapOdooSupplierToRecord, SUPPLIER_FIELDS } from './supplier-metadata'

import type { SupplierFormValues, SupplierListResponse, SupplierRecord } from '@/types/scm/supplier'
import type { OdooPartnerSupplierRaw, SupplierMetadataJson } from './supplier-metadata'

export interface GetSuppliersParams {
  page?: number
  perPage?: number
  search?: string
  categoryId?: number | null
  categoryIds?: number[] | null
  supplierTypeId?: number | null
  needsReview?: boolean | null
  active?: boolean | null
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

    if (params.supplierTypeId) {
      domain.push(['supplier_type_id', '=', params.supplierTypeId])
    }

    if (params.needsReview !== undefined && params.needsReview !== null) {
      domain.push(['supplier_type_needs_review', '=', params.needsReview])
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

    const items = await SupplierService.attachCategoryNames(rawRecords.map(mapOdooSupplierToRecord))
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

    const mapped = await SupplierService.attachCategoryNames([mapOdooSupplierToRecord(records[0])])
    return mapped[0]
  }

  /**
   * Resolve official category labels from category_id (single source of truth)
   * instead of the legacy JSON comment snapshot.
   */
  private static async attachCategoryNames(items: SupplierRecord[]): Promise<SupplierRecord[]> {
    const ids = Array.from(new Set(items.flatMap((item) => item.categoryIds)))
    if (!ids.length) return items

    try {
      const categories = await odooClient.searchRead<{ id: number; display_name: string }>(
        'res.partner.category',
        [['id', 'in', ids]],
        ['id', 'display_name'],
        { limit: ids.length }
      )
      const labels = new Map(categories.map((category) => [category.id, category.display_name]))
      return items.map((item) => ({
        ...item,
        categoryNames: item.categoryIds.map((id) => labels.get(id)).filter((name): name is string => Boolean(name))
      }))
    } catch {
      return items
    }
  }

  static async createSupplier(values: SupplierFormValues): Promise<number> {
    const metadata: SupplierMetadataJson = {
      bankName: values.bankName?.trim(),
      accountNumber: values.accountNumber?.trim(),
      accountHolder: values.accountHolder?.trim(),
      legacyCode: values.legacyCode?.trim(),
      paymentTerm: values.paymentTerm,
      nik: values.nik?.trim()
    }

    const vals: Record<string, string | number | boolean | [number, number, number[]][]> = {
      ref: values.ref.trim(),
      name: values.name.trim(),
      is_company: values.companyType === 'company',
      company_type: values.companyType,
      supplier_rank: 1,
      active: values.active,
      category_id: [[6, 0, values.categoryIds]],
      supplier_type_needs_review: values.supplierTypeId ? !values.supplierTypeVerified : true,
      comment: buildSupplierComment(metadata, '')
    }

    if (values.supplierTypeId) vals.supplier_type_id = values.supplierTypeId

    if (values.phone?.trim()) vals.phone = values.phone.trim()
    if (values.mobile?.trim()) vals.mobile = values.mobile.trim()
    if (values.email?.trim()) vals.email = values.email.trim()
    if (values.website?.trim()) vals.website = values.website.trim()
    if (values.vat?.trim()) vals.vat = values.vat.trim()
    if (values.street?.trim()) vals.street = values.street.trim()
    if (values.addressDetail?.trim()) vals.address_detail = values.addressDetail.trim()
    if (values.addressBenchmark?.trim()) vals.address_benchmark = values.addressBenchmark.trim()
    if (values.zip?.trim()) vals.zip = values.zip.trim()
    if (values.ownerName?.trim()) vals.owner_name = values.ownerName.trim()
    if (values.picName?.trim()) vals.pic_name = values.picName.trim()
    if (values.picPosition?.trim()) vals.pic_position = values.picPosition.trim()
    if (values.joinYear) vals.join_year = values.joinYear
    if (values.nib?.trim()) vals.nib = values.nib.trim()
    if (values.businessLicense?.trim()) vals.business_license = values.businessLicense.trim()
    if (values.farmerCount !== undefined && values.farmerCount !== null) vals.farmer_count = values.farmerCount
    if (values.workerCount !== undefined && values.workerCount !== null) vals.worker_count = values.workerCount
    if (values.femaleWorkerPct !== undefined && values.femaleWorkerPct !== null) vals.female_worker_pct = values.femaleWorkerPct
    vals.no_child_labor = values.noChildLabor
    vals.fair_wage = values.fairWage
    vals.renewable_energy = values.renewableEnergy
    if (values.wasteManagement?.trim()) vals.waste_management = values.wasteManagement.trim()
    if (values.countryId) vals.country_id = values.countryId
    if (values.stateId) vals.state_id = values.stateId
    if (values.cityId) vals.city_id = values.cityId
    if (values.districtId) vals.district_id = values.districtId
    if (values.subDistrictId) vals.subdistrict_id = values.subDistrictId
    if (values.latitude !== undefined && values.latitude !== null) vals.partner_latitude = values.latitude
    if (values.longitude !== undefined && values.longitude !== null) vals.partner_longitude = values.longitude

    return await odooClient.create(this.MODEL, vals)
  }

  static async updateSupplier(id: number, values: Partial<SupplierFormValues>): Promise<boolean> {
    const existing = await this.getSupplierById(id)
    if (!existing) {
      throw new Error('Supplier record not found')
    }

    // Merge metadata while preserving the legacy Accurate provenance trail.
    const metadata: SupplierMetadataJson = {
      bankName: values.bankName !== undefined ? values.bankName.trim() : existing.bankInfo?.bankName,
      accountNumber: values.accountNumber !== undefined ? values.accountNumber.trim() : existing.bankInfo?.accountNumber,
      accountHolder: values.accountHolder !== undefined ? values.accountHolder.trim() : existing.bankInfo?.accountHolder,
      legacyCode: values.legacyCode !== undefined ? values.legacyCode.trim() : existing.legacyCode,
      paymentTerm: values.paymentTerm || existing.paymentTerm,
      nik: values.nik !== undefined ? values.nik.trim() : existing.nik
    }

    const vals: Record<string, string | number | boolean | [number, number, number[]][]> = {
      comment: buildSupplierComment(metadata, existing.provenance || '')
    }

    if (values.ref !== undefined) vals.ref = values.ref.trim()
    if (values.name !== undefined) vals.name = values.name.trim()
    if (values.companyType !== undefined) {
      vals.is_company = values.companyType === 'company'
      vals.company_type = values.companyType
    }
    if (values.categoryIds !== undefined) vals.category_id = [[6, 0, values.categoryIds]]
    if (values.supplierTypeId !== undefined) {
      vals.supplier_type_id = values.supplierTypeId || false
      vals.supplier_type_needs_review = values.supplierTypeId ? !values.supplierTypeVerified : true
    }
    if (values.phone !== undefined) vals.phone = values.phone.trim()
    if (values.mobile !== undefined) vals.mobile = values.mobile.trim()
    if (values.email !== undefined) vals.email = values.email.trim()
    if (values.website !== undefined) vals.website = values.website.trim()
    if (values.vat !== undefined) vals.vat = values.vat.trim()
    if (values.street !== undefined) vals.street = values.street.trim()
    if (values.addressDetail !== undefined) vals.address_detail = values.addressDetail.trim()
    if (values.addressBenchmark !== undefined) vals.address_benchmark = values.addressBenchmark.trim()
    if (values.zip !== undefined) vals.zip = values.zip.trim()
    if (values.ownerName !== undefined) vals.owner_name = values.ownerName.trim()
    if (values.picName !== undefined) vals.pic_name = values.picName.trim()
    if (values.picPosition !== undefined) vals.pic_position = values.picPosition.trim()
    if (values.joinYear !== undefined) vals.join_year = values.joinYear || 0
    if (values.nib !== undefined) vals.nib = values.nib.trim()
    if (values.businessLicense !== undefined) vals.business_license = values.businessLicense.trim()
    if (values.farmerCount !== undefined) vals.farmer_count = values.farmerCount || 0
    if (values.workerCount !== undefined) vals.worker_count = values.workerCount || 0
    if (values.femaleWorkerPct !== undefined) vals.female_worker_pct = values.femaleWorkerPct || 0
    if (values.noChildLabor !== undefined) vals.no_child_labor = values.noChildLabor
    if (values.fairWage !== undefined) vals.fair_wage = values.fairWage
    if (values.renewableEnergy !== undefined) vals.renewable_energy = values.renewableEnergy
    if (values.wasteManagement !== undefined) vals.waste_management = values.wasteManagement.trim()
    if (values.countryId !== undefined) vals.country_id = values.countryId || 0
    if (values.stateId !== undefined) vals.state_id = values.stateId || 0
    if (values.cityId !== undefined) vals.city_id = values.cityId || 0
    if (values.districtId !== undefined) vals.district_id = values.districtId || 0
    if (values.subDistrictId !== undefined) vals.subdistrict_id = values.subDistrictId || 0
    if (values.latitude !== undefined) vals.partner_latitude = values.latitude || 0
    if (values.longitude !== undefined) vals.partner_longitude = values.longitude || 0
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
