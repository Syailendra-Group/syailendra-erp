'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'

import type { MaterialRecord } from '@/types/scm/material'
import type { PropsWithChildren, ReactElement } from 'react'

export type MaterialDialogType = 'view' | 'delete' | null

export interface MaterialContextType {
  open: MaterialDialogType
  setOpen: (type: MaterialDialogType) => void
  currentRow: MaterialRecord | null
  setCurrentRow: (item: MaterialRecord | null) => void
  handleCreate: () => void
  handleEdit: (item: MaterialRecord) => void
  handleView: (item: MaterialRecord) => void
  handleDelete: (item: MaterialRecord) => void
}

const MaterialContext = createContext<MaterialContextType | null>(null)

export function MaterialProvider({ children }: PropsWithChildren): ReactElement {
  const router = useRouter()
  const [open, setOpen] = useState<MaterialDialogType>(null)
  const [currentRow, setCurrentRow] = useState<MaterialRecord | null>(null)

  const handleCreate = useCallback(() => {
    router.push('/scm/materials/create')
  }, [router])

  const handleEdit = useCallback(
    (item: MaterialRecord) => {
      router.push(`/scm/materials/${item.id}/edit`)
    },
    [router]
  )

  const handleView = useCallback((item: MaterialRecord) => {
    setCurrentRow(item)
    setOpen('view')
  }, [])

  const handleDelete = useCallback((item: MaterialRecord) => {
    setCurrentRow(item)
    setOpen('delete')
  }, [])

  return (
    <MaterialContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        handleCreate,
        handleEdit,
        handleView,
        handleDelete
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

export const useMaterials = useMaterial
