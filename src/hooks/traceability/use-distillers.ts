/**
 * use-distillers.ts — TanStack Query Hooks for Distillation Units
 * Syailendra Group ERP
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getDistillersAction, saveDistillerAction, toggleDistillerStatusAction } from '@/actions/traceability/distiller.action'

import type { DistillerFormValues } from '@/schemas/traceability/distiller-schema'
import type { DistillerRecord } from '@/types/traceability/distiller'

export const distillerKeys = {
  all: ['distillers'] as const,
  lists: () => [...distillerKeys.all, 'list'] as const
}

export function useDistillersQuery() {
  return useQuery({
    queryKey: distillerKeys.lists(),
    queryFn: async (): Promise<DistillerRecord[]> => {
      const res = await getDistillersAction()
      return res.distillers
    }
  })
}

export function useSaveDistillerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: DistillerFormValues) => saveDistillerAction(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: distillerKeys.all })
    }
  })
}

export function useToggleDistillerStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => toggleDistillerStatusAction(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: distillerKeys.all })
    }
  })
}
