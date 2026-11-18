/**
 * supplier-type.ts — TypeScript types for the flat Supplier Type master
 * Syailendra Group ERP (SCM Pillar)
 *
 * A supplier type is the business-actor classification (Petani, Penyuling, ...).
 * Procurement grouping lives in supplier-category (res.partner.category).
 */

export interface SupplierTypeRecord {
  id: number
  code: string
  name: string
  description?: string
  sequence: number
  supplierCount: number
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface SupplierTypeFormValues {
  name: string
  description?: string
  sequence: number
  active: boolean
}

export interface SupplierTypeListResponse {
  items: SupplierTypeRecord[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface SupplierTypeOption {
  id: number
  code: string
  name: string
}
