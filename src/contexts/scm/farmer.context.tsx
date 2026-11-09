'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'

import type { FarmerRecord } from '@/types/scm/farmer'
import type { ReactElement, ReactNode } from 'react'

export type FarmersDialogType = 'add' | 'edit' | 'archive' | 'view' | null

export interface FarmersContextType {
  open: FarmersDialogType
  setOpen: (type: FarmersDialogType) => void
  currentRow: FarmerRecord | null
  setCurrentRow: (row: FarmerRecord | null) => void
  refreshData?: () => void
  handleCreate: () => void
  handleEdit: (row: FarmerRecord) => void
  handleView: (row: FarmerRecord) => void
  handleDelete: (row: FarmerRecord) => void
}

const FarmersContext = createContext<FarmersContextType | null>(null)

export interface FarmersProviderProps {
  children: ReactNode
  refreshData?: () => void
}

export function FarmersProvider({ children, refreshData }: FarmersProviderProps): ReactElement {
  const router = useRouter()
  const [open, setOpen] = useState<FarmersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<FarmerRecord | null>(null)

  const handleCreate = useCallback(() => {
    router.push('/scm/farmers/create')
  }, [router])

  const handleEdit = useCallback(
    (row: FarmerRecord) => {
      router.push(`/scm/farmers/${row.id}/edit`)
    },
    [router]
  )

  const handleView = useCallback(
    (row: FarmerRecord) => {
      router.push(`/scm/farmers/${row.id}`)
    },
    [router]
  )

  const handleDelete = useCallback((row: FarmerRecord) => {
    setCurrentRow(row)
    setOpen('archive')
  }, [])

  return (
    <FarmersContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        refreshData,
        handleCreate,
        handleEdit,
        handleView,
        handleDelete
      }}
    >
      {children}
    </FarmersContext.Provider>
  )
}

export function useFarmers(): FarmersContextType {
  const ctx = useContext(FarmersContext)
  if (!ctx) {
    throw new Error('useFarmers must be used within a FarmersProvider')
  }
  return ctx
}
