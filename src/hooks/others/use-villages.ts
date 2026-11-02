import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getVillageByIdAction, getVillagesAction, saveVillageAction, toggleVillageStatusAction } from '@/actions/others/village.action'

import type { VillageFormValues } from '@/schemas/others/village-schema'
import type { VillageRecord } from '@/types/others/village'

export const villageKeys = {
  all: ['villages'] as const,
  lists: () => [...villageKeys.all, 'list'] as const,
  byDistrict: (districtId?: number) => [...villageKeys.lists(), { districtId }] as const,
  detail: (id: number) => [...villageKeys.all, 'detail', id] as const
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

export function useVillageDetailQuery(id: number) {
  return useQuery({
    queryKey: villageKeys.detail(id),
    queryFn: async (): Promise<VillageRecord | null> => {
      return await getVillageByIdAction(id)
    },
    enabled: Boolean(id)
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
