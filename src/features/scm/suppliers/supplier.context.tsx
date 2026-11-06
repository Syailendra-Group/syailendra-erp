/**
 * supplier.context.tsx — Context provider for Supplier UI modal & row state
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import React, { createContext, useContext, useState } from 'react'

import type { SupplierRecord } from '@/types/scm/supplier'
import type { ReactNode } from 'react'

export type SupplierDialogType = 'view' | 'archive' | 'restore' | 'delete' | null

interface SupplierContextType {
  open: SupplierDialogType
  setOpen: (type: SupplierDialogType) => void
  selectedSupplier: SupplierRecord | null
  setSelectedSupplier: (supplier: SupplierRecord | null) => void
}

const SupplierContext = createContext<SupplierContextType | null>(null)

export function SupplierProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<SupplierDialogType>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierRecord | null>(null)

  return (
    <SupplierContext.Provider
      value={{
        open,
        setOpen,
        selectedSupplier,
        setSelectedSupplier
      }}
    >
      {children}
    </SupplierContext.Provider>
  )
}

export function useSupplierContext() {
  const context = useContext(SupplierContext)
  if (!context) {
    throw new Error('useSupplierContext must be used within a SupplierProvider')
  }
  return context
}
