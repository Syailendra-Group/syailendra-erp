/**
 * supplier-type.action.ts — Next.js Server Actions for the flat Supplier Type master
 * Syailendra Group ERP (SCM Pillar)
 */

'use server'

import { revalidatePath } from 'next/cache'

import { requireSession } from '@/lib/auth/guard'
import { supplierTypeFormSchema } from '@/schemas/scm/supplier-type-schema'
import { GetSupplierTypesParams, SupplierTypeService } from '@/services/odoo/scm/supplier-type.service'

import type { SupplierTypeFormValues, SupplierTypeListResponse, SupplierTypeOption, SupplierTypeRecord } from '@/types/scm/supplier-type'

export async function fetchSupplierTypesAction(params: GetSupplierTypesParams = {}): Promise<SupplierTypeListResponse> {
  await requireSession()
  return SupplierTypeService.getSupplierTypes(params)
}

export async function fetchSupplierTypeByIdAction(id: number): Promise<SupplierTypeRecord | null> {
  await requireSession()
  return SupplierTypeService.getSupplierTypeById(id)
}

export async function fetchSupplierTypeOptionsAction(): Promise<SupplierTypeOption[]> {
  await requireSession()
  return SupplierTypeService.getSupplierTypeOptions()
}

export async function createSupplierTypeAction(values: SupplierTypeFormValues): Promise<{ success: boolean; id?: number; error?: string }> {
  await requireSession()
  try {
    const validated = supplierTypeFormSchema.parse(values)
    const newId = await SupplierTypeService.createSupplierType(validated)
    revalidatePath('/[locale]/scm/supplier-types', 'page')
    return { success: true, id: newId }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create supplier type'
    return { success: false, error: message }
  }
}

export async function updateSupplierTypeAction(id: number, values: SupplierTypeFormValues): Promise<{ success: boolean; error?: string }> {
  await requireSession()
  try {
    const validated = supplierTypeFormSchema.parse(values)
    await SupplierTypeService.updateSupplierType(id, validated)
    revalidatePath('/[locale]/scm/supplier-types', 'page')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update supplier type'
    return { success: false, error: message }
  }
}

export async function setSupplierTypeActiveAction(id: number, active: boolean): Promise<{ success: boolean; error?: string }> {
  await requireSession()
  try {
    await SupplierTypeService.setSupplierTypeActive(id, active)
    revalidatePath('/[locale]/scm/supplier-types', 'page')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to change supplier type status'
    return { success: false, error: message }
  }
}
