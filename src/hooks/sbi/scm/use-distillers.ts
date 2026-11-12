/**
 * use-distillers.ts — TanStack Query Hooks for Distillation Units
 * Syailendra Group ERP
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getDistillersAction, getDistillersPaginatedAction, saveDistillerAction, toggleDistillerStatusAction } from '@/actions/sbi/scm/distiller.action'

import type { DistillerFormValues } from '@/schemas/sbi/scm/distiller-schema'
import type { FetchDistillersPaginatedParams } from '@/services/odoo/sbi/scm/distiller.service'

export const distillerQueryKeys = {
  all: ['distillers'] as const,
  lists: () => [...distillerQueryKeys.all, 'list'] as const,
  list: (params: FetchDistillersPaginatedParams) => [...distillerQueryKeys.lists(), params] as const
}

export function useDistillersQuery() {
  return useQuery({
    queryKey: distillerQueryKeys.all,
    queryFn: async () => {
      const res = await getDistillersAction()
      if (res.error) throw new Error(res.error)
      return res.distillers
    },
    staleTime: 1000 * 60 * 5
  })
}

export function useDistillersPaginatedQuery(params: FetchDistillersPaginatedParams) {
  return useQuery({
    queryKey: distillerQueryKeys.list(params),
    queryFn: async () => {
      return await getDistillersPaginatedAction(params)
    },
    staleTime: 1000 * 30
  })
}

export function useSaveDistillerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: DistillerFormValues) => {
      return await saveDistillerAction(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: distillerQueryKeys.all })
    }
  })
}

export function useToggleDistillerStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      return await toggleDistillerStatusAction(id, active)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: distillerQueryKeys.all })
    }
  })
}
