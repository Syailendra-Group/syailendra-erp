'use client'

import { useTranslations } from 'next-intl'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { useRouter } from '@/i18n/navigation'

import type { ReactElement } from 'react'

export interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps): ReactElement {
  const router = useRouter()
  const tConfirm = useTranslations('common.confirm')

  const handleSignOut = () => {
    onOpenChange(false)
    router.push('/login')
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
