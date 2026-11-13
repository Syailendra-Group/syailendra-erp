'use client'

import { Mail, MessageSquare, Phone, User } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { DetailRow } from '@/components/shared/detail-row'
import { CopyableText, LinkText } from '@/components/text'

import type { FarmerRecord } from '@/types/scm/farmer'
import type { ReactElement } from 'react'

export interface ProfileCardProps {
  farmer: FarmerRecord
}

export function ProfileCard({ farmer }: ProfileCardProps): ReactElement {
  const tTrace = useTranslations('scm.farmers')

  const phoneStr = (farmer.phone as string) || ''
  const cleanPhone = phoneStr.replace(/[^0-9]/g, '')
  const waUrl = cleanPhone.startsWith('0') ? `https://wa.me/62${cleanPhone.slice(1)}` : `https://wa.me/${cleanPhone}`

  return (
    <SectionCard title={tTrace('detail.profileTitle')} description={tTrace('sections.identityDesc')} icon={User} contentClassName="space-y-2.5">
      <DetailRow label={tTrace('fields.ref')}>
        {farmer.ref ? <CopyableText text={farmer.ref} variant="badge" className="text-primary font-semibold" /> : '-'}
      </DetailRow>
      <DetailRow label={tTrace('fields.name')} value={farmer.name} valueClassName="font-semibold" />
      <DetailRow label={tTrace('fields.vat')}>{farmer.vat ? <CopyableText text={farmer.vat} /> : '-'}</DetailRow>
      {farmer.legacy_code && (
        <DetailRow label={tTrace('fields.legacyCode')}>
          <CopyableText text={farmer.legacy_code} />
        </DetailRow>
      )}
      <DetailRow label={tTrace('fields.phone')}>
        <div className="flex items-center gap-2">
          {farmer.phone ? (
            <LinkText href={`tel:${cleanPhone}`} icon={Phone} mono>
              {farmer.phone}
            </LinkText>
          ) : (
            <span>-</span>
          )}
          {cleanPhone && (
            <LinkText href={waUrl} external icon={MessageSquare} className="text-primary font-medium underline">
              WhatsApp
            </LinkText>
          )}
        </div>
      </DetailRow>
      <DetailRow label={tTrace('fields.email')} border={false}>
        {farmer.email ? (
          <LinkText href={`mailto:${farmer.email}`} icon={Mail} className="text-primary">
            {farmer.email}
          </LinkText>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </DetailRow>
    </SectionCard>
  )
}
