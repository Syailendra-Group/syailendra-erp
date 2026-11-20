/**
 * supplier-metadata.ts — Field registry, comment metadata codec, and record mapper
 * for Master Supplier (res.partner). Syailendra Group ERP (SCM Pillar)
 */

import type { SupplierBankMetadata, SupplierGrade, SupplierPaymentTerm, SupplierRecord } from '@/types/scm/supplier'

export interface OdooPartnerSupplierRaw {
  id: number
  ref: string | false
  name: string
  is_company: boolean
  company_type: string
  category_id: number[]
  phone: string | false
  mobile: string | false
  email: string | false
  website: string | false
  vat: string | false
  country_id: [number, string] | false
  state_id: [number, string] | false
  city_id?: [number, string] | false
  district_id?: [number, string] | false
  subdistrict_id?: [number, string] | false
  city: string | false
  street: string | false
  address_detail: string | false
  address_benchmark: string | false
  zip: string | false
  partner_latitude?: number
  partner_longitude?: number
  property_supplier_payment_term_id: [number, string] | false
  comment: string | false
  supplier_rank: number
  supplier_type_id: [number, string] | false
  supplier_type_needs_review: boolean
  image_128?: string | false
  supplier_grade: string | false
  digital_code: string | false
  owner_name: string | false
  pic_name: string | false
  pic_position: string | false
  join_year: number | false
  nib: string | false
  business_license: string | false
  farmer_count?: number
  worker_count?: number
  female_worker_pct?: number
  no_child_labor?: boolean
  fair_wage?: boolean
  waste_management: string | false
  renewable_energy?: boolean
  farm_count?: number
  distillery_count?: number
  crop_ids?: number[]
  supplied_product_ids?: number[]
  active: boolean
  create_date?: string
  write_date?: string
}

export interface SupplierMetadataJson {
  bankName?: string
  accountNumber?: string
  accountHolder?: string
  legacyCode?: string
  categoryNames?: string[]
  paymentTerm?: SupplierPaymentTerm
  nik?: string
  taxName?: string
  provenance?: string
}

export const SUPPLIER_FIELDS = [
  'id',
  'ref',
  'name',
  'is_company',
  'company_type',
  'category_id',
  'phone',
  'mobile',
  'email',
  'website',
  'vat',
  'country_id',
  'state_id',
  'city_id',
  'district_id',
  'subdistrict_id',
  'city',
  'street',
  'address_detail',
  'address_benchmark',
  'zip',
  'partner_latitude',
  'partner_longitude',
  'property_supplier_payment_term_id',
  'comment',
  'supplier_rank',
  'supplier_type_id',
  'supplier_type_needs_review',
  'supplier_grade',
  'digital_code',
  'owner_name',
  'pic_name',
  'pic_position',
  'join_year',
  'nib',
  'business_license',
  'farmer_count',
  'worker_count',
  'female_worker_pct',
  'no_child_labor',
  'fair_wage',
  'waste_management',
  'renewable_energy',
  'farm_count',
  'distillery_count',
  'crop_ids',
  'supplied_product_ids',
  'active',
  'create_date',
  'write_date'
] as const

export function cleanHtmlTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

export interface SupplierCommentParts {
  metadata: SupplierMetadataJson
  provenance: string
}

/**
 * Parse the res.partner comment field. Legacy Accurate imports stored a plain
 * HTML provenance note, while the form writes structured JSON metadata. Both
 * shapes must survive round-trips without losing the audit trail.
 */
export function parseSupplierComment(rawComment: string | false): SupplierCommentParts {
  if (!rawComment) return { metadata: {}, provenance: '' }
  const cleaned = cleanHtmlTags(rawComment)
  if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
    try {
      const parsed = JSON.parse(cleaned) as SupplierMetadataJson
      const { provenance, ...metadata } = parsed
      return { metadata, provenance: provenance || '' }
    } catch {
      // Malformed JSON falls through to the legacy provenance branch.
    }
  }
  return { metadata: {}, provenance: cleaned }
}

/** Serialize metadata back to JSON while preserving the legacy provenance text. */
export function buildSupplierComment(metadata: SupplierMetadataJson, provenance: string): string {
  const payload: SupplierMetadataJson = { ...metadata }
  if (provenance) payload.provenance = provenance
  return JSON.stringify(payload)
}

function firstId(ref?: [number, string] | false): number | undefined {
  return Array.isArray(ref) ? ref[0] : undefined
}

function firstName(ref?: [number, string] | false): string | undefined {
  return Array.isArray(ref) ? ref[1] : undefined
}

export function mapOdooSupplierToRecord(item: OdooPartnerSupplierRaw): SupplierRecord {
  const { metadata: meta, provenance } = parseSupplierComment(item.comment)
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
    supplierTypeId: firstId(item.supplier_type_id) ?? null,
    supplierTypeName: firstName(item.supplier_type_id),
    needsReview: Boolean(item.supplier_type_needs_review),
    imageUrl: null,
    supplierGrade: (item.supplier_grade || undefined) as SupplierGrade | undefined,
    digitalCode: item.digital_code || undefined,
    ownerName: item.owner_name || undefined,
    picName: item.pic_name || undefined,
    picPosition: item.pic_position || undefined,
    joinYear: item.join_year || undefined,
    nib: item.nib || undefined,
    businessLicense: item.business_license || undefined,
    phone: item.phone || undefined,
    mobile: item.mobile || undefined,
    email: item.email || undefined,
    website: item.website || undefined,
    vat: item.vat || undefined,
    nik: meta.nik,
    taxName: meta.taxName,
    provenance: provenance || undefined,
    countryId: firstId(item.country_id) ?? null,
    countryName: firstName(item.country_id),
    stateId: firstId(item.state_id) ?? null,
    stateName: firstName(item.state_id),
    cityId: firstId(item.city_id) ?? null,
    cityName: firstName(item.city_id),
    city: item.city || undefined,
    districtId: firstId(item.district_id) ?? null,
    districtName: firstName(item.district_id),
    subDistrictId: firstId(item.subdistrict_id) ?? null,
    subDistrictName: firstName(item.subdistrict_id),
    street: item.street || undefined,
    addressDetail: item.address_detail || undefined,
    addressBenchmark: item.address_benchmark || undefined,
    zip: item.zip || undefined,
    latitude: item.partner_latitude || undefined,
    longitude: item.partner_longitude || undefined,
    farmerCount: item.farmer_count ?? 0,
    workerCount: item.worker_count ?? 0,
    femaleWorkerPct: item.female_worker_pct ?? 0,
    noChildLabor: item.no_child_labor ?? true,
    fairWage: item.fair_wage ?? true,
    wasteManagement: item.waste_management || undefined,
    renewableEnergy: item.renewable_energy ?? false,
    farmCount: item.farm_count ?? 0,
    distilleryCount: item.distillery_count ?? 0,
    cropIds: Array.isArray(item.crop_ids) ? item.crop_ids : [],
    suppliedProductIds: Array.isArray(item.supplied_product_ids) ? item.supplied_product_ids : [],
    paymentTerm: meta.paymentTerm || 'COD',
    bankInfo,
    legacyCode: meta.legacyCode,
    active: item.active,
    createdAt: item.create_date,
    updatedAt: item.write_date
  }
}
