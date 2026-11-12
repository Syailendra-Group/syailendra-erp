/**
 * use-materials.ts — TanStack Query Hooks for Material Master & Commodity Catalog
 * Syailendra Group ERP — SCM Pillar
 */

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { deleteMaterialAction, getMaterialByIdAction, getMaterialsPaginatedAction, saveMaterialAction } from '@/actions/sbi/scm/material.action'

import type { FetchMaterialsParams, MaterialRecord, PaginatedMaterialsResult } from '@/actions/sbi/scm/material.action'
import type { MaterialFormValues } from '@/schemas/sbi/scm/material-schema'

export const materialKeys = {
  all: ['materials'] as const,
  lists: () => [...materialKeys.all, 'list'] as const,
  list: (params: FetchMaterialsParams = {}) => [...materialKeys.lists(), params] as const,
  details: () => [...materialKeys.all, 'detail'] as const,
  detail: (id: number) => [...materialKeys.details(), id] as const
}

export function useMaterialsPaginatedQuery(params: FetchMaterialsParams = {}) {
  return useQuery({
    queryKey: materialKeys.list(params),
    queryFn: async (): Promise<PaginatedMaterialsResult> => {
      return await getMaterialsPaginatedAction(params)
    },
    placeholderData: keepPreviousData
  })
}

export function useMaterialDetailQuery(id: number) {
  return useQuery({
    queryKey: materialKeys.detail(id),
    queryFn: async (): Promise<MaterialRecord | null> => {
      return await getMaterialByIdAction(id)
    },
    enabled: Boolean(id) && id > 0
  })
}

export function useSaveMaterialMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: MaterialFormValues) => {
      return await saveMaterialAction(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.all })
    }
  })
}

export function useDeleteMaterialMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteMaterialAction(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.all })
    }
  })
}
