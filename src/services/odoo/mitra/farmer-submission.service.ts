import { odooClient } from '@/lib/odoo/client'

import type { OdooFieldValue } from '@/lib/odoo/types'

/**
 * farmer-submission.service.ts — Odoo 18 RPC wrapper for partner submissions
 * (syailendra.partner.submission), farmer_profile / harvest / handover kinds.
 *
 * Mirrors the W7 backend contract:
 *   create draft via odooClient.create, then executeKw action_submit([[recordId], accessId], {})
 *
 * Syailendra Group ERP (Partner Portal, W2)
 *
 * NOTE: odooClient.create<number>(model, values) signature is assumed to return
 * the created record id. Wire this service into the /api/mitra/submissions
 * endpoint (shared infra, owned by the platform team).
 */
const MODEL = 'syailendra.partner.submission'

export type FarmerSubmissionKind = 'farmer_profile' | 'harvest' | 'handover'

export interface FarmerSubmissionDraft {
  kind: FarmerSubmissionKind
  payload: Record<string, string | number>
  partnerId: number
}

export interface FarmerSubmissionInput extends FarmerSubmissionDraft {
  accessId: number
  lat?: number
  lon?: number
}

export interface FarmerSubmissionResult {
  recordId: number
  name: string
  submitted: boolean
}

export class FarmerSubmissionService {
  static async createDraft(draft: FarmerSubmissionDraft): Promise<number> {
    const recordId = await odooClient.create<number>(MODEL, {
      kind: draft.kind,
      payload: draft.payload,
      partner_id: draft.partnerId,
      state: 'draft'
    } as Record<string, OdooFieldValue>)
    return recordId
  }

  static async actionSubmit(recordId: number, accessId: number): Promise<boolean> {
    // args[0] is the recordset [recordId], positional args follow (access_id).
    return odooClient.executeKw<boolean>(MODEL, 'action_submit', [[recordId], accessId], {})
  }

  static async submitFarmerSubmission(input: FarmerSubmissionInput): Promise<FarmerSubmissionResult> {
    const recordId = await this.createDraft(input)
    await this.actionSubmit(recordId, input.accessId)
    return { recordId, name: '', submitted: true }
  }
}
