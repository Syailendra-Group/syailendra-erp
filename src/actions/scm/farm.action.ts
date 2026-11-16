'use server'

import { revalidatePath } from 'next/cache'

import { requireSession } from '@/lib/auth/guard'
import { getSession } from '@/lib/auth/session'
import { farmFormSchema } from '@/schemas/scm/farm-schema'
import { CommodityService } from '@/services/odoo/scm/commodity.service'
import { FarmService } from '@/services/odoo/scm/farm.service'

import type { FarmFormValues } from '@/schemas/scm/farm-schema'
import type { FarmPartnerOption, FarmRecord, FarmsTableData, FetchFarmsParams, PaginatedFarmsResult } from '@/types/scm/farm'

/**
 * farm.action.ts — Next.js Server Actions for Farm / Terroir Master
 * Syailendra Group ERP (SCM Pillar)
 */
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
  await requireSession()
  return await FarmService.getFarms(params, await companyScope())
}

export async function fetchFarmsTableDataAction(params: FetchFarmsParams = {}): Promise<FarmsTableData> {
  await requireSession()
  const scope = await companyScope()
  const [page, commodityOptions] = await Promise.all([FarmService.getFarms(params, scope), CommodityService.getCommodityOptions(scope)])
  return { page, commodityOptions }
}

export async function fetchFarmByIdAction(id: number): Promise<FarmRecord | null> {
  await requireSession()
  return await FarmService.getFarmById(id, await companyScope())
}

export async function fetchFarmPartnerOptionsAction(): Promise<FarmPartnerOption[]> {
  await requireSession()
  return await FarmService.getPartnerOptions(await companyScope())
}

export async function createFarmAction(values: FarmFormValues): Promise<{ success: boolean; id?: number; error?: string }> {
  await requireSession()
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
  await requireSession()
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
  await requireSession()
  try {
    await FarmService.deleteFarm(id, await companyScope())
    revalidatePath('/[locale]/scm/farms', 'page')
    return { success: true }
  } catch (error) {
    return { success: false, error: normalizeError(error) }
  }
}
