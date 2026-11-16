/**
 * use-commodities.ts — TanStack Query hooks for Commodity Master
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createCommodityAction,
  deleteCommodityAction,
  fetchCommoditiesAction,
  fetchCommodityOptionsAction,
  updateCommodityAction
} from '@/actions/scm/commodity.action'

import type { CommodityFormValues } from '@/schemas/scm/commodity-schema'
import type { FetchCommoditiesParams } from '@/types/scm/commodity'

export const commodityKeys = {
  all: ['scm', 'commodities'] as const,
  lists: () => [...commodityKeys.all, 'list'] as const,
  list: (params: FetchCommoditiesParams) => [...commodityKeys.lists(), params] as const,
  options: () => [...commodityKeys.all, 'options'] as const
}

export function useCommodities(params: FetchCommoditiesParams = {}) {
  return useQuery({
    queryKey: commodityKeys.list(params),
    queryFn: () => fetchCommoditiesAction(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000
  })
}

export function useCommodityOptions() {
  return useQuery({
    queryKey: commodityKeys.options(),
    queryFn: () => fetchCommodityOptionsAction(),
    staleTime: 60_000
  })
}

export function useCreateCommodity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: CommodityFormValues) => createCommodityAction(values),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: commodityKeys.all })
      }
    }
  })
}

export function useUpdateCommodity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: CommodityFormValues }) => updateCommodityAction(id, values),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: commodityKeys.all })
      }
    }
  })
}

export function useDeleteCommodity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteCommodityAction(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: commodityKeys.all })
      }
    }
  })
}
