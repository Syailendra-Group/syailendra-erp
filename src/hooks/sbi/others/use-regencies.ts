import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  checkParentProvinceAction,
  checkRegencyExistsAction,
  deleteRegencyAction,
  getRegenciesAction,
  getRegenciesPaginatedAction,
  getRegencyByIdAction,
  getRegencyFilterOptionsAction,
  saveRegencyAction,
  toggleRegencyStatusAction
} from '@/actions/sbi/others/regency.action'

import type { RegencyFormValues } from '@/schemas/sbi/others/regency-schema'
import type { FetchRegenciesParams } from '@/services/odoo/sbi/others/regency.service'
import type { RegencyRecord } from '@/types/sbi/others/regency'

export const regencyKeys = {
  all: ['regencies'] as const,
  lists: () => [...regencyKeys.all, 'list'] as const,
  byState: (stateId?: number) => [...regencyKeys.lists(), { stateId }] as const,
  paginated: (params: FetchRegenciesParams) => [...regencyKeys.all, 'paginated', params] as const,
  detail: (id: number) => [...regencyKeys.all, 'detail', id] as const,
  checkParent: (name: string, code?: string) => ['parent-check', 'province', name, code] as const,
  checkExists: (params: { code?: string; name?: string }) => ['regency-exists', params] as const,
  filterOptions: () => [...regencyKeys.all, 'filter-options'] as const
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

export function useRegenciesPaginatedQuery(params: FetchRegenciesParams = {}) {
  return useQuery({
    queryKey: regencyKeys.paginated(params),
    queryFn: async () => {
      return await getRegenciesPaginatedAction(params)
    },
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000
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

export function useCheckRegencyExistsQuery(params: { code?: string; name?: string }, enabled = true) {
  return useQuery({
    queryKey: regencyKeys.checkExists(params),
    queryFn: async () => {
      return await checkRegencyExistsAction(params)
    },
    enabled: enabled && Boolean(params.code || params.name),
    staleTime: 10 * 1000
  })
}

export function useRegencyFilterOptionsQuery() {
  return useQuery({
    queryKey: regencyKeys.filterOptions(),
    queryFn: async () => {
      return await getRegencyFilterOptionsAction()
    },
    staleTime: 60 * 1000
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

export function useDeleteRegencyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteRegencyAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: regencyKeys.all })
    }
  })
}
