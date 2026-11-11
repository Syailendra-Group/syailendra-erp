'use client'

import { ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'

import type { FarmerRecord } from '@/types/scm/farmer'
import type { ReactElement } from 'react'

export interface NotesCardProps {
  farmer: FarmerRecord
}

export function NotesCard({ farmer }: NotesCardProps): ReactElement {
  const tTrace = useTranslations('scm.farmers')
  const commentText = typeof farmer.comment === 'string' ? farmer.comment.trim() : ''

  return (
    <SectionCard title={tTrace('detail.notesTitle')} description={tTrace('sections.notesDesc')} icon={ShieldCheck} contentClassName="text-sm">
      <div className="rounded-md border border-border/40 bg-muted/20 p-3">
        <p className="text-foreground/90 whitespace-pre-wrap text-xs leading-relaxed">
          {commentText || tTrace('detail.noNotes')}
        </p>
      </div>
    </SectionCard>
  )
}
