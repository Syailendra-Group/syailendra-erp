/**
 * use-farmers.ts — TanStack Query Hooks for Farmers & Plantations
 * Syailendra Group ERP
 */

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getFarmerByIdAction,
  getFarmersAction,
  getFarmersPaginatedAction,
  saveFarmerAction,
  toggleFarmerStatusAction
} from '@/actions/sbi/scm/farmer.action'

import type { FetchFarmersParams, PaginatedFarmersResult } from '@/actions/sbi/scm/farmer.action'
import type { FarmerFormValues } from '@/schemas/sbi/scm/farmer-schema'
import type { FarmerRecord } from '@/types/sbi/scm/farmer'

export const farmerKeys = {
  all: ['farmers'] as const,
  lists: () => [...farmerKeys.all, 'list'] as const,
  list: (params: FetchFarmersParams = {}) => [...farmerKeys.lists(), params] as const,
  details: () => [...farmerKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...farmerKeys.details(), id] as const
}

export function useFarmersQuery() {
  return useQuery({
    queryKey: farmerKeys.lists(),
    queryFn: async (): Promise<FarmerRecord[]> => {
      const res = await getFarmersAction()
      return res.farmers
    }
  })
}

export function useFarmersPaginatedQuery(params: FetchFarmersParams = {}) {
  return useQuery({
    queryKey: farmerKeys.list(params),
    queryFn: async (): Promise<PaginatedFarmersResult> => {
      return await getFarmersPaginatedAction(params)
    },
    placeholderData: keepPreviousData
  })
}

export function useFarmerDetailQuery(identifier: string | number) {
  return useQuery({
    queryKey: farmerKeys.detail(identifier),
    queryFn: async (): Promise<FarmerRecord | null> => {
      return await getFarmerByIdAction(identifier)
    },
    enabled: Boolean(identifier)
  })
}

export function useSaveFarmerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: FarmerFormValues) => saveFarmerAction(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.all })
    }
  })
}

export function useToggleFarmerStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => toggleFarmerStatusAction(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.all })
    }
  })
}
