/**
 * supplier.ts — TypeScript type definitions for Master Supplier
 * Syailendra Group ERP (SCM Pillar)
 */

export type SupplierCompanyType = 'company' | 'person'
export type SupplierPaymentTerm = 'COD' | 'PAID_BEFORE_SHIPMENT'
export type SupplierStatus = 'active' | 'inactive' | 'pending' | 'blacklisted'
export type SupplierGrade = 'a' | 'b' | 'c' | 'd'

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
  supplierStatus: SupplierStatus
  supplierGrade?: SupplierGrade
  digitalCode?: string
  ownerName?: string
  picName?: string
  picPosition?: string
  joinYear?: number
  nib?: string
  businessLicense?: string
  phone?: string
  mobile?: string
  email?: string
  website?: string
  vat?: string
  nik?: string
  taxName?: string
  provenance?: string
  countryId?: number | null
  countryName?: string
  stateId?: number | null
  stateName?: string
  cityId?: number | null
  cityName?: string
  city?: string
  districtId?: number | null
  districtName?: string
  subDistrictId?: number | null
  subDistrictName?: string
  street?: string
  addressDetail?: string
  addressBenchmark?: string
  zip?: string
  latitude?: number
  longitude?: number
  farmerCount: number
  workerCount: number
  femaleWorkerPct: number
  noChildLabor: boolean
  fairWage: boolean
  wasteManagement?: string
  renewableEnergy: boolean
  farmCount: number
  distilleryCount: number
  cropIds: number[]
  suppliedProductIds: number[]
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
  supplierStatus: SupplierStatus
  ownerName?: string
  picName?: string
  picPosition?: string
  joinYear?: number
  nib?: string
  businessLicense?: string
  phone?: string
  mobile?: string
  email?: string
  website?: string
  vat?: string
  nik?: string
  countryId?: number | null
  stateId?: number | null
  cityId?: number | null
  districtId?: number | null
  subDistrictId?: number | null
  street?: string
  addressDetail?: string
  addressBenchmark?: string
  zip?: string
  latitude?: number
  longitude?: number
  farmerCount?: number
  workerCount?: number
  femaleWorkerPct?: number
  noChildLabor: boolean
  fairWage: boolean
  wasteManagement?: string
  renewableEnergy: boolean
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
