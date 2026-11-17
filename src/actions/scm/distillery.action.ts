'use server'

import { revalidatePath } from 'next/cache'

import { requireSession } from '@/lib/auth/guard'
import { distilleryFormSchema } from '@/schemas/scm/distillery-schema'
import { fetchDistilleries, fetchDistilleriesPaginated, persistDistillery, updateDistilleryActiveState } from '@/services/odoo/scm/distillery.service'

import type { DistilleryFormValues } from '@/schemas/scm/distillery-schema'
import type { FetchDistilleriesPaginatedParams, FetchDistilleriesPaginatedResult } from '@/services/odoo/scm/distillery.service'
import type { DistilleryRecord } from '@/types/scm/distillery'

export type { DistilleryRecord }

export async function getDistilleriesAction(): Promise<{ distilleries: DistilleryRecord[]; error?: string }> {
  await requireSession()
  try {
    const distilleries = await fetchDistilleries()
    return { distilleries }
  } catch {
    return {
      distilleries: [],
      error: 'Failed to retrieve distillery units from Odoo 18'
    }
  }
}

export async function getDistilleriesPaginatedAction(params: FetchDistilleriesPaginatedParams = {}): Promise<FetchDistilleriesPaginatedResult> {
  await requireSession()
  try {
    return await fetchDistilleriesPaginated(params)
  } catch {
    return {
      records: [],
      totalCount: 0,
      page: params.page || 1,
      perPage: params.perPage || 20
    }
  }
}

export async function saveDistilleryAction(rawValues: DistilleryFormValues): Promise<{ success: boolean; id?: number; error?: string }> {
  await requireSession()
  try {
    const validated = distilleryFormSchema.parse(rawValues)
    const result = await persistDistillery(validated)

    if (result.success) {
      revalidatePath('/scm/distilleries')
    }

    return result
  } catch {
    return {
      success: false,
      error: 'Validation failed for distillery unit payload'
    }
  }
}

export async function toggleDistilleryStatusAction(id: number, active: boolean): Promise<{ success: boolean; error?: string }> {
  await requireSession()
  try {
    const result = await updateDistilleryActiveState(id, active)
    if (result.success) {
      revalidatePath('/scm/distilleries')
    }
    return result
  } catch {
    return {
      success: false,
      error: 'Failed to toggle active state of distillery'
    }
  }
}
