/**
 * crop.context.tsx — Dialog state provider for Crop / Commodity Master
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { createContext, useCallback, useContext, useState } from 'react'

import type { CropRecord } from '@/types/scm/crop'
import type { ReactElement, ReactNode } from 'react'

export type CropDialogType = 'create' | 'edit' | 'view' | 'delete' | null

export interface CropContextType {
  open: CropDialogType
  setOpen: (type: CropDialogType) => void
  selectedCrop: CropRecord | null
  setSelectedCrop: (crop: CropRecord | null) => void
  handleCreate: () => void
  handleEdit: (crop: CropRecord) => void
  handleView: (crop: CropRecord) => void
  handleDelete: (crop: CropRecord) => void
}

const CropContext = createContext<CropContextType | null>(null)

export function CropProvider({ children }: { children: ReactNode }): ReactElement {
  const [open, setOpen] = useState<CropDialogType>(null)
  const [selectedCrop, setSelectedCrop] = useState<CropRecord | null>(null)

  const handleCreate = useCallback(() => {
    setSelectedCrop(null)
    setOpen('create')
  }, [])

  const handleEdit = useCallback((crop: CropRecord) => {
    setSelectedCrop(crop)
    setOpen('edit')
  }, [])

  const handleView = useCallback((crop: CropRecord) => {
    setSelectedCrop(crop)
    setOpen('view')
  }, [])

  const handleDelete = useCallback((crop: CropRecord) => {
    setSelectedCrop(crop)
    setOpen('delete')
  }, [])

  return (
    <CropContext.Provider value={{ open, setOpen, selectedCrop, setSelectedCrop, handleCreate, handleEdit, handleView, handleDelete }}>
      {children}
    </CropContext.Provider>
  )
}

export function useCropContext(): CropContextType {
  const context = useContext(CropContext)
  if (!context) {
    throw new Error('useCropContext must be used within a CropProvider')
  }
  return context
}
