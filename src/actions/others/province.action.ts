'use server'

import { revalidatePath } from 'next/cache'

import { provinceFormSchema } from '@/schemas/others/province-schema'
import { fetchProvinceById, fetchProvinces, persistProvince } from '@/services/odoo/others/province.service'

import type { ProvinceFormValues } from '@/schemas/others/province-schema'
import type { ProvinceRecord } from '@/types/others/province'

export async function getProvincesAction(countryId: number = 100): Promise<{ provinces: ProvinceRecord[] }> {
  try {
    const provinces = await fetchProvinces(countryId)
    return { provinces }
  } catch (err) {
    console.error('Failed to fetch provinces:', err)
    return { provinces: [] }
  }
}

export async function getProvinceByIdAction(id: number): Promise<ProvinceRecord | null> {
  try {
    return await fetchProvinceById(id)
  } catch (err) {
    console.error('Failed to fetch province by ID:', err)
    return null
  }
}

export async function saveProvinceAction(values: ProvinceFormValues): Promise<{ success: boolean; id?: number; error?: string }> {
  const parsed = provinceFormSchema.safeParse(values)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid parameters' }
  }
  try {
    const id = await persistProvince(parsed.data)
    revalidatePath('/others/provinces')
    return { success: true, id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save province'
    return { success: false, error: msg }
  }
}
