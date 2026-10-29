'use client'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { ComponentProps, ReactNode } from 'react'

export interface ConfirmDialogProps extends Omit<ComponentProps<typeof AlertDialog>, 'children'> {
  title: ReactNode
  desc: ReactNode
  cancelBtnText?: string
  confirmText?: ReactNode
  destructive?: boolean
  isLoading?: boolean
  disabled?: boolean
  className?: string
  children?: ReactNode
  handleConfirm?: () => void
  form?: string
}

export function ConfirmDialog({
  title,
  desc,
  children,
  className,
  confirmText = 'Continue',
  cancelBtnText = 'Cancel',
  destructive = false,
  isLoading = false,
  disabled = false,
  form,
  handleConfirm,
  ...actions
}: ConfirmDialogProps) {
  return (
    <AlertDialog {...actions}>
      <AlertDialogContent className={cn(className)}>
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-xs leading-relaxed">{desc}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelBtnText}</AlertDialogCancel>
          <Button
            type={form ? 'submit' : 'button'}
            form={form}
            onClick={handleConfirm}
            variant={destructive ? 'destructive' : 'default'}
            disabled={disabled || isLoading}
          >
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
