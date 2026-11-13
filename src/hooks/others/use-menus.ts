'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getPillarsAction, reassignPillarAction, savePillarAction } from '@/actions/others/menu.action'
import { COMPANIES_QUERY_KEY } from '@/hooks/others/use-companies'

import type { PillarRecord, UpdatePillarPayload } from '@/types/others/menu'

export const PILLARS_QUERY_KEY = ['pillars-list'] as const

export function usePillarsQuery() {
  return useQuery<{ pillars: PillarRecord[] }>({
    queryKey: PILLARS_QUERY_KEY,
    queryFn: () => getPillarsAction(),
    staleTime: 30_000
  })
}

export function useSavePillarMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdatePillarPayload) => savePillarAction(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: PILLARS_QUERY_KEY })
        queryClient.invalidateQueries({ queryKey: COMPANIES_QUERY_KEY })
      }
    }
  })
}

export function useReassignPillarMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ pillarId, companyId }: { pillarId: number; companyId: number }) => reassignPillarAction(pillarId, companyId),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: PILLARS_QUERY_KEY })
        queryClient.invalidateQueries({ queryKey: COMPANIES_QUERY_KEY })
      }
    }
  })
}
