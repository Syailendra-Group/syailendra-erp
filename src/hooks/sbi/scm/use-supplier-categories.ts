/**
 * use-supplier-categories.ts — TanStack Query hooks for Supplier Categories
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createSupplierCategoryAction,
  deleteSupplierCategoryAction,
  fetchSupplierCategoriesAction,
  fetchSupplierCategoryOptionsAction,
  updateSupplierCategoryAction
} from '@/actions/sbi/scm/supplier-category.action'

import type { GetSupplierCategoriesParams } from '@/services/odoo/sbi/scm/supplier-category.service'
import type { SupplierCategoryFormValues } from '@/types/sbi/scm/supplier-category'

export const supplierCategoryKeys = {
  all: ['scm', 'supplier-categories'] as const,
  lists: () => [...supplierCategoryKeys.all, 'list'] as const,
  list: (params: GetSupplierCategoriesParams) => [...supplierCategoryKeys.lists(), params] as const,
  options: () => [...supplierCategoryKeys.all, 'options'] as const
}

export function useSupplierCategories(params: GetSupplierCategoriesParams = {}) {
  return useQuery({
    queryKey: supplierCategoryKeys.list(params),
    queryFn: () => fetchSupplierCategoriesAction(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000
  })
}

export function useSupplierCategoryOptions() {
  return useQuery({
    queryKey: supplierCategoryKeys.options(),
    queryFn: () => fetchSupplierCategoryOptionsAction(),
    staleTime: 60_000
  })
}

export function useCreateSupplierCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: SupplierCategoryFormValues) => createSupplierCategoryAction(values),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: supplierCategoryKeys.all })
      }
    }
  })
}

export function useUpdateSupplierCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: SupplierCategoryFormValues }) => updateSupplierCategoryAction(id, values),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: supplierCategoryKeys.all })
      }
    }
  })
}

export function useDeleteSupplierCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteSupplierCategoryAction(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: supplierCategoryKeys.all })
      }
    }
  })
}
