'use server'

import { revalidatePath } from 'next/cache'

import { villageFormSchema } from '@/schemas/others/village-schema'
import { fetchVillageById, fetchVillages, persistVillage, toggleVillageStatus } from '@/services/odoo/others/village.service'

import type { VillageFormValues } from '@/schemas/others/village-schema'
import type { VillageRecord } from '@/types/others/village'

export async function getVillagesAction(districtId?: number): Promise<{ villages: VillageRecord[] }> {
  try {
    const villages = await fetchVillages(districtId)
    return { villages }
  } catch (err) {
    console.error('Failed to fetch villages:', err)
    return { villages: [] }
  }
}

export async function getVillageByIdAction(id: number): Promise<VillageRecord | null> {
  try {
    return await fetchVillageById(id)
  } catch (err) {
    console.error('Failed to fetch village by ID:', err)
    return null
  }
}

export async function saveVillageAction(values: VillageFormValues): Promise<{ success: boolean; id?: number; error?: string }> {
  const parsed = villageFormSchema.safeParse(values)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid parameters' }
  }
  try {
    const id = await persistVillage(parsed.data)
    revalidatePath('/others/villages')
    return { success: true, id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save village'
    return { success: false, error: msg }
  }
}

export async function toggleVillageStatusAction(id: number, active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await toggleVillageStatus(id, active)
    revalidatePath('/others/villages')
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to update village status'
    return { success: false, error: msg }
  }
}
