'use client'

import { ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/shared/section-card'
import { LongText } from '@/components/text/long-text'

import type { ReactElement } from 'react'
import type { FarmerRecord } from '../actions'

export interface NotesCardProps {
  farmer: FarmerRecord
}

export function NotesCard({ farmer }: NotesCardProps): ReactElement {
  const tTrace = useTranslations('traceability.farmers')

  return (
    <SectionCard title={tTrace('detail.notesTitle')} description={tTrace('sections.notesDesc')} icon={ShieldCheck} contentClassName="text-sm">
      <LongText contentClassName="text-xs max-w-sm">
        {(farmer.comment as string) || 'Belum ada catatan khusus agronomi lapangan untuk mitra ini.'}
      </LongText>
    </SectionCard>
  )
}
