/**
 * use-auth.ts — TanStack Query Hooks for Authentication
 * Syailendra Group ERP
 */

import { useMutation, useQuery } from '@tanstack/react-query'

import { getSessionAction, loginAction, logoutAction } from '@/actions/auth/auth.action'

import type { LoginFormValues } from '@/schemas/auth/auth-schema'
import type { AuthActionResult } from '@/types/auth/auth'

export function useLoginMutation() {
  return useMutation({
    mutationFn: (values: LoginFormValues): Promise<AuthActionResult> => loginAction(values)
  })
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: (): Promise<void> => logoutAction()
  })
}


export function useSessionQuery() {
  return useQuery({
    queryKey: ['auth', 'session'],
    queryFn: () => getSessionAction(),
    staleTime: 1000 * 60 * 5
  })
}
