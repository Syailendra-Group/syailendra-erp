/**
 * farm.action.ts — Next.js Server Actions for Farm / Terroir Master
 * Syailendra Group ERP (SCM Pillar)
 */

'use server'

import { revalidatePath } from 'next/cache'

import { getSession } from '@/lib/auth/session'
import { farmFormSchema } from '@/schemas/scm/farm-schema'
import { FarmService } from '@/services/odoo/scm/farm.service'

import type { FarmFormValues } from '@/schemas/scm/farm-schema'
import type { FarmPartnerOption, FarmRecord, FetchFarmsParams, PaginatedFarmsResult } from '@/types/scm/farm'

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

export async function fetchFarmsAction(params: FetchFarmsParams = {}): Promise<PaginatedFarmsResult> {
  return await FarmService.getFarms(params, await companyScope())
}

export async function fetchFarmByIdAction(id: number): Promise<FarmRecord | null> {
  return await FarmService.getFarmById(id, await companyScope())
}

export async function fetchFarmPartnerOptionsAction(): Promise<FarmPartnerOption[]> {
  return await FarmService.getPartnerOptions(await companyScope())
}

export async function createFarmAction(values: FarmFormValues): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const validated = farmFormSchema.parse(values)
    const id = await FarmService.createFarm(validated, await companyScope())
    revalidatePath('/[locale]/scm/farms', 'page')
    return { success: true, id }
  } catch (error) {
    return { success: false, error: normalizeError(error) }
  }
}

export async function updateFarmAction(id: number, values: FarmFormValues): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = farmFormSchema.parse(values)
    await FarmService.updateFarm(id, validated, await companyScope())
    revalidatePath('/[locale]/scm/farms', 'page')
    return { success: true }
  } catch (error) {
    return { success: false, error: normalizeError(error) }
  }
}

export async function deleteFarmAction(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    await FarmService.deleteFarm(id, await companyScope())
    revalidatePath('/[locale]/scm/farms', 'page')
    return { success: true }
  } catch (error) {
    return { success: false, error: normalizeError(error) }
  }
}
