'use client'

import { useProvince } from '@/contexts/others/province.context'

import { ProvinceActionDialog } from './dialogs/province-action-dialog'

import type { ReactElement } from 'react'

export function ProvincesDialogs(): ReactElement {
  const { open, setOpen, currentRow } = useProvince()

  const isFormOpen = open === 'add' || open === 'edit'

  return (
    <>
      <ProvinceActionDialog
        open={isFormOpen}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
        currentRow={currentRow}
      />
    </>
  )
}
