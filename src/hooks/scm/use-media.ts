'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { deleteEntityMediaAction, getEntityMediaAction } from '@/actions/scm/media.action'

import type { MediaRecord } from '@/types/components/media'

export const mediaKeys = {
  all: ['scm', 'media'] as const,
  entity: (model: string, id: number) => [...mediaKeys.all, model, id] as const
}

export function useEntityMedia(model: string, id: number) {
  return useQuery<MediaRecord[]>({
    queryKey: mediaKeys.entity(model, id),
    queryFn: () => getEntityMediaAction(model, id),
    enabled: id > 0,
    staleTime: 30_000
  })
}

export function useDeleteEntityMedia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteEntityMediaAction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mediaKeys.all })
  })
}
