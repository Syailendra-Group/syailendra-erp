/**
 * use-distilleries.ts — TanStack Query Hooks for Distillation Facility Master
 * Syailendra Group ERP (SCM Pillar)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getDistilleriesAction,
  getDistilleriesPaginatedAction,
  getDistilleryByIdAction,
  getDistilleryPartnerOptionsAction,
  saveDistilleryAction,
  toggleDistilleryStatusAction
} from '@/actions/scm/distillery.action'

import type { DistilleryFormValues } from '@/schemas/scm/distillery-schema'
import type { FetchDistilleriesParams } from '@/types/scm/distillery'

export const distilleryQueryKeys = {
  all: ['distilleries'] as const,
  lists: () => [...distilleryQueryKeys.all, 'list'] as const,
  list: (params: FetchDistilleriesParams) => [...distilleryQueryKeys.lists(), params] as const,
  detail: (id: number) => [...distilleryQueryKeys.all, 'detail', id] as const,
  partners: () => [...distilleryQueryKeys.all, 'partners'] as const
}

export function useDistilleriesQuery() {
  return useQuery({
    queryKey: distilleryQueryKeys.all,
    queryFn: async () => {
      const res = await getDistilleriesAction()
      if (res.error) throw new Error(res.error)
      return res.distilleries
    },
    staleTime: 1000 * 60 * 5
  })
}

export function useDistilleriesPaginatedQuery(params: FetchDistilleriesParams) {
  return useQuery({
    queryKey: distilleryQueryKeys.list(params),
    queryFn: async () => {
      return await getDistilleriesPaginatedAction(params)
    },
    staleTime: 1000 * 30
  })
}

export function useDistilleryByIdQuery(id: number, enabled = true) {
  return useQuery({
    queryKey: distilleryQueryKeys.detail(id),
    queryFn: async () => {
      return await getDistilleryByIdAction(id)
    },
    enabled: enabled && Boolean(id)
  })
}

export function useDistilleryPartnerOptions() {
  return useQuery({
    queryKey: distilleryQueryKeys.partners(),
    queryFn: async () => {
      return await getDistilleryPartnerOptionsAction()
    },
    staleTime: 1000 * 60 * 10
  })
}

export function useSaveDistilleryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: DistilleryFormValues) => {
      return await saveDistilleryAction(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: distilleryQueryKeys.all })
    }
  })
}

export function useToggleDistilleryStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      return await toggleDistilleryStatusAction(id, active)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: distilleryQueryKeys.all })
    }
  })
}
