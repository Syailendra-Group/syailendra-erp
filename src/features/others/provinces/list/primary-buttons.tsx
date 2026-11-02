'use client'

import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { useProvince } from '@/contexts/others/province.context'

import type { ReactElement } from 'react'

export function ProvincesPrimaryButtons(): ReactElement {
  const t = useTranslations('regional.provinces')
  const { setOpen, setCurrentRow } = useProvince()

  const handleAdd = () => {
    setCurrentRow(null)
    setOpen('add')
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleAdd} className="cursor-pointer gap-1.5 text-xs font-semibold">
        <Plus className="size-3.5" />
        <span>{t('primaryAction')}</span>
      </Button>
    </div>
  )
}
