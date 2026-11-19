import type { SupplierFormValues } from '@/types/scm/supplier'
import type { SupplierSectionId } from '@/types/scm/supplier-form'
import type { FieldErrors } from 'react-hook-form'

export const sectionIds = ['identity', 'contact', 'location', 'finance', 'esg'] as const

export const fieldSections = {
  ref: 'identity',
  name: 'identity',
  isCompany: 'identity',
  companyType: 'identity',
  categoryIds: 'identity',
  supplierTypeId: 'identity',
  supplierTypeVerified: 'identity',
  supplierStatus: 'identity',
  phone: 'contact',
  mobile: 'contact',
  email: 'contact',
  website: 'contact',
  vat: 'contact',
  nik: 'contact',
  ownerName: 'contact',
  picName: 'contact',
  picPosition: 'contact',
  joinYear: 'contact',
  nib: 'contact',
  businessLicense: 'contact',
  countryId: 'location',
  stateId: 'location',
  cityId: 'location',
  districtId: 'location',
  subDistrictId: 'location',
  street: 'location',
  addressDetail: 'location',
  addressBenchmark: 'location',
  zip: 'location',
  latitude: 'location',
  longitude: 'location',
  paymentTerm: 'finance',
  bankName: 'finance',
  accountNumber: 'finance',
  accountHolder: 'finance',
  legacyCode: 'finance',
  active: 'finance',
  farmerCount: 'esg',
  workerCount: 'esg',
  femaleWorkerPct: 'esg',
  noChildLabor: 'esg',
  fairWage: 'esg',
  wasteManagement: 'esg',
  renewableEnergy: 'esg'
} satisfies Record<keyof SupplierFormValues, SupplierSectionId>

export function getSectionErrors(errors: FieldErrors<SupplierFormValues>) {
  const counts: Record<SupplierSectionId, number> = { identity: 0, contact: 0, location: 0, finance: 0, esg: 0 }
  let first: keyof SupplierFormValues | undefined
  for (const field of Object.keys(fieldSections) as (keyof SupplierFormValues)[]) {
    if (errors[field]) {
      counts[fieldSections[field]] += 1
      first ??= field
    }
  }
  return { counts, first }
}

export const addressFieldIds = {
  countryId: 'country_id',
  stateId: 'state_id',
  cityId: 'city_id',
  districtId: 'district_id',
  subDistrictId: 'subdistrict_id',
  addressDetail: 'address_detail',
  addressBenchmark: 'address_benchmark',
  zip: 'zip_code',
  latitude: 'partner_latitude',
  longitude: 'partner_longitude'
} satisfies Partial<Record<keyof SupplierFormValues, string>>
