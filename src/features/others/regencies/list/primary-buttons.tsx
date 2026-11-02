'use client'

import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { LinkButton } from '@/components/button/link-button'

import type { ReactElement } from 'react'

export function RegenciesPrimaryButtons(): ReactElement {
  const t = useTranslations('regional.regencies')

  return (
    <div className="flex items-center gap-2">
      <LinkButton href="/others/regencies/create" icon={Plus} label={t('primaryAction')} />
    </div>
  )
}
