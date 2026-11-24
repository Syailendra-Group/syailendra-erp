'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'

import type { SupplierRecord } from '@/types/scm/supplier'
import type { ReactElement, ReactNode } from 'react'

export type SupplierDialogType = 'none' | 'add' | 'edit' | 'archive' | 'restore' | 'pin'

interface SupplierContextValue {
  open: SupplierDialogType | null
  setOpen: (type: SupplierDialogType | null) => void
  selectedSupplier: SupplierRecord | null
  setSelectedSupplier: (supplier: SupplierRecord | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  handleCreate: () => void
  handleEdit: (supplier: SupplierRecord) => void
  handleView: (supplier: SupplierRecord) => void
  handleDelete: (supplier: SupplierRecord) => void
  handleToggleStatus: (supplier: SupplierRecord) => void
  handleIssuePin: (supplier: SupplierRecord) => void
}

const SupplierContext = createContext<SupplierContextValue | null>(null)

export function SupplierProvider({ children }: { children: ReactNode }): ReactElement {
  const router = useRouter()
  const [open, setOpen] = useState<SupplierDialogType | null>('none')
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = useCallback(() => {
    router.push('/scm/suppliers/create')
  }, [router])

  const handleEdit = useCallback(
    (supplier: SupplierRecord) => {
      router.push(`/scm/suppliers/${supplier.id}/edit`)
    },
    [router]
  )

  const handleView = useCallback(
    (supplier: SupplierRecord) => {
      router.push(`/scm/suppliers/${supplier.id}`)
    },
    [router]
  )

  const handleDelete = useCallback((supplier: SupplierRecord) => {
    setSelectedSupplier(supplier)
    setOpen('archive')
  }, [])

  const handleToggleStatus = useCallback((supplier: SupplierRecord) => {
    setSelectedSupplier(supplier)
    setOpen(supplier.active ? 'archive' : 'restore')
  }, [])

  const handleIssuePin = useCallback((supplier: SupplierRecord) => {
    setSelectedSupplier(supplier)
    setOpen('pin')
  }, [])

  const value: SupplierContextValue = {
    open,
    setOpen,
    selectedSupplier,
    setSelectedSupplier,
    isLoading,
    setIsLoading,
    handleCreate,
    handleEdit,
    handleView,
    handleDelete,
    handleToggleStatus,
    handleIssuePin
  }

  return <SupplierContext.Provider value={value}>{children}</SupplierContext.Provider>
}

export function useSupplierContext(): SupplierContextValue {
  const context = useContext(SupplierContext)
  if (!context) {
    throw new Error('useSupplierContext must be used within a SupplierProvider')
  }
  return context
}

export type SupplierContextType = SupplierContextValue
