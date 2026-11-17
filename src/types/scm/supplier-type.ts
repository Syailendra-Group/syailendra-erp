/**
 * supplier-type.ts — TypeScript type definitions for Supplier Type Master Data
 * Syailendra Group ERP (SCM Pillar)
 */

export interface SupplierTypeRecord {
  id: number
  name: string
  parentId: number | null
  parentName: string | null
  displayName: string
  color: number
  partnerCount: number
  isParent: boolean
  childCount: number
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface SupplierTypeFormValues {
  name: string
  parentId: number | null
  color: number
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
  name: string
  displayName: string
  parentId: number | null
}
