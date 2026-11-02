'use client'

import { MessageSquare, User } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { DetailRow } from '@/components/shared/detail-row'
import { LongText } from '@/components/text/long-text'

import type { FarmerRecord } from '@/actions/traceability/farmer.action'
import type { ReactElement } from 'react'

export interface ProfileCardProps {
  farmer: FarmerRecord
}

export function ProfileCard({ farmer }: ProfileCardProps): ReactElement {
  const tTrace = useTranslations('traceability.farmers')

  const phoneStr = (farmer.phone as string) || ''
  const cleanPhone = phoneStr.replace(/[^0-9]/g, '')
  const waUrl = cleanPhone.startsWith('0') ? `https://wa.me/62${cleanPhone.slice(1)}` : `https://wa.me/${cleanPhone}`

  return (
    <SectionCard title={tTrace('detail.profileTitle')} description={tTrace('sections.identityDesc')} icon={User} contentClassName="space-y-2.5">
      <DetailRow label={tTrace('fields.ref')} value={farmer.ref} mono={true} />
      <DetailRow label={tTrace('fields.name')} value={farmer.name} valueClassName="font-semibold" />
      <DetailRow label={tTrace('fields.vat')} value={farmer.vat || '-'} mono={true} />
      <DetailRow label={tTrace('fields.phone')}>
        <div className="flex items-center gap-2">
          <span className="font-mono">{farmer.phone || '-'}</span>
          {phoneStr && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1 font-medium underline"
            >
              <MessageSquare className="size-3" />
              <span>WhatsApp</span>
            </a>
          )}
        </div>
      </DetailRow>
      <DetailRow label={tTrace('fields.street')} border={false}>
        <LongText>
          {farmer.street}, {farmer.city}
        </LongText>
      </DetailRow>
    </SectionCard>
  )
}
