/**
 * use-farms.ts — TanStack Query hooks for Farm / Terroir Master
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createFarmAction,
  deleteFarmAction,
  fetchFarmByIdAction,
  fetchFarmPartnerOptionsAction,
  fetchFarmsAction,
  fetchFarmsTableDataAction,
  updateFarmAction
} from '@/actions/scm/farm.action'

import type { FarmFormValues } from '@/schemas/scm/farm-schema'
import type { FetchFarmsParams } from '@/types/scm/farm'

export const farmKeys = {
  all: ['scm', 'farms'] as const,
  lists: () => [...farmKeys.all, 'list'] as const,
  list: (params: FetchFarmsParams) => [...farmKeys.lists(), params] as const,
  detail: (id: number) => [...farmKeys.all, 'detail', id] as const,
  table: (params: FetchFarmsParams) => [...farmKeys.all, 'table', params] as const,
  partners: () => [...farmKeys.all, 'partners'] as const
}

export function useFarms(params: FetchFarmsParams = {}) {
  return useQuery({
    queryKey: farmKeys.list(params),
    queryFn: () => fetchFarmsAction(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000
  })
}

export function useFarmsTableData(params: FetchFarmsParams = {}) {
  return useQuery({
    queryKey: farmKeys.table(params),
    queryFn: () => fetchFarmsTableDataAction(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000
  })
}

export function useFarmDetail(id: number) {
  return useQuery({
    queryKey: farmKeys.detail(id),
    queryFn: () => fetchFarmByIdAction(id),
    enabled: Number.isFinite(id) && id > 0
  })
}

export function useFarmPartnerOptions() {
  return useQuery({
    queryKey: farmKeys.partners(),
    queryFn: () => fetchFarmPartnerOptionsAction(),
    staleTime: 600_000
  })
}

export function useCreateFarm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: FarmFormValues) => createFarmAction(values),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: farmKeys.all })
      }
    }
  })
}

export function useUpdateFarm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: FarmFormValues }) => updateFarmAction(id, values),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: farmKeys.all })
      }
    }
  })
}

export function useDeleteFarm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteFarmAction(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: farmKeys.all })
      }
    }
  })
}
