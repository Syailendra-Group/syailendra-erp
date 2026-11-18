/**
 * supplier-category.ts — TypeScript type definitions for Supplier Categories (res.partner.category)
 * Syailendra Group ERP (SCM Pillar)
 */

export interface SupplierCategoryRecord {
  id: number
  name: string
  parentId: number | null
  parentName: string | null
  displayName: string
  color: number
  depth: number
  supplierCount: number
  childCount: number
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface SupplierCategoryFormValues {
  name: string
  parentId: number | null
  color: number
  active: boolean
}

export interface SupplierCategoryListResponse {
  items: SupplierCategoryRecord[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface SupplierCategoryOption {
  id: number
  name: string
  displayName: string
  parentId: number | null
}
