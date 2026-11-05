/**
 * material.context.tsx — Context state management for Material Master dialogs
 * Syailendra Group ERP — SCM Pillar
 */

'use client'

import { createContext, useContext, useState } from 'react'

import type { MaterialRecord } from '@/types/scm/material'
import type { PropsWithChildren, ReactElement } from 'react'

export type MaterialDialogType = 'view' | 'delete' | null

export interface MaterialContextType {
  open: MaterialDialogType
  setOpen: (type: MaterialDialogType) => void
  currentRow: MaterialRecord | null
  setCurrentRow: (item: MaterialRecord | null) => void
}

const MaterialContext = createContext<MaterialContextType | null>(null)

export function MaterialProvider({ children }: PropsWithChildren): ReactElement {
  const [open, setOpen] = useState<MaterialDialogType>(null)
  const [currentRow, setCurrentRow] = useState<MaterialRecord | null>(null)

  return (
    <MaterialContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow
      }}
    >
      {children}
    </MaterialContext.Provider>
  )
}

export function useMaterial(): MaterialContextType {
  const context = useContext(MaterialContext)
  if (!context) {
    throw new Error('useMaterial must be used within a MaterialProvider')
  }
  return context
}
