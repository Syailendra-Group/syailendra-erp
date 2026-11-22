/**
 * supplier-form.ts — Shared contracts for the Supplier form section components
 * Syailendra Group ERP (SCM Pillar)
 */

import type { UseFormReturn } from 'react-hook-form'
import type { SupplierFormValues } from './supplier'

export interface SupplierSectionProps {
  form: UseFormReturn<SupplierFormValues>
  disabled?: boolean
  digitalCode?: string
  recordId?: number
  isEdit?: boolean
}

export type SupplierSectionId = 'identity' | 'contact' | 'location' | 'finance' | 'esg' | 'assets'

export interface SupplierFormProps {
  initialData?: import('./supplier').SupplierRecord | null
  isEdit?: boolean
}
