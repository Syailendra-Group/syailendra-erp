'use server'

import { revalidatePath } from 'next/cache'

import { requireSession } from '@/lib/auth/guard'
import { getSession } from '@/lib/auth/session'
import { submissionReviewSchema } from '@/schemas/scm/submission-schema'
import { SubmissionService } from '@/services/odoo/scm/submission.service'

import type { FetchSubmissionsParams, PaginatedSubmissionsResult, ReviewSubmissionParams, SubmissionRecord } from '@/types/scm/submission'

/**
 * submission.action.ts — Next.js Server Actions for Partner Submission review
 * Syailendra Group ERP (SCM Pillar)
 */

async function companyScope(): Promise<number[] | undefined> {
  const session = await getSession()
  return session ? [session.companyId] : undefined
}

function normalizeError(error: Error): string {
  const message = error.message

  // W7 backend errors arrive as "E_<CODE>: human readable detail"; keep the E_ code prefix only.
  const colonIndex = message.indexOf(': ')
  const code = colonIndex >= 0 ? message.slice(0, colonIndex) : message
  return code.startsWith('E_') ? code : message
}

export async function fetchSubmissionsAction(params: FetchSubmissionsParams = {}): Promise<PaginatedSubmissionsResult> {
  await requireSession()
  return await SubmissionService.getSubmissions(params, await companyScope())
}

export async function fetchSubmissionByIdAction(id: number): Promise<SubmissionRecord | null> {
  await requireSession()
  return await SubmissionService.getSubmissionById(id, await companyScope())
}

export async function reviewSubmissionAction(values: ReviewSubmissionParams): Promise<{ success: boolean; error?: string }> {
  await requireSession()
  try {
    // Client-side zod envelope; server re-validates before mutating Odoo.
    submissionReviewSchema.parse({
      action: values.action,
      notes: values.notes ?? undefined,
      links: values.links ?? undefined
    })

    switch (values.action) {
      case 'start_review':
        await SubmissionService.startReview(values.id, await companyScope())
        break
      case 'request_revision':
        await SubmissionService.requestRevision(values.id, values.notes ?? '', await companyScope())
        break
      case 'reject':
        await SubmissionService.reject(values.id, values.notes ?? '', await companyScope())
        break
      case 'approve':
        await SubmissionService.approve(values.id, values.links ?? null, await companyScope())
        break
    }

    revalidatePath('/[locale]/scm/submissions', 'page')
    return { success: true }
  } catch (error) {
    return { success: false, error: normalizeError(error instanceof Error ? error : new Error(String(error))) }
  }
}
