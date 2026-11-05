/**
 * supplier-category.context.tsx — Context provider for Supplier Category UI state
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import React, { createContext, useContext, useState } from 'react'

import type { SupplierCategoryRecord } from '@/types/scm/supplier-category'
import type { ReactNode } from 'react'

export type SupplierCategoryDialogType = 'create' | 'edit' | 'view' | 'delete' | null

interface SupplierCategoryContextType {
  open: SupplierCategoryDialogType
  setOpen: (type: SupplierCategoryDialogType) => void
  selectedCategory: SupplierCategoryRecord | null
  setSelectedCategory: (category: SupplierCategoryRecord | null) => void
}

const SupplierCategoryContext = createContext<SupplierCategoryContextType | null>(null)

export function SupplierCategoryProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<SupplierCategoryDialogType>(null)
  const [selectedCategory, setSelectedCategory] = useState<SupplierCategoryRecord | null>(null)

  return (
    <SupplierCategoryContext.Provider
      value={{
        open,
        setOpen,
        selectedCategory,
        setSelectedCategory
      }}
    >
      {children}
    </SupplierCategoryContext.Provider>
  )
}

export function useSupplierCategoryContext() {
  const context = useContext(SupplierCategoryContext)
  if (!context) {
    throw new Error('useSupplierCategoryContext must be used within a SupplierCategoryProvider')
  }
  return context
}
