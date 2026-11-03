import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getProvinceByIdAction, getProvincesAction, getProvincesPaginatedAction, saveProvinceAction } from '@/actions/others/province.action'

import type { ProvinceFormValues } from '@/schemas/others/province-schema'
import type { FetchProvincesParams } from '@/services/odoo/others/province.service'
import type { ProvinceRecord } from '@/types/others/province'

export const provinceKeys = {
  all: ['provinces'] as const,
  lists: () => [...provinceKeys.all, 'list'] as const,
  byCountry: (countryId?: number) => [...provinceKeys.lists(), { countryId }] as const,
  paginated: (params: FetchProvincesParams) => [...provinceKeys.all, 'paginated', params] as const,
  detail: (id: number) => [...provinceKeys.all, 'detail', id] as const
}

export function useProvincesQuery(countryId?: number) {
  return useQuery({
    queryKey: provinceKeys.byCountry(countryId),
    queryFn: async (): Promise<ProvinceRecord[]> => {
      const res = await getProvincesAction(countryId)
      return res.provinces
    },
    staleTime: 60 * 1000
  })
}

export function useProvincesPaginatedQuery(params: FetchProvincesParams = {}) {
  return useQuery({
    queryKey: provinceKeys.paginated(params),
    queryFn: async () => {
      return await getProvincesPaginatedAction(params)
    },
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000
  })
}

export function useProvinceDetailQuery(id: number) {
  return useQuery({
    queryKey: provinceKeys.detail(id),
    queryFn: async (): Promise<ProvinceRecord | null> => {
      return await getProvinceByIdAction(id)
    },
    enabled: Boolean(id)
  })
}

export function useSaveProvinceMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: ProvinceFormValues) => saveProvinceAction(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: provinceKeys.all })
    }
  })
}
