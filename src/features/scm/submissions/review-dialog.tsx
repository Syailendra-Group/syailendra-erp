/**
 * review-dialog.tsx — Staff review dialog for Partner Submission
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { useCallback } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { StatusBadge } from '@/components/shared/data-badge'
import { DetailRow } from '@/components/shared/detail-row'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { submissionReviewSchema } from '@/schemas/scm/submission-schema'

import { useReviewSubmission } from './use-submissions'

import type { SubmissionReviewValues } from '@/schemas/scm/submission-schema'
import type { ReviewActionType, SubmissionRecord } from '@/types/scm/submission'
import type { ReactElement } from 'react'
import type { Resolver } from 'react-hook-form'

interface SubmissionReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  submission: SubmissionRecord | null
}

const REVIEW_MODES: { key: ReviewActionType; labelKey: string; notesLabelKey: string }[] = [
  { key: 'start_review', labelKey: 'dialog.actions.startReview', notesLabelKey: 'dialog.labels.notes' },
  { key: 'request_revision', labelKey: 'dialog.actions.requestRevision', notesLabelKey: 'dialog.labels.notes' },
  { key: 'reject', labelKey: 'dialog.actions.reject', notesLabelKey: 'dialog.labels.rejectNotes' },
  { key: 'approve', labelKey: 'dialog.actions.approve', notesLabelKey: 'dialog.labels.notes' }
]

export function SubmissionReviewDialog({ open, onOpenChange, submission }: SubmissionReviewDialogProps): ReactElement {
  const t = useTranslations('scm.submissions')
  const tCommon = useTranslations('common')

  const reviewMutation = useReviewSubmission()

  const form = useForm<SubmissionReviewValues>({
    resolver: zodResolver(submissionReviewSchema) as Resolver<SubmissionReviewValues, unknown, SubmissionReviewValues>,
    defaultValues: { action: 'start_review', notes: '', links: [] },
    mode: 'onChange'
  })

  const { control, reset, setValue, formState } = form
  const { isValid } = formState

  const action = form.watch('action') as ReviewActionType
  const selectedMode = REVIEW_MODES.find((mode) => mode.key === action) ?? REVIEW_MODES[0]
  const isReject = action === 'reject'
  const isApprove = action === 'approve'

  const isPending = reviewMutation.isPending
  const submitDisabled = !isValid || !submission

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        reset({ action: 'start_review', notes: '', links: [] })
      }
      onOpenChange(next)
    },
    [onOpenChange, reset]
  )

  const handleSubmit = async (values: SubmissionReviewValues) => {
    if (!submission) return

    const result = await reviewMutation.mutateAsync({
      id: submission.id,
      action: values.action,
      notes: values.notes?.trim() || undefined,
      links: values.links?.length > 0 ? values.links : undefined
    })

    if (result.success) {
      toast.success(t('toast.reviewSuccess'))
      handleOpenChange(false)
    } else {
      toast.error(result.error ?? t('toast.reviewError'))
    }
  }

  const stateVariants = {
    draft: 'neutral',
    submitted: 'info',
    in_review: 'warning',
    needs_revision: 'warning',
    approved: 'success',
    rejected: 'destructive',
    cancelled: 'neutral'
  } as const
  const stateVariant = stateVariants[submission?.state ?? 'draft']

  return (
    <ActionDialog
      open={open}
      onOpenChange={handleOpenChange}
      formId="submission-review-form"
      isPending={isPending}
      submitDisabled={submitDisabled}
      submitLabel={t(selectedMode.labelKey)}
      cancelLabel={tCommon('actions.close')}
      maxWidth="sm:max-w-lg"
      title={t('dialog.title')}
    >
      <form id="submission-review-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        {submission && (
          <>
            <div className="border-border/40 bg-muted/50 rounded-md border p-3">
              <DetailRow label={t('dialog.fields.referenceNo')} value={submission.name} mono />
              <DetailRow label={t('dialog.fields.partner')} value={submission.partnerName || '—'} />
              <DetailRow label={t('dialog.fields.kind')} value={t(`table.kinds.${submission.kind}`)} />
              <DetailRow
                label={t('dialog.fields.state')}
                value={<StatusBadge variant={stateVariant}>{t(`table.states.${submission.state}`)}</StatusBadge>}
                border={false}
              />
              <DetailRow label={t('dialog.fields.submittedAt')} value={submission.submittedAt || '—'} />
              <DetailRow label={t('dialog.fields.applicantName')} value={submission.applicantName || '—'} />
              <DetailRow label={t('dialog.fields.applicantPhone')} value={submission.applicantPhone || '—'} />
              <DetailRow label={t('dialog.fields.revision')} value={String(submission.revision)} />
              {submission.reviewedByName && <DetailRow label={t('dialog.fields.reviewedBy')} value={submission.reviewedByName} />}
              {submission.reviewedAt && <DetailRow label={t('dialog.fields.reviewedAt')} value={submission.reviewedAt} />}
              {submission.reviewNotes && <DetailRow label={t('dialog.fields.reviewNotes')} value={submission.reviewNotes} border={false} />}
            </div>

            <div className="flex flex-wrap gap-2">
              {REVIEW_MODES.map((mode) => (
                <Button
                  key={mode.key}
                  type="button"
                  variant={action === mode.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setValue('action', mode.key)}
                >
                  {t(mode.labelKey)}
                </Button>
              ))}
            </div>

            <FormField
              control={control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t(selectedMode.notesLabelKey)}
                    {isReject ? ' *' : ''}
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder={t('dialog.placeholders.notes')} className="h-24" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isApprove && (
              <Controller
                control={control}
                name="links"
                render={({ field }) => {
                  const links = ((field.value as { model: string; res_id: number }[]) ?? []).map((link) => `${link.model}:${link.res_id}`)
                  return (
                    <FormItem>
                      <FormLabel>{t('dialog.labels.links')}</FormLabel>
                      <FormControl>
                        <Input
                          value={links.join(', ')}
                          onChange={(event) => {
                            const raw = event.target.value
                              .split(',')
                              .map((pair) => pair.trim())
                              .filter(Boolean)
                            field.onChange(
                              raw.map((pair) => {
                                const [model, resId] = pair.split(':')
                                return { model, res_id: Number(resId) }
                              })
                            )
                          }}
                          placeholder="model:id, model:id"
                          className="text-xs"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-muted-foreground text-xs">{t('dialog.hints.links')}</p>
                    </FormItem>
                  )
                }}
              />
            )}
          </>
        )}
      </form>
    </ActionDialog>
  )
}
