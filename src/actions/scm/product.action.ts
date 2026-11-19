'use server'

import { revalidatePath } from 'next/cache'

import { requireSession } from '@/lib/auth/guard'
import { productFormSchema } from '@/schemas/scm/product-schema'
import { deleteProduct, fetchProductById, fetchProductsPaginated, persistProduct } from '@/services/odoo/scm/product.service'

import type { ProductFormValues } from '@/schemas/scm/product-schema'
import type { FetchProductsParams, PaginatedProductsResult } from '@/services/odoo/scm/product.service'
import type { ProductRecord } from '@/types/scm/product'

export type { FetchProductsParams, ProductRecord, PaginatedProductsResult }

export async function getProductsPaginatedAction(params: FetchProductsParams = {}): Promise<PaginatedProductsResult> {
  await requireSession()
  try {
    return await fetchProductsPaginated(params)
  } catch (err) {
    // A backend failure must never degrade into a convincing but empty table:
    // log the cause and let the client render an explicit error state.
    console.error('Failed to fetch paginated products from Odoo 18:', err)
    throw new Error('PRODUCTS_FETCH_FAILED')
  }
}

export async function getProductByIdAction(id: number): Promise<ProductRecord | null> {
  await requireSession()
  try {
    return await fetchProductById(id)
  } catch (err) {
    console.error(`Failed to fetch product by ID ${id}:`, err)
    return null
  }
}

export async function saveProductAction(rawValues: ProductFormValues): Promise<{ success: boolean; id?: number; error?: string }> {
  await requireSession()
  try {
    const validated = productFormSchema.parse(rawValues)
    const result = await persistProduct(validated)

    if (result.success) {
      revalidatePath('/scm/products')
      revalidatePath('/scm')
    }

    return result
  } catch (err) {
    console.error('Validation failed for product payload:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Invalid parameters provided for product'
    }
  }
}

export async function deleteProductAction(id: number): Promise<{ success: boolean; error?: string }> {
  await requireSession()
  try {
    const result = await deleteProduct(id)

    if (result.success) {
      revalidatePath('/scm/products')
      revalidatePath('/scm')
    }

    return result
  } catch (err) {
    console.error(`Failed to delete product ${id}:`, err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete product'
    }
  }
}
