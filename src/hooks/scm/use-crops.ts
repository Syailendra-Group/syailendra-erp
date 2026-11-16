/**
 * use-crops.ts — TanStack Query hooks for Crop / Commodity Master
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createCropAction, deleteCropAction, fetchCropOptionsAction, fetchCropsAction, updateCropAction } from '@/actions/scm/crop.action'

import type { CropFormValues } from '@/schemas/scm/crop-schema'
import type { FetchCropsParams } from '@/types/scm/crop'

export const cropKeys = {
  all: ['scm', 'crops'] as const,
  lists: () => [...cropKeys.all, 'list'] as const,
  list: (params: FetchCropsParams) => [...cropKeys.lists(), params] as const,
  options: () => [...cropKeys.all, 'options'] as const
}

export function useCrops(params: FetchCropsParams = {}) {
  return useQuery({
    queryKey: cropKeys.list(params),
    queryFn: () => fetchCropsAction(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000
  })
}

export function useCropOptions() {
  return useQuery({
    queryKey: cropKeys.options(),
    queryFn: () => fetchCropOptionsAction(),
    staleTime: 60_000
  })
}

export function useCreateCrop() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: CropFormValues) => createCropAction(values),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: cropKeys.all })
      }
    }
  })
}

export function useUpdateCrop() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: CropFormValues }) => updateCropAction(id, values),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: cropKeys.all })
      }
    }
  })
}

export function useDeleteCrop() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteCropAction(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: cropKeys.all })
      }
    }
  })
}
