/**
 * use-suppliers.ts — TanStack Query hooks for Master Supplier
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createSupplierAction,
  deleteSupplierAction,
  fetchSupplierByIdAction,
  fetchSuppliersAction,
  toggleSupplierStatusAction,
  updateSupplierAction
} from '@/actions/sbi/scm/supplier.action'

import type { GetSuppliersParams } from '@/services/odoo/sbi/scm/supplier.service'
import type { SupplierFormValues } from '@/types/sbi/scm/supplier'

export const supplierKeys = {
  all: ['scm', 'suppliers'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
  list: (params: GetSuppliersParams) => [...supplierKeys.lists(), params] as const,
  details: () => [...supplierKeys.all, 'detail'] as const,
  detail: (id: number) => [...supplierKeys.details(), id] as const
}

export function useSuppliers(params: GetSuppliersParams = {}) {
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => fetchSuppliersAction(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000
  })
}

export function useSupplierDetail(id: number | null | undefined) {
  return useQuery({
    queryKey: supplierKeys.detail(id || 0),
    queryFn: () => (id ? fetchSupplierByIdAction(id) : null),
    enabled: Boolean(id),
    staleTime: 60_000
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: SupplierFormValues) => createSupplierAction(values),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: supplierKeys.all })
      }
    }
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: SupplierFormValues }) => updateSupplierAction(id, values),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: supplierKeys.all })
      }
    }
  })
}

export function useToggleSupplierStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => toggleSupplierStatusAction(id, active),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: supplierKeys.all })
      }
    }
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteSupplierAction(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: supplierKeys.all })
      }
    }
  })
}
