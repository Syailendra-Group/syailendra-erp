'use client'

import { createContext, useContext, useState } from 'react'

import type { DistrictRecord } from '@/types/others/district'
import type { ReactElement, ReactNode } from 'react'

export type DistrictDialogType = 'add' | 'edit' | 'archive' | 'view' | null

export interface DistrictContextType {
  open: DistrictDialogType
  setOpen: (type: DistrictDialogType) => void
  currentRow: DistrictRecord | null
  setCurrentRow: (row: DistrictRecord | null) => void
  refreshData?: () => void
}

const DistrictContext = createContext<DistrictContextType | null>(null)

export interface DistrictProviderProps {
  children: ReactNode
  refreshData?: () => void
}

export function DistrictProvider({ children, refreshData }: DistrictProviderProps): ReactElement {
  const [open, setOpen] = useState<DistrictDialogType>(null)
  const [currentRow, setCurrentRow] = useState<DistrictRecord | null>(null)

  return (
    <DistrictContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        refreshData
      }}
    >
      {children}
    </DistrictContext.Provider>
  )
}

export function useDistrict(): DistrictContextType {
  const ctx = useContext(DistrictContext)
  if (!ctx) {
    throw new Error('useDistrict must be used within a DistrictProvider')
  }
  return ctx
}
