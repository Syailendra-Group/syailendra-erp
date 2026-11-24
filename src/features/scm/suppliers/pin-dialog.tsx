'use client'

import { Key } from 'lucide-react'
import { useTranslations } from 'next-intl'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'

import { SupplierPinForm } from './pin-form'

import type { SupplierRecord } from '@/types/scm/supplier'

interface SupplierPinDialogProps {
  partner: SupplierRecord
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SupplierPinDialog({ partner, open, onOpenChange, onSuccess }: SupplierPinDialogProps) {
  const t = useTranslations('scm.suppliers')
  const tPin = useTranslations('scm.suppliers.dialog.pin')

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <button className="inline" />
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle className="flex items-center gap-2">
            <Key className="size-4" />
            {tPin('title')}
          </AlertDialogTitle>
          <AlertDialogDescription>{tPin('descriptionShort', { name: partner.name })}</AlertDialogDescription>
        </AlertDialogHeader>

        <SupplierPinForm partner={partner} open={open} onOpenChange={onOpenChange} onSuccess={onSuccess} />

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>{t('form.buttons.cancel')}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
