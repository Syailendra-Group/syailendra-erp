import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getDistrictByIdAction,
  getDistrictsAction,
  getDistrictsPaginatedAction,
  saveDistrictAction,
  toggleDistrictStatusAction
} from '@/actions/others/district.action'

import type { DistrictFormValues } from '@/schemas/others/district-schema'
import type { FetchDistrictsParams } from '@/services/odoo/others/district.service'
import type { DistrictRecord } from '@/types/others/district'

export const districtKeys = {
  all: ['districts'] as const,
  lists: () => [...districtKeys.all, 'list'] as const,
  byCity: (cityId?: number) => [...districtKeys.lists(), { cityId }] as const,
  paginated: (params: FetchDistrictsParams) => [...districtKeys.all, 'paginated', params] as const,
  detail: (id: number) => [...districtKeys.all, 'detail', id] as const
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

export function useSaveDistrictMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: DistrictFormValues) => saveDistrictAction(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: districtKeys.all })
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
