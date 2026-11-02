'use client'

import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { Textarea } from '@/components/ui/textarea'

import type { FarmerFormValues } from '@/schemas/traceability/farmer-schema'
import type { ReactElement } from 'react'
import type { UseFormRegister } from 'react-hook-form'

export interface NotesSectionProps {
  register: UseFormRegister<FarmerFormValues>
  isPending: boolean
}

export function NotesSection({ register, isPending }: NotesSectionProps): ReactElement {
  const tTrace = useTranslations('traceability.farmers')

  return (
    <SectionCard title={tTrace('sections.notes')} description={tTrace('sections.notesDesc')}>
      <FormFieldWrapper id="comment" label={tTrace('fields.comment')}>
        <Textarea
          id="comment"
          rows={3}
          placeholder={tTrace('fields.commentPlaceholder')}
          disabled={isPending}
          className="resize-none"
          {...register('comment')}
        />
      </FormFieldWrapper>
    </SectionCard>
  )
}
