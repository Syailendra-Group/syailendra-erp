/**
 * submission.service.ts — Odoo 18 RPC service for Partner Submission review (syailendra.partner.submission)
 * Syailendra Group ERP (SCM Pillar)
 */

import { odooClient } from '@/lib/odoo/client'

import type { OdooDomain, OdooFieldValue } from '@/lib/odoo/types'
import type {
  FetchSubmissionsParams,
  PaginatedSubmissionsResult,
  SubmissionKind,
  SubmissionLink,
  SubmissionRecord,
  SubmissionState
} from '@/types/scm/submission'

interface RawSubmission {
  id: number
  name: string | false
  partner_id: [number, string] | false
  kind: string | false
  payload: Record<string, string | number> | false
  state: SubmissionState
  submitted_at: string | false
  reviewed_by: [number, string] | false
  reviewed_at: string | false
  review_notes: string | false
  revision: number | false
  promoted_model: string | false
  promoted_id: number | false
  applicant_name: string | false
  applicant_phone: string | false
  company_id: [number, string] | false
  create_date?: string | false
  write_date?: string | false
}

const MODEL = 'syailendra.partner.submission'

const SUBMISSION_FIELDS = [
  'id',
  'name',
  'partner_id',
  'kind',
  'payload',
  'state',
  'submitted_at',
  'reviewed_by',
  'reviewed_at',
  'review_notes',
  'revision',
  'promoted_model',
  'promoted_id',
  'applicant_name',
  'applicant_phone',
  'company_id',
  'create_date',
  'write_date'
] as const

function toText(value: string | false | undefined): string {
  return typeof value === 'string' ? value : ''
}

function toRelation(value: [number, string] | false | undefined): [number, string] | null {
  return Array.isArray(value) && value.length === 2 && typeof value[0] === 'number' ? value : null
}

function toNumber(value: number | false | undefined): number | null {
  return typeof value === 'number' ? value : null
}

function mapSubmission(raw: RawSubmission): SubmissionRecord {
  const partner = toRelation(raw.partner_id)
  const reviewer = toRelation(raw.reviewed_by)
  const company = toRelation(raw.company_id)

  return {
    id: raw.id,
    name: toText(raw.name),
    partnerId: partner ? partner[0] : null,
    partnerName: partner ? partner[1] : null,
    kind: (raw.kind ?? 'panen') as SubmissionKind,
    payload: raw.payload || null,
    state: raw.state,
    submittedAt: toText(raw.submitted_at) || null,
    reviewedById: reviewer ? reviewer[0] : null,
    reviewedByName: reviewer ? reviewer[1] : null,
    reviewedAt: toText(raw.reviewed_at) || null,
    reviewNotes: toText(raw.review_notes) || null,
    revision: toNumber(raw.revision) ?? 0,
    promotedModel: toText(raw.promoted_model) || null,
    promotedId: toNumber(raw.promoted_id),
    applicantName: toText(raw.applicant_name) || null,
    applicantPhone: toText(raw.applicant_phone) || null,
    companyId: company ? company[0] : null,
    createdAt: raw.create_date || null,
    updatedAt: raw.write_date || null
  }
}

function companyContext(allowedCompanyIds?: number[]): Record<string, OdooFieldValue> | undefined {
  if (!allowedCompanyIds || allowedCompanyIds.length === 0) return undefined
  return { allowed_company_ids: allowedCompanyIds }
}

export class SubmissionService {
  static async getSubmissions(params: FetchSubmissionsParams = {}, allowedCompanyIds?: number[]): Promise<PaginatedSubmissionsResult> {
    const page = Math.max(1, params.page ?? 1)
    const perPage = Math.max(1, Math.min(100, params.perPage ?? 20))
    const offset = (page - 1) * perPage

    const domain: OdooDomain = []

    const search = params.search?.trim()
    if (search) {
      domain.push('|', '|', ['name', 'ilike', search], ['applicant_name', 'ilike', search], ['applicant_phone', 'ilike', search])
    }
    if (params.statuses?.length) {
      domain.push(['state', 'in', params.statuses])
    }
    if (params.kinds?.length) {
      domain.push(['kind', 'in', params.kinds])
    }
    if (params.dateFrom) {
      domain.push(['submitted_at', '>=', params.dateFrom])
    }
    if (params.dateTo) {
      domain.push(['submitted_at', '<=', `${params.dateTo}T23:59:59`])
    }

    const order = params.order || 'submitted_at desc, id desc'

    const total = await odooClient.searchCount(MODEL, domain, allowedCompanyIds)
    const records = await odooClient.searchRead<RawSubmission>(MODEL, domain, [...SUBMISSION_FIELDS], {
      offset,
      limit: perPage,
      order,
      allowedCompanyIds
    })

    return {
      items: records.map(mapSubmission),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage) || 1
    }
  }

  static async getSubmissionById(id: number, allowedCompanyIds?: number[]): Promise<SubmissionRecord | null> {
    const rows = await odooClient.searchRead<RawSubmission>(MODEL, [['id', '=', id]], [...SUBMISSION_FIELDS], {
      limit: 1,
      allowedCompanyIds
    })
    return rows.length > 0 ? mapSubmission(rows[0]) : null
  }

  static async startReview(id: number, allowedCompanyIds?: number[]): Promise<boolean> {
    const ctx = companyContext(allowedCompanyIds)
    return odooClient.executeKw<boolean>(MODEL, 'action_start_review', [[id]], ctx ? { context: ctx } : {})
  }

  static async requestRevision(id: number, notes: string, allowedCompanyIds?: number[]): Promise<boolean> {
    const ctx = companyContext(allowedCompanyIds)
    return odooClient.executeKw<boolean>(MODEL, 'action_request_revision', [[id], notes], ctx ? { context: ctx } : {})
  }

  static async reject(id: number, notes: string, allowedCompanyIds?: number[]): Promise<boolean> {
    const ctx = companyContext(allowedCompanyIds)
    return odooClient.executeKw<boolean>(MODEL, 'action_reject', [[id], notes], ctx ? { context: ctx } : {})
  }

  static async approve(id: number, links: SubmissionLink[] | null | undefined, allowedCompanyIds?: number[]): Promise<boolean> {
    const ctx = companyContext(allowedCompanyIds)
    const kwargs: Record<string, OdooFieldValue> = {}
    if (links !== undefined) kwargs.links = links
    if (ctx) kwargs.context = ctx
    return odooClient.executeKw<boolean>(MODEL, 'action_approve', [[id]], kwargs)
  }
}
