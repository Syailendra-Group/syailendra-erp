'use client'

import { MapPin, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { useVillage, VillageProvider } from '@/contexts/others/village.context'

import { VillagesDialogs } from './dialogs'
import { VillagesTable } from './table'

import type { ReactElement } from 'react'

function VillagesPrimaryButtons(): ReactElement {
  const { setOpen, setCurrentRow } = useVillage()
  return (
    <Button
      onClick={() => {
        setCurrentRow(null)
        setOpen('create')
      }}
      className="gap-2 font-semibold"
    >
      <Plus className="size-4" />
      <span>Tambah Kelurahan</span>
    </Button>
  )
}

function VillagesContent(): ReactElement {
  const t = useTranslations('regional.villages')
  const { setOpen, setCurrentRow } = useVillage()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} icon={MapPin} actions={<VillagesPrimaryButtons />} />
      <VillagesTable
        onArchive={(item) => {
          setCurrentRow(item)
          setOpen('delete')
        }}
      />
      <VillagesDialogs />
    </div>
  )
}

export function VillagesFeature(): ReactElement {
  return (
    <VillageProvider>
      <VillagesContent />
    </VillageProvider>
  )
}
