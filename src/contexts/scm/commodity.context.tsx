/**
 * commodity.context.tsx — Dialog state provider for Commodity Master
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { createContext, useCallback, useContext, useState } from 'react'

import type { CommodityRecord } from '@/types/scm/commodity'
import type { ReactElement, ReactNode } from 'react'

export type CommodityDialogType = 'create' | 'edit' | 'view' | 'delete' | null

export interface CommodityContextType {
  open: CommodityDialogType
  setOpen: (type: CommodityDialogType) => void
  selectedCommodity: CommodityRecord | null
  setSelectedCommodity: (commodity: CommodityRecord | null) => void
  handleCreate: () => void
  handleEdit: (commodity: CommodityRecord) => void
  handleView: (commodity: CommodityRecord) => void
  handleDelete: (commodity: CommodityRecord) => void
}

const CommodityContext = createContext<CommodityContextType | null>(null)

export function CommodityProvider({ children }: { children: ReactNode }): ReactElement {
  const [open, setOpen] = useState<CommodityDialogType>(null)
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityRecord | null>(null)

  const handleCreate = useCallback(() => {
    setSelectedCommodity(null)
    setOpen('create')
  }, [])

  const handleEdit = useCallback((commodity: CommodityRecord) => {
    setSelectedCommodity(commodity)
    setOpen('edit')
  }, [])

  const handleView = useCallback((commodity: CommodityRecord) => {
    setSelectedCommodity(commodity)
    setOpen('view')
  }, [])

  const handleDelete = useCallback((commodity: CommodityRecord) => {
    setSelectedCommodity(commodity)
    setOpen('delete')
  }, [])

  return (
    <CommodityContext.Provider value={{ open, setOpen, selectedCommodity, setSelectedCommodity, handleCreate, handleEdit, handleView, handleDelete }}>
      {children}
    </CommodityContext.Provider>
  )
}

export function useCommodityContext(): CommodityContextType {
  const context = useContext(CommodityContext)
  if (!context) {
    throw new Error('useCommodityContext must be used within a CommodityProvider')
  }
  return context
}
