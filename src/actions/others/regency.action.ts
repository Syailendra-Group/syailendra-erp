'use server'

import { revalidatePath } from 'next/cache'

import { regencyFormSchema } from '@/schemas/others/regency-schema'
import {
  checkProvinceExistsByNameOrCode,
  fetchRegencies,
  fetchRegencyById,
  persistRegency,
  toggleRegencyStatus
} from '@/services/odoo/others/regency.service'

import type { RegencyFormValues } from '@/schemas/others/regency-schema'
import type { RegencyRecord } from '@/types/others/regency'

export async function getRegenciesAction(stateId?: number): Promise<{ regencies: RegencyRecord[] }> {
  try {
    const regencies = await fetchRegencies(stateId)
    return { regencies }
  } catch (err) {
    console.error('Failed to fetch regencies:', err)
    return { regencies: [] }
  }
}

export async function getRegencyByIdAction(id: number): Promise<RegencyRecord | null> {
  try {
    return await fetchRegencyById(id)
  } catch (err) {
    console.error('Failed to fetch regency by ID:', err)
    return null
  }
}

export async function checkParentProvinceAction(name: string, code?: string): Promise<{ exists: boolean; id?: number; name?: string }> {
  try {
    return await checkProvinceExistsByNameOrCode(name, code)
  } catch (err) {
    console.error('Failed to check parent province:', err)
    return { exists: false }
  }
}

export async function saveRegencyAction(values: RegencyFormValues): Promise<{ success: boolean; id?: number; error?: string }> {
  const parsed = regencyFormSchema.safeParse(values)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid parameters' }
  }
  try {
    const id = await persistRegency(parsed.data)
    revalidatePath('/others/regencies')
    return { success: true, id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save regency'
    return { success: false, error: msg }
  }
}

export async function toggleRegencyStatusAction(id: number, active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await toggleRegencyStatus(id, active)
    revalidatePath('/others/regencies')
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to update regency status'
    return { success: false, error: msg }
  }
}
