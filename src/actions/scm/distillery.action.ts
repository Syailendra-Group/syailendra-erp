'use server'

import { revalidatePath } from 'next/cache'

import { requireSession } from '@/lib/auth/guard'
import { distilleryFormSchema } from '@/schemas/scm/distillery-schema'
import {
  fetchDistilleries,
  fetchDistilleriesPaginated,
  fetchDistilleryById,
  fetchDistilleryPartnerOptions,
  persistDistillery,
  updateDistilleryActiveState
} from '@/services/odoo/scm/distillery.service'

import type { DistilleryFormValues } from '@/schemas/scm/distillery-schema'
import type { DistilleryPartnerOption, DistilleryRecord, FetchDistilleriesPaginatedResult, FetchDistilleriesParams } from '@/types/scm/distillery'

export type { DistilleryRecord }

export async function getDistilleriesAction(): Promise<{ distilleries: DistilleryRecord[]; error?: string }> {
  await requireSession()
  try {
    const distilleries = await fetchDistilleries()
    return { distilleries }
  } catch (err) {
    return {
      distilleries: [],
      error: err instanceof Error ? err.message : 'Failed to retrieve distillation facilities from Odoo 18'
    }
  }
}

export async function getDistilleriesPaginatedAction(params: FetchDistilleriesParams = {}): Promise<FetchDistilleriesPaginatedResult> {
  await requireSession()
  try {
    return await fetchDistilleriesPaginated(params)
  } catch {
    return {
      records: [],
      totalCount: 0,
      page: params.page ?? 1,
      perPage: params.perPage ?? 20
    }
  }
}

export async function getDistilleryByIdAction(id: number): Promise<DistilleryRecord | null> {
  await requireSession()
  try {
    return await fetchDistilleryById(id)
  } catch {
    return null
  }
}

export async function getDistilleryPartnerOptionsAction(): Promise<DistilleryPartnerOption[]> {
  await requireSession()
  try {
    return await fetchDistilleryPartnerOptions()
  } catch {
    return []
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
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Validation failed for distillation facility payload'
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
      error: 'Failed to toggle active state of distillation facility'
    }
  }
}
