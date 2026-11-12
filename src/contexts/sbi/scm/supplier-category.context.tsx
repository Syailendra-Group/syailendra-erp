'use client'

import { createContext, useCallback, useContext, useState } from 'react'

import type { SupplierCategoryRecord } from '@/types/sbi/scm/supplier-category'
import type { ReactElement, ReactNode } from 'react'

export type SupplierCategoryDialogType = 'create' | 'edit' | 'view' | 'delete' | null

export interface SupplierCategoryContextType {
  open: SupplierCategoryDialogType
  setOpen: (type: SupplierCategoryDialogType) => void
  selectedCategory: SupplierCategoryRecord | null
  setSelectedCategory: (category: SupplierCategoryRecord | null) => void
  handleCreate: () => void
  handleEdit: (category: SupplierCategoryRecord) => void
  handleView: (category: SupplierCategoryRecord) => void
  handleDelete: (category: SupplierCategoryRecord) => void
}

const SupplierCategoryContext = createContext<SupplierCategoryContextType | null>(null)

export function SupplierCategoryProvider({ children }: { children: ReactNode }): ReactElement {
  const [open, setOpen] = useState<SupplierCategoryDialogType>(null)
  const [selectedCategory, setSelectedCategory] = useState<SupplierCategoryRecord | null>(null)

  const handleCreate = useCallback(() => {
    setSelectedCategory(null)
    setOpen('create')
  }, [])

  const handleEdit = useCallback((category: SupplierCategoryRecord) => {
    setSelectedCategory(category)
    setOpen('edit')
  }, [])

  const handleView = useCallback((category: SupplierCategoryRecord) => {
    setSelectedCategory(category)
    setOpen('view')
  }, [])

  const handleDelete = useCallback((category: SupplierCategoryRecord) => {
    setSelectedCategory(category)
    setOpen('delete')
  }, [])

  return (
    <SupplierCategoryContext.Provider
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
    </SupplierCategoryContext.Provider>
  )
}

export function useSupplierCategoryContext(): SupplierCategoryContextType {
  const context = useContext(SupplierCategoryContext)
  if (!context) {
    throw new Error('useSupplierCategoryContext must be used within a SupplierCategoryProvider')
  }
  return context
}

export const useSupplierCategories = useSupplierCategoryContext
