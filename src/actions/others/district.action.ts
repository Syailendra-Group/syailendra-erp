'use server'

import { revalidatePath } from 'next/cache'

import { districtFormSchema } from '@/schemas/others/district-schema'
import { fetchDistrictById, fetchDistricts, persistDistrict, toggleDistrictStatus } from '@/services/odoo/others/district.service'

import type { DistrictFormValues } from '@/schemas/others/district-schema'
import type { DistrictRecord } from '@/types/others/district'

export async function getDistrictsAction(cityId?: number): Promise<{ districts: DistrictRecord[] }> {
  try {
    const districts = await fetchDistricts(cityId)
    return { districts }
  } catch (err) {
    console.error('Failed to fetch districts:', err)
    return { districts: [] }
  }
}

export async function getDistrictByIdAction(id: number): Promise<DistrictRecord | null> {
  try {
    return await fetchDistrictById(id)
  } catch (err) {
    console.error('Failed to fetch district by ID:', err)
    return null
  }
}

export async function saveDistrictAction(values: DistrictFormValues): Promise<{ success: boolean; id?: number; error?: string }> {
  const parsed = districtFormSchema.safeParse(values)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid parameters' }
  }
  try {
    const id = await persistDistrict(parsed.data)
    revalidatePath('/others/districts')
    return { success: true, id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save district'
    return { success: false, error: msg }
  }
}

export async function toggleDistrictStatusAction(id: number, active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await toggleDistrictStatus(id, active)
    revalidatePath('/others/districts')
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to update district status'
    return { success: false, error: msg }
  }
}
