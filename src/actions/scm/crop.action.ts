/**
 * crop.action.ts — Next.js Server Actions for Crop / Commodity Master
 * Syailendra Group ERP (SCM Pillar)
 */

'use server'

import { revalidatePath } from 'next/cache'

import { getSession } from '@/lib/auth/session'
import { cropFormSchema } from '@/schemas/scm/crop-schema'
import { CropService } from '@/services/odoo/scm/crop.service'

import type { CropFormValues } from '@/schemas/scm/crop-schema'
import type { CropOption, CropRecord, FetchCropsParams, PaginatedCropsResult } from '@/types/scm/crop'

async function companyScope(): Promise<number[] | undefined> {
  const session = await getSession()
  return session ? [session.companyId] : undefined
}

function normalizeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)

  if (message === 'DUPLICATE_CODE') return 'DUPLICATE_CODE'
  if (message === 'RELATIONAL_INTEGRITY_ERROR') return 'RELATIONAL_INTEGRITY_ERROR'
  return message
}

export async function fetchCropsAction(params: FetchCropsParams = {}): Promise<PaginatedCropsResult> {
  return await CropService.getCrops(params, await companyScope())
}

export async function fetchCropByIdAction(id: number): Promise<CropRecord | null> {
  return await CropService.getCropById(id, await companyScope())
}

export async function fetchCropOptionsAction(): Promise<CropOption[]> {
  return await CropService.getCropOptions(await companyScope())
}

export async function createCropAction(values: CropFormValues): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const validated = cropFormSchema.parse(values)
    const id = await CropService.createCrop(validated, await companyScope())
    revalidatePath('/[locale]/scm/crops', 'page')
    return { success: true, id }
  } catch (error) {
    return { success: false, error: normalizeError(error) }
  }
}

export async function updateCropAction(id: number, values: CropFormValues): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = cropFormSchema.parse(values)
    await CropService.updateCrop(id, validated, await companyScope())
    revalidatePath('/[locale]/scm/crops', 'page')
    return { success: true }
  } catch (error) {
    return { success: false, error: normalizeError(error) }
  }
}

export async function deleteCropAction(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    await CropService.deleteCrop(id, await companyScope())
    revalidatePath('/[locale]/scm/crops', 'page')
    return { success: true }
  } catch (error) {
    return { success: false, error: normalizeError(error) }
  }
}
