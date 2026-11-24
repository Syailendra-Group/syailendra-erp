'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { fetchPartnerAccessMapAction, issuePartnerPinAction, unlockPartnerAccessAction } from '@/actions/scm/supplier-access.action'

import type { PartnerAccessSummary } from '@/types/scm/partner-access'

export function usePartnerAccessMap(partnerIds: number[]) {
  const sortedIds = [...partnerIds].sort((a, b) => a - b)
  return useQuery({
    queryKey: ['partnerAccessMap', sortedIds.join(',')],
    queryFn: async () => {
      const summaries = await fetchPartnerAccessMapAction(sortedIds)
      const map = new Map<number, PartnerAccessSummary>()
      for (const summary of summaries) map.set(summary.partnerId, summary)
      return map
    },
    enabled: sortedIds.length > 0
  })
}

export function useProvisionAndIssuePin() {
  const t = useTranslations('scm.suppliers')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: issuePartnerPinAction,
    onSuccess: async (result) => {
      if (result.ok) {
        toast.success(t('toast.pinIssued'))
        await queryClient.invalidateQueries({ queryKey: ['partnerAccessMap'] })
      } else {
        toast.error(result.message ?? t('toast.pinIssueError'))
      }
    },
    onError: () => {
      toast.error(t('toast.pinIssueError'))
    }
  })
}

export function useUnlockPartnerAccess() {
  const t = useTranslations('scm.suppliers')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (accessId: number) => unlockPartnerAccessAction(accessId),
    onSuccess: async (result) => {
      if (result.ok) {
        toast.success(t('toast.accessUnlocked'))
        await queryClient.invalidateQueries({ queryKey: ['partnerAccessMap'] })
      } else {
        toast.error(result.message ?? t('toast.accessUnlockError'))
      }
    },
    onError: () => {
      toast.error(t('toast.accessUnlockError'))
    }
  })
}
