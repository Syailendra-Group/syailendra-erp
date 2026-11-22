/**
 * use-submissions.ts — TanStack Query hooks for Partner Submission review
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { fetchSubmissionByIdAction, fetchSubmissionsAction, reviewSubmissionAction } from '@/actions/scm/submission.action'

import type { FetchSubmissionsParams, ReviewSubmissionParams } from '@/types/scm/submission'

export const submissionKeys = {
  all: ['scm', 'submissions'] as const,
  lists: () => [...submissionKeys.all, 'list'] as const,
  list: (params: FetchSubmissionsParams) => [...submissionKeys.lists(), params] as const,
  detail: (id: number) => [...submissionKeys.all, 'detail', id] as const,
  table: (params: FetchSubmissionsParams) => [...submissionKeys.all, 'table', params] as const
}

export function useSubmissions(params: FetchSubmissionsParams = {}) {
  return useQuery({
    queryKey: submissionKeys.table(params),
    queryFn: () => fetchSubmissionsAction(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000
  })
}

export function useSubmissionDetail(id: number) {
  return useQuery({
    queryKey: submissionKeys.detail(id),
    queryFn: () => fetchSubmissionByIdAction(id),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 30_000
  })
}

export function useReviewSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: ReviewSubmissionParams) => reviewSubmissionAction(values),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: submissionKeys.all })
      }
    }
  })
}
