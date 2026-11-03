'use client'

import { createContext, useContext, useState } from 'react'

import type { ProvinceRecord } from '@/types/others/province'
import type { ReactElement, ReactNode } from 'react'

export type ProvinceDialogType = 'create' | 'add' | 'edit' | 'view' | 'delete' | null

export interface ProvinceContextType {
  open: ProvinceDialogType
  setOpen: (type: ProvinceDialogType) => void
  currentRow: ProvinceRecord | null
  setCurrentRow: (row: ProvinceRecord | null) => void
  refreshData?: () => void
}

const ProvinceContext = createContext<ProvinceContextType | null>(null)

export interface ProvinceProviderProps {
  children: ReactNode
  refreshData?: () => void
}

export function ProvinceProvider({ children, refreshData }: ProvinceProviderProps): ReactElement {
  const [open, setOpen] = useState<ProvinceDialogType>(null)
  const [currentRow, setCurrentRow] = useState<ProvinceRecord | null>(null)

  return (
    <ProvinceContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        refreshData
      }}
    >
      {children}
    </ProvinceContext.Provider>
  )
}

export function useProvince(): ProvinceContextType {
  const ctx = useContext(ProvinceContext)
  if (!ctx) {
    throw new Error('useProvince must be used within a ProvinceProvider')
  }
  return ctx
}
