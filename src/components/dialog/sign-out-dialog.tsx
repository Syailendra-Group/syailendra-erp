'use client'

import { useTranslations } from 'next-intl'

import { useLogoutMutation } from '@/hooks/auth/use-auth'
import { useRouter } from '@/i18n/navigation'

import { ConfirmDialog } from './confirm-dialog'

import type { ReactElement } from 'react'

export interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps): ReactElement {
  const router = useRouter()
  const tConfirm = useTranslations('common.confirm')

  const { mutateAsync: logout } = useLogoutMutation()

  const handleSignOut = async () => {
    try {
      await logout()
    } finally {
      onOpenChange(false)
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={tConfirm('signOutTitle')}
      desc={tConfirm('signOutDesc')}
      confirmText={tConfirm('signOutTitle')}
      cancelBtnText={tConfirm('cancel')}
      destructive={true}
      handleConfirm={handleSignOut}
      className="sm:max-w-sm"
    />
  )
}
