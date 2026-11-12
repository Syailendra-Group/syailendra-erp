import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  checkDistrictExistsAction,
  checkParentRegencyAction,
  deleteDistrictAction,
  getDistrictByIdAction,
  getDistrictFilterOptionsAction,
  getDistrictsAction,
  getDistrictsPaginatedAction,
  saveDistrictAction,
  toggleDistrictStatusAction
} from '@/actions/sbi/others/district.action'

import type { DistrictFormValues } from '@/schemas/sbi/others/district-schema'
import type { FetchDistrictsParams } from '@/services/odoo/sbi/others/district.service'
import type { DistrictRecord } from '@/types/sbi/others/district'

export const districtKeys = {
  all: ['districts'] as const,
  lists: () => [...districtKeys.all, 'list'] as const,
  byCity: (cityId?: number) => [...districtKeys.lists(), { cityId }] as const,
  paginated: (params: FetchDistrictsParams) => [...districtKeys.all, 'paginated', params] as const,
  detail: (id: number) => [...districtKeys.all, 'detail', id] as const,
  checkParent: (name: string, code?: string) => ['parent-check', 'regency', name, code] as const,
  checkExists: (params: { code?: string; name?: string }) => ['district-exists', params] as const,
  filterOptions: () => [...districtKeys.all, 'filter-options'] as const
}

export function useDistrictsQuery(cityId?: number) {
  return useQuery({
    queryKey: districtKeys.byCity(cityId),
    queryFn: async (): Promise<DistrictRecord[]> => {
      const res = await getDistrictsAction(cityId)
      return res.districts
    },
    staleTime: 60 * 1000
  })
}

export function useDistrictsPaginatedQuery(params: FetchDistrictsParams = {}) {
  return useQuery({
    queryKey: districtKeys.paginated(params),
    queryFn: async () => {
      return await getDistrictsPaginatedAction(params)
    },
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000
  })
}

export function useDistrictDetailQuery(id: number) {
  return useQuery({
    queryKey: districtKeys.detail(id),
    queryFn: async (): Promise<DistrictRecord | null> => {
      return await getDistrictByIdAction(id)
    },
    enabled: Boolean(id)
  })
}

export function useCheckParentRegencyQuery(name: string, code?: string, enabled = true) {
  return useQuery({
    queryKey: districtKeys.checkParent(name, code),
    queryFn: async () => {
      return await checkParentRegencyAction(name, code)
    },
    enabled: Boolean(name) && enabled,
    staleTime: 10 * 1000
  })
}

export function useCheckDistrictExistsQuery(params: { code?: string; name?: string }, enabled = true) {
  return useQuery({
    queryKey: districtKeys.checkExists(params),
    queryFn: async () => {
      return await checkDistrictExistsAction(params)
    },
    enabled: enabled && Boolean(params.code || params.name),
    staleTime: 10 * 1000
  })
}

export function useDistrictFilterOptionsQuery() {
  return useQuery({
    queryKey: districtKeys.filterOptions(),
    queryFn: async () => {
      return await getDistrictFilterOptionsAction()
    },
    staleTime: 60 * 1000
  })
}

export function useSaveDistrictMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: DistrictFormValues) => saveDistrictAction(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: districtKeys.all })
      queryClient.invalidateQueries({ queryKey: ['regencies'] })
    }
  })
}

export function useToggleDistrictStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => toggleDistrictStatusAction(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: districtKeys.all })
    }
  })
}

export function useDeleteDistrictMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteDistrictAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: districtKeys.all })
    }
  })
}
