import { useQuery } from '@tanstack/react-query'

import { getCountriesAction } from '@/actions/others/country.action'

import type { CountryRecord } from '@/types/others/country'

export const countryKeys = {
  all: ['countries'] as const,
  lists: () => [...countryKeys.all, 'list'] as const
}

export function useCountriesQuery() {
  return useQuery({
    queryKey: countryKeys.lists(),
    queryFn: async (): Promise<CountryRecord[]> => {
      const res = await getCountriesAction()
      return res.countries
    },
    staleTime: 5 * 60 * 1000
  })
}
