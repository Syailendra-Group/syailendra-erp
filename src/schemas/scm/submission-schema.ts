/**
 * submission-schema.ts — Zod validation schema for Partner Submission review actions
 * Syailendra Group ERP (SCM Pillar)
 */

import { z } from 'zod'

import { createSchemaMessageResolver } from '@/utils/schema-helper'

import type { ReviewActionType, SubmissionKind } from '@/types/scm/submission'
import type { SchemaTranslator } from '@/utils/schema-helper'

export const SUBMISSION_KINDS = ['petani', 'panen', 'serah_terima', 'distilasi', 'kirim'] as const satisfies SubmissionKind[]

export const SUBMISSION_STATES = ['draft', 'submitted', 'in_review', 'needs_revision', 'approved', 'rejected', 'cancelled'] as const

export const REVIEW_ACTIONS = ['start_review', 'request_revision', 'reject', 'approve'] as const satisfies ReviewActionType[]

export function getSubmissionReviewSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return z
    .object({
      action: z.enum(REVIEW_ACTIONS, {
        message: msg('validation.actionRequired', 'Pilih tindakan tinjauan')
      }),
      notes: z
        .string()
        .max(2000, { message: msg('validation.notesMax', 'Catatan maksimal {max} karakter', { max: 2000 }) })
        .optional()
        .default(''),
      links: z
        .array(
          z.object({
            model: z.string().min(1, { message: msg('validation.modelRequired', 'Model tujuan wajib diisi') }),
            res_id: z
              .number()
              .int()
              .positive({ message: msg('validation.resIdRequired', 'ID record harus berupa angka positif') })
          })
        )
        .optional()
        .default([])
    })
    .superRefine((data, ctx) => {
      // Reject reason is mandatory; approve / start review / request revision notes stay optional.
      if (data.action === 'reject' && !data.notes?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: msg('validation.rejectNotesRequired', 'Alasan penolakan wajib diisi'),
          path: ['notes']
        })
      }
    })
}

export const submissionReviewSchema = getSubmissionReviewSchema()

export type SubmissionReviewValues = z.infer<typeof submissionReviewSchema>
