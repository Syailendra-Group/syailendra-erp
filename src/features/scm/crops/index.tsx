'use client'

import { Sprout } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PrimaryAction } from '@/components/button/primary-action'
import { SectionCard } from '@/components/card/section-card'
import { PageHeader } from '@/components/shared/page-header'
import { CropProvider, useCropContext } from '@/contexts/scm/crop.context'

import { CropDialogs } from './dialogs'
import { CropsTable } from './table'

import type { ReactElement } from 'react'

function CropContent(): ReactElement {
  const t = useTranslations('scm.crops')
  const { handleCreate } = useCropContext()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={Sprout}
        actions={<PrimaryAction onClick={handleCreate} label={t('actions.create')} />}
      />

      <SectionCard>
        <CropsTable />
      </SectionCard>

      <CropDialogs />
    </div>
  )
}

export function CropsFeature(): ReactElement {
  return (
    <CropProvider>
      <CropContent />
    </CropProvider>
  )
}
