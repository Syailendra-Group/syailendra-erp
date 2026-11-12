import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  deleteCountryAction,
  getCountriesAction,
  getCountriesPaginatedAction,
  getCountryByIdAction,
  saveCountryAction
} from '@/actions/sbi/others/country.action'

import type { CountryFormValues } from '@/schemas/sbi/others/country-schema'
import type { FetchCountriesParams } from '@/services/odoo/sbi/others/country.service'
import type { CountryRecord } from '@/types/sbi/others/country'

export const countryKeys = {
  all: ['countries'] as const,
  lists: () => [...countryKeys.all, 'list'] as const,
  paginated: (params: FetchCountriesParams) => [...countryKeys.all, 'paginated', params] as const,
  detail: (id: number) => [...countryKeys.all, 'detail', id] as const
}

export function useCountriesQuery() {
  return useQuery({
    queryKey: countryKeys.lists(),
    queryFn: async (): Promise<CountryRecord[]> => {
      const res = await getCountriesAction()
      return res.countries
    },
    staleTime: 60 * 1000
  })
}

export function useCountriesPaginatedQuery(params: FetchCountriesParams = {}) {
  return useQuery({
    queryKey: countryKeys.paginated(params),
    queryFn: async () => {
      return await getCountriesPaginatedAction(params)
    },
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000
  })
}

export function useCountryDetailQuery(id: number) {
  return useQuery({
    queryKey: countryKeys.detail(id),
    queryFn: async (): Promise<CountryRecord | null> => {
      return await getCountryByIdAction(id)
    },
    enabled: Boolean(id)
  })
}

export function useSaveCountryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: CountryFormValues) => saveCountryAction(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: countryKeys.all })
    }
  })
}

export function useDeleteCountryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteCountryAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: countryKeys.all })
    }
  })
}
