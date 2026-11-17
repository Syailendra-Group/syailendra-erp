'use client'

import { createContext, useCallback, useContext, useState } from 'react'

import type { SupplierTypeRecord } from '@/types/scm/supplier-type'
import type { ReactElement, ReactNode } from 'react'

export type SupplierTypeDialogType = 'create' | 'edit' | 'view' | 'delete' | null

export interface SupplierTypeContextType {
  open: SupplierTypeDialogType
  setOpen: (type: SupplierTypeDialogType) => void
  selectedCategory: SupplierTypeRecord | null
  setSelectedCategory: (category: SupplierTypeRecord | null) => void
  handleCreate: () => void
  handleEdit: (category: SupplierTypeRecord) => void
  handleView: (category: SupplierTypeRecord) => void
  handleDelete: (category: SupplierTypeRecord) => void
}

const SupplierTypeContext = createContext<SupplierTypeContextType | null>(null)

export function SupplierTypeProvider({ children }: { children: ReactNode }): ReactElement {
  const [open, setOpen] = useState<SupplierTypeDialogType>(null)
  const [selectedCategory, setSelectedCategory] = useState<SupplierTypeRecord | null>(null)

  const handleCreate = useCallback(() => {
    setSelectedCategory(null)
    setOpen('create')
  }, [])

  const handleEdit = useCallback((category: SupplierTypeRecord) => {
    setSelectedCategory(category)
    setOpen('edit')
  }, [])

  const handleView = useCallback((category: SupplierTypeRecord) => {
    setSelectedCategory(category)
    setOpen('view')
  }, [])

  const handleDelete = useCallback((category: SupplierTypeRecord) => {
    setSelectedCategory(category)
    setOpen('delete')
  }, [])

  return (
    <SupplierTypeContext.Provider
      value={{
        open,
        setOpen,
        selectedCategory,
        setSelectedCategory,
        handleCreate,
        handleEdit,
        handleView,
        handleDelete
      }}
    >
      {children}
    </SupplierTypeContext.Provider>
  )
}

export function useSupplierTypeContext(): SupplierTypeContextType {
  const context = useContext(SupplierTypeContext)
  if (!context) {
    throw new Error('useSupplierTypeContext must be used within a SupplierTypeProvider')
  }
  return context
}

export const useSupplierTypes = useSupplierTypeContext
