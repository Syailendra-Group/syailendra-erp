/**
 * supplier-category.action.ts — Next.js Server Actions for Supplier Categories
 * Syailendra Group ERP (SCM Pillar)
 */

'use server'

import { revalidatePath } from 'next/cache'

import { requireSession } from '@/lib/auth/guard'
import { supplierCategoryFormSchema } from '@/schemas/scm/supplier-category-schema'
import { GetSupplierCategoriesParams, SupplierCategoryService } from '@/services/odoo/scm/supplier-category.service'

import type {
  SupplierCategoryFormValues,
  SupplierCategoryListResponse,
  SupplierCategoryOption,
  SupplierCategoryRecord
} from '@/types/scm/supplier-category'

export async function fetchSupplierCategoriesAction(params: GetSupplierCategoriesParams = {}): Promise<SupplierCategoryListResponse> {
  await requireSession()
  return SupplierCategoryService.getSupplierCategories(params)
}

export async function fetchSupplierCategoryByIdAction(id: number): Promise<SupplierCategoryRecord | null> {
  await requireSession()
  return SupplierCategoryService.getSupplierCategoryById(id)
}

export async function fetchSupplierCategoryOptionsAction(): Promise<SupplierCategoryOption[]> {
  await requireSession()
  return SupplierCategoryService.getSupplierCategoryOptions()
}

export async function fetchSupplierCategoryUsageAction(id: number): Promise<number> {
  await requireSession()
  return SupplierCategoryService.getSupplierCategoryUsage(id)
}

export async function createSupplierCategoryAction(values: SupplierCategoryFormValues): Promise<{ success: boolean; id?: number; error?: string }> {
  await requireSession()
  try {
    const validated = supplierCategoryFormSchema.parse(values)
    const newId = await SupplierCategoryService.createSupplierCategory(validated)
    revalidatePath('/[locale]/scm/supplier-categories', 'page')
    return { success: true, id: newId }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create supplier category'
    return { success: false, error: message }
  }
}

export async function updateSupplierCategoryAction(id: number, values: SupplierCategoryFormValues): Promise<{ success: boolean; error?: string }> {
  await requireSession()
  try {
    const validated = supplierCategoryFormSchema.parse(values)
    await SupplierCategoryService.updateSupplierCategory(id, validated)
    revalidatePath('/[locale]/scm/supplier-categories', 'page')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update supplier category'
    return { success: false, error: message }
  }
}

export async function deleteSupplierCategoryAction(id: number): Promise<{ success: boolean; error?: string; isRelational?: boolean }> {
  await requireSession()
  try {
    await SupplierCategoryService.deleteSupplierCategory(id)
    revalidatePath('/[locale]/scm/supplier-categories', 'page')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete supplier category'
    if (message === 'RELATIONAL_INTEGRITY_ERROR') {
      return { success: false, error: message, isRelational: true }
    }
    return { success: false, error: message }
  }
}
