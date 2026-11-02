import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  checkParentProvinceAction,
  getRegenciesAction,
  getRegencyByIdAction,
  saveRegencyAction,
  toggleRegencyStatusAction
} from '@/actions/others/regency.action'

import type { RegencyFormValues } from '@/schemas/others/regency-schema'
import type { RegencyRecord } from '@/types/others/regency'

export const regencyKeys = {
  all: ['regencies'] as const,
  lists: () => [...regencyKeys.all, 'list'] as const,
  byState: (stateId?: number) => [...regencyKeys.lists(), { stateId }] as const,
  detail: (id: number) => [...regencyKeys.all, 'detail', id] as const,
  checkParent: (name: string, code?: string) => ['parent-check', 'province', name, code] as const
}

export function useRegenciesQuery(stateId?: number) {
  return useQuery({
    queryKey: regencyKeys.byState(stateId),
    queryFn: async (): Promise<RegencyRecord[]> => {
      const res = await getRegenciesAction(stateId)
      return res.regencies
    },
    staleTime: 60 * 1000
  })
}

export function useRegencyDetailQuery(id: number) {
  return useQuery({
    queryKey: regencyKeys.detail(id),
    queryFn: async (): Promise<RegencyRecord | null> => {
      return await getRegencyByIdAction(id)
    },
    enabled: Boolean(id)
  })
}

export function useCheckParentProvinceQuery(name: string, code?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: regencyKeys.checkParent(name, code),
    queryFn: async () => {
      return await checkParentProvinceAction(name, code)
    },
    enabled: Boolean(name) && enabled,
    staleTime: 10 * 1000
  })
}

export function useSaveRegencyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: RegencyFormValues) => saveRegencyAction(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: regencyKeys.all })
      queryClient.invalidateQueries({ queryKey: ['provinces'] })
    }
  })
}

export function useToggleRegencyStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => toggleRegencyStatusAction(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: regencyKeys.all })
    }
  })
}
