import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  checkParentDistrictAction,
  checkVillageExistsAction,
  getVillageByIdAction,
  getVillageFilterOptionsAction,
  getVillagesAction,
  getVillagesPaginatedAction,
  saveVillageAction,
  toggleVillageStatusAction
} from '@/actions/others/village.action'

import type { VillageFormValues } from '@/schemas/others/village-schema'
import type { FetchVillagesParams } from '@/services/odoo/others/village.service'
import type { VillageRecord } from '@/types/others/village'

export const villageKeys = {
  all: ['villages'] as const,
  lists: () => [...villageKeys.all, 'list'] as const,
  byDistrict: (districtId?: number) => [...villageKeys.lists(), { districtId }] as const,
  paginated: (params: FetchVillagesParams) => [...villageKeys.all, 'paginated', params] as const,
  detail: (id: number) => [...villageKeys.all, 'detail', id] as const,
  checkParent: (name: string, code?: string) => ['parent-check', 'district', name, code] as const,
  checkExists: (params: { code?: string; name?: string }) => ['village-exists', params] as const,
  filterOptions: () => [...villageKeys.all, 'filter-options'] as const
}

export function useVillagesQuery(districtId?: number) {
  return useQuery({
    queryKey: villageKeys.byDistrict(districtId),
    queryFn: async (): Promise<VillageRecord[]> => {
      const res = await getVillagesAction(districtId)
      return res.villages
    },
    staleTime: 60 * 1000
  })
}

export function useVillagesPaginatedQuery(params: FetchVillagesParams = {}) {
  return useQuery({
    queryKey: villageKeys.paginated(params),
    queryFn: async () => {
      return await getVillagesPaginatedAction(params)
    },
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000
  })
}

export function useVillageDetailQuery(id: number) {
  return useQuery({
    queryKey: villageKeys.detail(id),
    queryFn: async (): Promise<VillageRecord | null> => {
      return await getVillageByIdAction(id)
    },
    enabled: Boolean(id)
  })
}

export function useCheckParentDistrictQuery(name: string, code?: string, enabled = true) {
  return useQuery({
    queryKey: villageKeys.checkParent(name, code),
    queryFn: async () => {
      return await checkParentDistrictAction(name, code)
    },
    enabled: Boolean(name) && enabled,
    staleTime: 10 * 1000
  })
}

export function useCheckVillageExistsQuery(params: { code?: string; name?: string }, enabled = true) {
  return useQuery({
    queryKey: villageKeys.checkExists(params),
    queryFn: async () => {
      return await checkVillageExistsAction(params)
    },
    enabled: enabled && Boolean(params.code || params.name),
    staleTime: 10 * 1000
  })
}

export function useVillageFilterOptionsQuery() {
  return useQuery({
    queryKey: villageKeys.filterOptions(),
    queryFn: async () => {
      return await getVillageFilterOptionsAction()
    },
    staleTime: 60 * 1000
  })
}

export function useSaveVillageMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: VillageFormValues) => saveVillageAction(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: villageKeys.all })
      queryClient.invalidateQueries({ queryKey: ['districts'] })
    }
  })
}

export function useToggleVillageStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => toggleVillageStatusAction(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: villageKeys.all })
    }
  })
}
