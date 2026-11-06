/**
 * supplier.action.ts — Next.js Server Actions for Master Supplier
 * Syailendra Group ERP (SCM Pillar)
 */

'use server'

import { revalidatePath } from 'next/cache'

import { supplierFormSchema } from '@/schemas/scm/supplier-schema'
import { GetSuppliersParams, SupplierService } from '@/services/odoo/scm/supplier.service'

import type { SupplierFormValues, SupplierListResponse, SupplierRecord } from '@/types/scm/supplier'

export async function fetchSuppliersAction(params: GetSuppliersParams = {}): Promise<SupplierListResponse> {
  return await SupplierService.getSuppliers(params)
}

export async function fetchSupplierByIdAction(id: number): Promise<SupplierRecord | null> {
  return await SupplierService.getSupplierById(id)
}

export async function createSupplierAction(values: SupplierFormValues): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const validated = supplierFormSchema.parse(values)
    const newId = await SupplierService.createSupplier(validated)
    revalidatePath('/[locale]/scm/suppliers', 'page')
    return { success: true, id: newId }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create supplier'
    return { success: false, error: message }
  }
}

export async function updateSupplierAction(id: number, values: SupplierFormValues): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = supplierFormSchema.parse(values)
    await SupplierService.updateSupplier(id, validated)
    revalidatePath('/[locale]/scm/suppliers', 'page')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update supplier'
    return { success: false, error: message }
  }
}

export async function toggleSupplierStatusAction(id: number, active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await SupplierService.toggleSupplierStatus(id, active)
    revalidatePath('/[locale]/scm/suppliers', 'page')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to toggle supplier status'
    return { success: false, error: message }
  }
}

export async function deleteSupplierAction(id: number): Promise<{ success: boolean; error?: string; isRelational?: boolean }> {
  try {
    await SupplierService.deleteSupplier(id)
    revalidatePath('/[locale]/scm/suppliers', 'page')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete supplier'
    if (message === 'RELATIONAL_INTEGRITY_ERROR') {
      return { success: false, error: message, isRelational: true }
    }
    return { success: false, error: message }
  }
}
