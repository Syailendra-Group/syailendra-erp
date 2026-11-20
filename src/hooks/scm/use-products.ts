/**
 * use-products.ts — TanStack Query Hooks for Product Master & Commodity Catalog
 * Syailendra Group ERP — SCM Pillar
 */

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  deleteProductAction,
  getProductByIdAction,
  getProductsPaginatedAction,
  saveProductAction,
  toggleProductActiveAction
} from '@/actions/scm/product.action'

import type { FetchProductsParams, PaginatedProductsResult, ProductRecord } from '@/actions/scm/product.action'
import type { ProductFormValues } from '@/schemas/scm/product-schema'

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: FetchProductsParams = {}) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const
}

export function useProductsPaginatedQuery(params: FetchProductsParams = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: async (): Promise<PaginatedProductsResult> => {
      return await getProductsPaginatedAction(params)
    },
    placeholderData: keepPreviousData
  })
}

export function useProductDetailQuery(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async (): Promise<ProductRecord | null> => {
      return await getProductByIdAction(id)
    },
    enabled: Boolean(id) && id > 0
  })
}

export function useSaveProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: ProductFormValues) => {
      return await saveProductAction(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    }
  })
}

export function useToggleProductActiveMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => toggleProductActiveAction(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all })
  })
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteProductAction(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    }
  })
}
