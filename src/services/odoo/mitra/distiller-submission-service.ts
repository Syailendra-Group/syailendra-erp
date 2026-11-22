'use server'

import { odooClient } from '@/lib/odoo/client'

const MODEL = 'syailendra.partner.submission'

export type SubmissionKind = 'distillation' | 'shipment'

export interface DistillerSubmissionInput {
  kind: SubmissionKind
  payload: Record<string, string | number | null>
  accessId: string
  lat?: number | null
  lon?: number | null
  photoFile?: File | null
}

export interface SubmitResult {
  ok: boolean
  id?: number
  error?: { code: string; message: string }
}

function toSubmitError(error: { code?: string; message?: string } | undefined): { code: string; message: string } {
  return {
    code: error?.code ?? 'E_SUBMIT_UNKNOWN',
    message: error?.message ?? 'Submission failed.'
  }
}

// W7 contract: odooClient.create then executeKw('syailendra.partner.submission','action_submit',[[recordId],accessId],{})
// args[0] = [recordId], positional args follow (accessId is the second positional arg).
export async function submitDistillation(input: DistillerSubmissionInput): Promise<SubmitResult> {
  return submitSubmission(input)
}

export async function submitShipment(input: DistillerSubmissionInput): Promise<SubmitResult> {
  return submitSubmission(input)
}

async function submitSubmission(input: DistillerSubmissionInput): Promise<SubmitResult> {
  try {
    const recordId = await odooClient.create(MODEL, {
      kind: input.kind,
      payload: JSON.stringify(input.payload),
      lat: input.lat ?? null,
      lon: input.lon ?? null
    })
    await odooClient.executeKw(MODEL, 'action_submit', [[recordId], input.accessId], {})
    return { ok: true, id: Number(recordId) }
  } catch (error) {
    return {
      ok: false,
      error: toSubmitError(error as { code?: string; message?: string })
    }
  }
}
