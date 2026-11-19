'use client'

import { useTranslations } from 'next-intl'

import { LoadingButton } from '@/components/button/loading-button'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

import type { ReactElement, ReactNode } from 'react'

export interface ActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  formId?: string
  isPending?: boolean
  isEdit?: boolean
  isView?: boolean
  submitDisabled?: boolean
  submitLabel?: string
  cancelLabel?: string
  children: ReactNode
  className?: string
  maxWidth?: string
}

export function ActionDialog({
  open,
  onOpenChange,
  title,
  description,
  formId,
  isPending = false,
  isEdit = false,
  isView = false,
  submitDisabled = false,
  submitLabel,
  cancelLabel,
  children,
  className,
  maxWidth = 'sm:max-w-lg'
}: ActionDialogProps): ReactElement {
  const tCommon = useTranslations('common')

  const resolvedSubmitLabel = submitLabel || (isEdit ? tCommon('actions.save') : tCommon('actions.create'))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(maxWidth, className)}>
        <DialogHeader className="text-start">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription className="text-xs leading-relaxed">{description}</DialogDescription>}
        </DialogHeader>

        <div className="max-h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">{children}</div>

        <DialogFooter className="border-border/50 mt-4 gap-2 border-t pt-3">
          {isView ? (
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
              {cancelLabel || tCommon('actions.close')}
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
                {cancelLabel || tCommon('actions.cancel')}
              </Button>
              <LoadingButton type="submit" form={formId} isLoading={isPending} disabled={submitDisabled} loadingText={tCommon('actions.loading')}>
                {resolvedSubmitLabel}
              </LoadingButton>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
