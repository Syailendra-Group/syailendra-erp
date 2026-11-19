'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'

import type { ProductRecord } from '@/types/scm/product'
import type { PropsWithChildren, ReactElement } from 'react'

export type ProductDialogType = 'view' | 'delete' | null

export interface ProductContextType {
  open: ProductDialogType
  setOpen: (type: ProductDialogType) => void
  currentRow: ProductRecord | null
  setCurrentRow: (item: ProductRecord | null) => void
  handleCreate: () => void
  handleEdit: (item: ProductRecord) => void
  handleView: (item: ProductRecord) => void
  handleDelete: (item: ProductRecord) => void
}

const ProductContext = createContext<ProductContextType | null>(null)

export function ProductProvider({ children }: PropsWithChildren): ReactElement {
  const router = useRouter()
  const [open, setOpen] = useState<ProductDialogType>(null)
  const [currentRow, setCurrentRow] = useState<ProductRecord | null>(null)

  const handleCreate = useCallback(() => {
    router.push('/scm/products/create')
  }, [router])

  const handleEdit = useCallback(
    (item: ProductRecord) => {
      router.push(`/scm/products/${item.id}/edit`)
    },
    [router]
  )

  const handleView = useCallback((item: ProductRecord) => {
    setCurrentRow(item)
    setOpen('view')
  }, [])

  const handleDelete = useCallback((item: ProductRecord) => {
    setCurrentRow(item)
    setOpen('delete')
  }, [])

  return (
    <ProductContext.Provider
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
    </ProductContext.Provider>
  )
}

export function useProduct(): ProductContextType {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider')
  }
  return context
}

export const useProducts = useProduct
