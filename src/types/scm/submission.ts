/**
 * submission.ts — TypeScript definitions for Partner Submission review (syailendra.partner.submission)
 * Syailendra Group ERP (SCM Pillar)
 */

export type SubmissionKind = 'petani' | 'panen' | 'serah_terima' | 'distilasi' | 'kirim'

export type SubmissionState = 'draft' | 'submitted' | 'in_review' | 'needs_revision' | 'approved' | 'rejected' | 'cancelled'

export type ReviewActionType = 'start_review' | 'request_revision' | 'reject' | 'approve'

export type SubmissionLink = {
  model: string
  res_id: number
}

export interface SubmissionRecord {
  id: number
  name: string
  partnerId: number | null
  partnerName: string | null
  kind: SubmissionKind
  payload: Record<string, string | number> | null
  state: SubmissionState
  submittedAt: string | null
  reviewedById: number | null
  reviewedByName: string | null
  reviewedAt: string | null
  reviewNotes: string | null
  revision: number
  promotedModel: string | null
  promotedId: number | null
  applicantName: string | null
  applicantPhone: string | null
  companyId: number | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface FetchSubmissionsParams {
  page?: number
  perPage?: number
  search?: string
  statuses?: SubmissionState[]
  kinds?: SubmissionKind[]
  dateFrom?: string
  dateTo?: string
  order?: string
}

export interface PaginatedSubmissionsResult {
  items: SubmissionRecord[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface SubmissionsTableData {
  page: PaginatedSubmissionsResult
}

export interface ReviewSubmissionParams {
  id: number
  action: ReviewActionType
  notes?: string | null
  links?: SubmissionLink[] | null
}

export interface ReviewSubmissionResult {
  success: boolean
  error?: string
}
