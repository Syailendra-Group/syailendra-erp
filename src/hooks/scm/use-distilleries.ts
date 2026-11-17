/**
 * use-distilleries.ts — TanStack Query Hooks for Distillation Units
 * Syailendra Group ERP
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getDistilleriesAction,
  getDistilleriesPaginatedAction,
  saveDistilleryAction,
  toggleDistilleryStatusAction
} from '@/actions/scm/distillery.action'

import type { DistilleryFormValues } from '@/schemas/scm/distillery-schema'
import type { FetchDistilleriesPaginatedParams } from '@/services/odoo/scm/distillery.service'

export const distilleryQueryKeys = {
  all: ['distilleries'] as const,
  lists: () => [...distilleryQueryKeys.all, 'list'] as const,
  list: (params: FetchDistilleriesPaginatedParams) => [...distilleryQueryKeys.lists(), params] as const
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

export function useDistilleriesPaginatedQuery(params: FetchDistilleriesPaginatedParams) {
  return useQuery({
    queryKey: distilleryQueryKeys.list(params),
    queryFn: async () => {
      return await getDistilleriesPaginatedAction(params)
    },
    staleTime: 1000 * 30
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
