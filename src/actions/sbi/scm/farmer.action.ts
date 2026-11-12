'use server'

import { revalidatePath } from 'next/cache'

import { farmerFormSchema } from '@/schemas/sbi/scm/farmer-schema'
import {
  fetchFarmerByIdentifier,
  fetchFarmers,
  fetchFarmersPaginated,
  fetchNextFarmerSequence,
  persistFarmer,
  updateFarmerActiveState
} from '@/services/odoo/sbi/scm/farmer.service'

import type { FarmerFormValues } from '@/schemas/sbi/scm/farmer-schema'
import type { FetchFarmersParams, PaginatedFarmersResult } from '@/services/odoo/sbi/scm/farmer.service'
import type { FarmerRecord } from '@/types/sbi/scm/farmer'

export type { FarmerRecord, FetchFarmersParams, PaginatedFarmersResult }

export async function getFarmersAction(): Promise<{ farmers: FarmerRecord[] }> {
  try {
    const farmers = await fetchFarmers()
    return { farmers }
  } catch (err) {
    console.error('Failed to fetch farmers from Odoo 18:', err)
    return { farmers: [] }
  }
}

export async function getFarmersPaginatedAction(params: FetchFarmersParams = {}): Promise<PaginatedFarmersResult> {
  try {
    return await fetchFarmersPaginated(params)
  } catch (err) {
    console.error('Failed to fetch paginated farmers from Odoo 18:', err)
    return {
      records: [],
      totalCount: 0,
      page: params.page || 1,
      perPage: params.perPage || 20,
      pageCount: 1
    }
  }
}

export async function getFarmerByIdAction(identifier: number | string): Promise<FarmerRecord | null> {
  try {
    return await fetchFarmerByIdentifier(identifier)
  } catch (err) {
    console.error('Failed to fetch farmer by ID:', err)
    return null
  }
}

export async function saveFarmerAction(values: FarmerFormValues): Promise<{ success: boolean; id?: number; error?: string }> {
  const parsed = farmerFormSchema.safeParse(values)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid parameters' }
  }

  try {
    const savedId = await persistFarmer(parsed.data)
    revalidatePath('/scm/farmers')
    return { success: true, id: savedId }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save farmer to Odoo'
    return { success: false, error: msg }
  }
}

export async function toggleFarmerStatusAction(id: number, active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await updateFarmerActiveState(id, active)
    revalidatePath('/scm/farmers')
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to update farmer status'
    return { success: false, error: msg }
  }
}
export async function getNextFarmerIdAction(stateId: number): Promise<{ success: boolean; ref?: string; error?: string }> {
  try {
    const ref = await fetchNextFarmerSequence(stateId)
    return { success: true, ref }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to generate next farmer sequence ID'
    console.error('Failed to generate next farmer sequence ID:', err)
    return { success: false, error: msg }
  }
}
