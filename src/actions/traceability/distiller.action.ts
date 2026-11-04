'use server'

import { revalidatePath } from 'next/cache'

import { distillerFormSchema } from '@/schemas/traceability/distiller-schema'
import {
  fetchDistillers,
  fetchDistillersPaginated,
  persistDistiller,
  updateDistillerActiveState
} from '@/services/odoo/traceability/distiller.service'

import type { DistillerFormValues } from '@/schemas/traceability/distiller-schema'
import type { FetchDistillersPaginatedParams, FetchDistillersPaginatedResult } from '@/services/odoo/traceability/distiller.service'
import type { DistillerRecord } from '@/types/traceability/distiller'

export type { DistillerRecord }

export async function getDistillersAction(): Promise<{ distillers: DistillerRecord[]; error?: string }> {
  try {
    const distillers = await fetchDistillers()
    return { distillers }
  } catch {
    return {
      distillers: [],
      error: 'Failed to retrieve distiller units from Odoo 18'
    }
  }
}

export async function getDistillersPaginatedAction(params: FetchDistillersPaginatedParams = {}): Promise<FetchDistillersPaginatedResult> {
  try {
    return await fetchDistillersPaginated(params)
  } catch {
    return {
      records: [],
      totalCount: 0,
      page: params.page || 1,
      perPage: params.perPage || 20
    }
  }
}

export async function saveDistillerAction(rawValues: DistillerFormValues): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const validated = distillerFormSchema.parse(rawValues)
    const result = await persistDistiller(validated)

    if (result.success) {
      revalidatePath('/traceability/distillers')
    }

    return result
  } catch {
    return {
      success: false,
      error: 'Validation failed for distiller unit payload'
    }
  }
}

export async function toggleDistillerStatusAction(id: number, active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await updateDistillerActiveState(id, active)
    if (result.success) {
      revalidatePath('/traceability/distillers')
    }
    return result
  } catch {
    return {
      success: false,
      error: 'Failed to toggle active state of distiller'
    }
  }
}
