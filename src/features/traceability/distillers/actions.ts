'use server'

import { revalidatePath } from 'next/cache'

import { distillerFormSchema } from '@/schemas/traceability/distiller-schema'
import { fetchDistillers, persistDistiller, updateDistillerActiveState } from '@/services/odoo/traceability/distiller.service'

import type { DistillerFormValues } from '@/schemas/traceability/distiller-schema'
import type { DistillerRecord } from '@/types/traceability/distiller'

export type { DistillerRecord }

export async function getDistillersAction(): Promise<{ distillers: DistillerRecord[] }> {
  try {
    const distillers = await fetchDistillers()
    return { distillers }
  } catch (err) {
    console.error('Failed to fetch distillers from Odoo 18:', err)
    return { distillers: [] }
  }
}

export async function saveDistillerAction(values: DistillerFormValues): Promise<{ success: boolean; id?: number; error?: string }> {
  const parsed = distillerFormSchema.safeParse(values)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid parameters' }
  }

  try {
    const savedId = await persistDistiller(parsed.data)
    revalidatePath('/traceability/distillers')
    return { success: true, id: savedId }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save distiller unit'
    return { success: false, error: msg }
  }
}

export async function toggleDistillerStatusAction(id: number, active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDistillerActiveState(id, active)
    revalidatePath('/traceability/distillers')
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to update distiller status'
    return { success: false, error: msg }
  }
}
