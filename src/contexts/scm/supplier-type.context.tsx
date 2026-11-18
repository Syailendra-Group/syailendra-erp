/**
 * supplier-type.context.tsx — Feature context for the flat Supplier Type master
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { createContext, useCallback, useContext, useState } from 'react'

import type { SupplierTypeRecord } from '@/types/scm/supplier-type'
import type { ReactElement, ReactNode } from 'react'

export type SupplierTypeDialogType = 'create' | 'edit' | 'view' | 'status' | null

export interface SupplierTypeContextType {
  open: SupplierTypeDialogType
  setOpen: (type: SupplierTypeDialogType) => void
  selectedType: SupplierTypeRecord | null
  setSelectedType: (type: SupplierTypeRecord | null) => void
  handleCreate: () => void
  handleEdit: (type: SupplierTypeRecord) => void
  handleView: (type: SupplierTypeRecord) => void
  handleToggleStatus: (type: SupplierTypeRecord) => void
}

const SupplierTypeContext = createContext<SupplierTypeContextType | null>(null)

export function SupplierTypeProvider({ children }: { children: ReactNode }): ReactElement {
  const [open, setOpen] = useState<SupplierTypeDialogType>(null)
  const [selectedType, setSelectedType] = useState<SupplierTypeRecord | null>(null)

  const handleCreate = useCallback(() => {
    setSelectedType(null)
    setOpen('create')
  }, [])

  const handleEdit = useCallback((type: SupplierTypeRecord) => {
    setSelectedType(type)
    setOpen('edit')
  }, [])

  const handleView = useCallback((type: SupplierTypeRecord) => {
    setSelectedType(type)
    setOpen('view')
  }, [])

  const handleToggleStatus = useCallback((type: SupplierTypeRecord) => {
    setSelectedType(type)
    setOpen('status')
  }, [])

  return (
    <SupplierTypeContext.Provider value={{ open, setOpen, selectedType, setSelectedType, handleCreate, handleEdit, handleView, handleToggleStatus }}>
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
