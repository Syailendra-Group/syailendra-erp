'use client'

import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

import type { ReactElement, ReactNode } from 'react'

export interface ActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  formId: string
  isPending?: boolean
  isEdit?: boolean
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
  submitDisabled = false,
  submitLabel,
  cancelLabel,
  children,
  className,
  maxWidth = 'sm:max-w-lg'
}: ActionDialogProps): ReactElement {
  const tCommon = useTranslations('common')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(maxWidth, className)}>
        <DialogHeader className="text-start">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription className="text-xs leading-relaxed">{description}</DialogDescription>}
        </DialogHeader>

        <div className="max-h-[70vh] w-full overflow-y-auto py-1 pe-2">{children}</div>

        <DialogFooter className="gap-2 pt-2 sm:gap-0">
          <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
            {cancelLabel || tCommon('actions.cancel')}
          </Button>
          <Button type="submit" form={formId} disabled={isPending || submitDisabled} className="cursor-pointer gap-2 font-semibold">
            {isPending && <Loader2 className="size-4 animate-spin" />}
            <span>{isPending ? tCommon('actions.loading') : submitLabel || (isEdit ? tCommon('actions.save') : tCommon('actions.create'))}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
