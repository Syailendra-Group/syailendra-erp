'use server'

import { revalidatePath } from 'next/cache'

import { materialFormSchema } from '@/schemas/sbi/scm/material-schema'
import { deleteMaterial, fetchMaterialById, fetchMaterialsPaginated, persistMaterial } from '@/services/odoo/sbi/scm/material.service'

import type { MaterialFormValues } from '@/schemas/sbi/scm/material-schema'
import type { FetchMaterialsParams, PaginatedMaterialsResult } from '@/services/odoo/sbi/scm/material.service'
import type { MaterialRecord } from '@/types/sbi/scm/material'

export type { FetchMaterialsParams, MaterialRecord, PaginatedMaterialsResult }

export async function getMaterialsPaginatedAction(params: FetchMaterialsParams = {}): Promise<PaginatedMaterialsResult> {
  try {
    return await fetchMaterialsPaginated(params)
  } catch (err) {
    console.error('Failed to fetch paginated materials from Odoo 18:', err)
    return {
      records: [],
      totalCount: 0,
      page: params.page || 1,
      perPage: params.perPage || 20,
      pageCount: 1
    }
  }
}

export async function getMaterialByIdAction(id: number): Promise<MaterialRecord | null> {
  try {
    return await fetchMaterialById(id)
  } catch (err) {
    console.error(`Failed to fetch material by ID ${id}:`, err)
    return null
  }
}

export async function saveMaterialAction(rawValues: MaterialFormValues): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const validated = materialFormSchema.parse(rawValues)
    const result = await persistMaterial(validated)

    if (result.success) {
      revalidatePath('/scm/materials')
      revalidatePath('/scm')
    }

    return result
  } catch (err) {
    console.error('Validation failed for material payload:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Invalid parameters provided for material'
    }
  }
}

export async function deleteMaterialAction(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await deleteMaterial(id)

    if (result.success) {
      revalidatePath('/scm/materials')
      revalidatePath('/scm')
    }

    return result
  } catch (err) {
    console.error(`Failed to delete material ${id}:`, err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete material'
    }
  }
}
