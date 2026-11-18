/**
 * use-supplier-types.ts — TanStack Query hooks for the flat Supplier Type master
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createSupplierTypeAction,
  fetchSupplierTypeOptionsAction,
  fetchSupplierTypesAction,
  setSupplierTypeActiveAction,
  updateSupplierTypeAction
} from '@/actions/scm/supplier-type.action'

import type { GetSupplierTypesParams } from '@/services/odoo/scm/supplier-type.service'
import type { SupplierTypeFormValues } from '@/types/scm/supplier-type'

export const supplierTypeKeys = {
  all: ['scm', 'supplier-types'] as const,
  lists: () => [...supplierTypeKeys.all, 'list'] as const,
  list: (params: GetSupplierTypesParams) => [...supplierTypeKeys.lists(), params] as const,
  options: () => [...supplierTypeKeys.all, 'options'] as const
}

export function useSupplierTypes(params: GetSupplierTypesParams = {}) {
  return useQuery({
    queryKey: supplierTypeKeys.list(params),
    queryFn: () => fetchSupplierTypesAction(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000
  })
}

export function useSupplierTypeOptions(enabled = true) {
  return useQuery({
    queryKey: supplierTypeKeys.options(),
    queryFn: () => fetchSupplierTypeOptionsAction(),
    enabled,
    staleTime: 60_000
  })
}

export function useCreateSupplierType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: SupplierTypeFormValues) => createSupplierTypeAction(values),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: supplierTypeKeys.all })
      }
    }
  })
}

export function useUpdateSupplierType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: SupplierTypeFormValues }) => updateSupplierTypeAction(id, values),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: supplierTypeKeys.all })
      }
    }
  })
}

export function useSetSupplierTypeActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => setSupplierTypeActiveAction(id, active),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: supplierTypeKeys.all })
      }
    }
  })
}
