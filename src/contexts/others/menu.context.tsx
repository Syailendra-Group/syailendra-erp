'use client'

import { createContext, useCallback, useContext, useState } from 'react'

import type { PillarRecord } from '@/types/others/menu'
import type { ReactElement, ReactNode } from 'react'

export type MenuDialogType = 'view' | 'edit' | null

interface MenuContextValue {
  open: MenuDialogType
  setOpen: (open: MenuDialogType) => void
  currentRow: PillarRecord | null
  setCurrentRow: (row: PillarRecord | null) => void
  handleView: (row: PillarRecord) => void
  handleEdit: (row: PillarRecord) => void
}

const MenuContext = createContext<MenuContextValue | undefined>(undefined)

export function MenuProvider({ children }: { children: ReactNode }): ReactElement {
  const [open, setOpen] = useState<MenuDialogType>(null)
  const [currentRow, setCurrentRow] = useState<PillarRecord | null>(null)

  const handleView = useCallback((row: PillarRecord) => {
    setCurrentRow(row)
    setOpen('view')
  }, [])

  const handleEdit = useCallback((row: PillarRecord) => {
    setCurrentRow(row)
    setOpen('edit')
  }, [])

  return (
    <MenuContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        handleView,
        handleEdit
      }}
    >
      {children}
    </MenuContext.Provider>
  )
}

export function useMenu(): MenuContextValue {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider')
  }
  return context
}
