'use client'

import { createContext, useContext, useState } from 'react'

import type { DistillerRecord } from '@/actions/scm/distiller.action'
import type { ReactElement, ReactNode } from 'react'

export type DistillersDialogType = 'add' | 'edit' | 'archive' | 'view' | null

export interface DistillersContextType {
  open: DistillersDialogType
  setOpen: (type: DistillersDialogType) => void
  currentRow: DistillerRecord | null
  setCurrentRow: (row: DistillerRecord | null) => void
  refreshData?: () => void
}

const DistillersContext = createContext<DistillersContextType | null>(null)

export interface DistillersProviderProps {
  children: ReactNode
  refreshData?: () => void
}

export function DistillersProvider({ children, refreshData = () => {} }: DistillersProviderProps): ReactElement {
  const [open, setOpen] = useState<DistillersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<DistillerRecord | null>(null)

  return (
    <DistillersContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        refreshData
      }}
    >
      {children}
    </DistillersContext.Provider>
  )
}

export function useDistillers(): DistillersContextType {
  const ctx = useContext(DistillersContext)
  if (!ctx) {
    throw new Error('useDistillers must be used within a DistillersProvider')
  }
  return ctx
}
