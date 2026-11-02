/**
 * use-auth.ts — TanStack Query Hooks for Authentication
 * Syailendra Group ERP
 */

import { useMutation } from '@tanstack/react-query'

import { loginAction, logoutAction } from '@/features/auth/login/actions'

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
