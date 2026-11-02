'use server'

import { revalidatePath } from 'next/cache'

import { farmerFormSchema } from '@/schemas/traceability/farmer-schema'
import { fetchFarmerByIdentifier, fetchFarmers, persistFarmer, updateFarmerActiveState } from '@/services/odoo/traceability/farmer.service'

import type { FarmerFormValues } from '@/schemas/traceability/farmer-schema'
import type { FarmerRecord } from '@/types/traceability/farmer'

export type { FarmerRecord }

export async function getFarmersAction(): Promise<{ farmers: FarmerRecord[] }> {
  try {
    const farmers = await fetchFarmers()
    return { farmers }
  } catch (err) {
    console.error('Failed to fetch farmers from Odoo 18:', err)
    return { farmers: [] }
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
    revalidatePath('/traceability/farmers')
    return { success: true, id: savedId }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save farmer to Odoo'
    return { success: false, error: msg }
  }
}

export async function toggleFarmerStatusAction(id: number, active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await updateFarmerActiveState(id, active)
    revalidatePath('/traceability/farmers')
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to update farmer status'
    return { success: false, error: msg }
  }
}
