/**
 * supplier.ts — TypeScript type definitions for Master Supplier
 * Syailendra Group ERP (SCM Pillar)
 */

export type SupplierCompanyType = 'company' | 'person'
export type SupplierPaymentTerm = 'COD' | 'PAID_BEFORE_SHIPMENT'

export interface SupplierBankMetadata {
  bankName: string
  accountNumber: string
  accountHolder: string
}

export interface SupplierRecord {
  id: number
  ref: string
  name: string
  isCompany: boolean
  companyType: SupplierCompanyType
  categoryIds: number[]
  categoryNames: string[]
  supplierTypeId: number | null
  supplierTypeName?: string
  supplierTypeCode?: string
  needsReview: boolean
  contactName?: string
  phone?: string
  mobile?: string
  email?: string
  vat?: string
  countryId?: number | null
  countryName?: string
  stateId?: number | null
  stateName?: string
  districtId?: number | null
  districtName?: string
  subDistrictId?: number | null
  subDistrictName?: string
  villageId?: number | null
  villageName?: string
  street?: string
  zip?: string
  paymentTerm: SupplierPaymentTerm
  bankInfo?: SupplierBankMetadata
  legacyCode?: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface SupplierFormValues {
  ref: string
  name: string
  isCompany: boolean
  companyType: SupplierCompanyType
  categoryIds: number[]
  supplierTypeId?: number | null
  supplierTypeVerified: boolean
  contactName?: string
  phone?: string
  mobile?: string
  email?: string
  vat?: string
  countryId?: number | null
  stateId?: number | null
  districtId?: number | null
  subDistrictId?: number | null
  villageId?: number | null
  street?: string
  zip?: string
  paymentTerm: SupplierPaymentTerm
  bankName?: string
  accountNumber?: string
  accountHolder?: string
  legacyCode?: string
  active: boolean
}

export interface SupplierListResponse {
  items: SupplierRecord[]
  total: number
  page: number
  perPage: number
  totalPages: number
}
