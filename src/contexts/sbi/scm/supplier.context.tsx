'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'

import type { SupplierRecord } from '@/types/sbi/scm/supplier'
import type { ReactElement, ReactNode } from 'react'

export type SupplierDialogType = 'view' | 'archive' | 'restore' | 'delete' | null

export interface SupplierContextType {
  open: SupplierDialogType
  setOpen: (type: SupplierDialogType) => void
  selectedSupplier: SupplierRecord | null
  setSelectedSupplier: (supplier: SupplierRecord | null) => void
  handleCreate: () => void
  handleEdit: (supplier: SupplierRecord) => void
  handleView: (supplier: SupplierRecord) => void
  handleDelete: (supplier: SupplierRecord) => void
  handleToggleStatus: (supplier: SupplierRecord) => void
}

const SupplierContext = createContext<SupplierContextType | null>(null)

export function SupplierProvider({ children }: { children: ReactNode }): ReactElement {
  const router = useRouter()
  const [open, setOpen] = useState<SupplierDialogType>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierRecord | null>(null)

  const handleCreate = useCallback(() => {
    router.push('/scm/suppliers/create')
  }, [router])

  const handleEdit = useCallback(
    (supplier: SupplierRecord) => {
      router.push(`/scm/suppliers/${supplier.id}/edit`)
    },
    [router]
  )

  const handleView = useCallback((supplier: SupplierRecord) => {
    setSelectedSupplier(supplier)
    setOpen('view')
  }, [])

  const handleDelete = useCallback((supplier: SupplierRecord) => {
    setSelectedSupplier(supplier)
    setOpen('archive')
  }, [])

  const handleToggleStatus = useCallback((supplier: SupplierRecord) => {
    setSelectedSupplier(supplier)
    setOpen(supplier.active ? 'archive' : 'restore')
  }, [])

  return (
    <SupplierContext.Provider
      value={{
        open,
        setOpen,
        selectedSupplier,
        setSelectedSupplier,
        handleCreate,
        handleEdit,
        handleView,
        handleDelete,
        handleToggleStatus
      }}
    >
      {children}
    </SupplierContext.Provider>
  )
}

export function useSupplierContext(): SupplierContextType {
  const context = useContext(SupplierContext)
  if (!context) {
    throw new Error('useSupplierContext must be used within a SupplierProvider')
  }
  return context
}

export const useSuppliers = useSupplierContext
