'use server'

import { revalidatePath } from 'next/cache'

import { requireSession } from '@/lib/auth/guard'
import { getSession } from '@/lib/auth/session'
import { commodityFormSchema } from '@/schemas/scm/commodity-schema'
import { CommodityService } from '@/services/odoo/scm/commodity.service'

import type { CommodityFormValues } from '@/schemas/scm/commodity-schema'
import type { CommodityOption, CommodityRecord, FetchCommoditiesParams, PaginatedCommoditiesResult } from '@/types/scm/commodity'

/**
 * commodity.action.ts — Next.js Server Actions for Commodity Master
 * Syailendra Group ERP (SCM Pillar)
 */
async function companyScope(): Promise<number[] | undefined> {
  const session = await getSession()
  return session ? [session.companyId] : undefined
}

function normalizeError(error: Error): string {
  const message = error.message

  if (message === 'DUPLICATE_CODE') return 'DUPLICATE_CODE'
  if (message === 'RELATIONAL_INTEGRITY_ERROR') return 'RELATIONAL_INTEGRITY_ERROR'
  return message
}

export async function fetchCommoditiesAction(params: FetchCommoditiesParams = {}): Promise<PaginatedCommoditiesResult> {
  await requireSession()
  return await CommodityService.getCommodities(params, await companyScope())
}

export async function fetchCommodityByIdAction(id: number): Promise<CommodityRecord | null> {
  await requireSession()
  return await CommodityService.getCommodityById(id, await companyScope())
}

export async function fetchCommodityOptionsAction(): Promise<CommodityOption[]> {
  await requireSession()
  return await CommodityService.getCommodityOptions(await companyScope())
}

export async function createCommodityAction(values: CommodityFormValues): Promise<{ success: boolean; id?: number; error?: string }> {
  await requireSession()
  try {
    const validated = commodityFormSchema.parse(values)
    const id = await CommodityService.createCommodity(validated, await companyScope())
    revalidatePath('/[locale]/scm/commodities', 'page')
    return { success: true, id }
  } catch (error) {
    return { success: false, error: normalizeError(error instanceof Error ? error : new Error(String(error))) }
  }
}

export async function updateCommodityAction(id: number, values: CommodityFormValues): Promise<{ success: boolean; error?: string }> {
  await requireSession()
  try {
    const validated = commodityFormSchema.parse(values)
    await CommodityService.updateCommodity(id, validated, await companyScope())
    revalidatePath('/[locale]/scm/commodities', 'page')
    return { success: true }
  } catch (error) {
    return { success: false, error: normalizeError(error instanceof Error ? error : new Error(String(error))) }
  }
}

export async function deleteCommodityAction(id: number): Promise<{ success: boolean; error?: string }> {
  await requireSession()
  try {
    await CommodityService.deleteCommodity(id, await companyScope())
    revalidatePath('/[locale]/scm/commodities', 'page')
    return { success: true }
  } catch (error) {
    return { success: false, error: normalizeError(error instanceof Error ? error : new Error(String(error))) }
  }
}
