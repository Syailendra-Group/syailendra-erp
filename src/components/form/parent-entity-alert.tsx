'use client'

import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

import type { ReactElement } from 'react'

export interface ParentEntityAlertProps {
  parentLabel?: string
  parentName?: string
  isChecking: boolean
  exists: boolean
  autoAdd: boolean
  onAutoAddChange: (checked: boolean) => void
  isDuplicate?: boolean
  duplicateId?: number
  currentName?: string
  entityTypeLabel?: string
  parentTypeLabel?: string
  className?: string
}

export function ParentEntityAlert({
  parentLabel,
  parentName,
  isChecking,
  exists,
  autoAdd,
  onAutoAddChange,
  isDuplicate,
  duplicateId,
  currentName,
  entityTypeLabel,
  parentTypeLabel,
  className
}: ParentEntityAlertProps): ReactElement | null {
  const tReg = useTranslations('regional.common')
  const tAlert = useTranslations('regional.common.parentAlert')

  const effectiveParentLabel = parentLabel || tReg('fields.parent')
  const effectiveEntityLabel = entityTypeLabel || 'Wilayah'
  const effectiveParentType = parentTypeLabel || 'Induk'

  return (
    <div className={cn('space-y-2.5', className)}>
      {/* Duplicate Entity Alert Banner */}
      {isDuplicate && (
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/10 text-destructive py-2.5 text-xs">
          <AlertCircle className="size-4 shrink-0" />
          <div className="space-y-0.5">
            <AlertTitle className="text-xs font-bold">{tAlert('alreadyRegistered', { entity: effectiveEntityLabel })}</AlertTitle>
            <AlertDescription className="text-muted-foreground text-[11px] leading-relaxed">
              {tAlert('alreadyRegisteredDesc', { name: currentName || '', id: duplicateId || 0 })}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Parent Registration Status and Auto-Add Switch Card */}
      {parentName && (
        <div className="border-border/70 bg-muted/40 space-y-2.5 rounded-lg border p-3 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground font-semibold">
              {effectiveParentLabel}: <span className="text-primary font-medium">{parentName}</span>
            </span>

            {isChecking ? (
              <span className="text-muted-foreground animate-pulse text-[11px]">{tReg('checkingParent')}</span>
            ) : exists ? (
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                <span>{tReg('parentRegistered')}</span>
              </span>
            ) : (
              <span className="text-destructive flex items-center gap-1.5 text-[11px] font-semibold">
                <AlertCircle className="size-3.5" />
                <span>{tReg('parentUnregistered')}</span>
              </span>
            )}
          </div>

          {/* Missing Parent Alert with Clean Switch Card */}
          {!isChecking && !exists && (
            <div className="border-destructive/30 bg-destructive/5 space-y-2.5 rounded-md border p-2.5 text-xs">
              <div className="text-destructive flex items-start gap-2">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                <p className="text-[11px] leading-relaxed">{tAlert('parentUnregisteredDesc', { parent: effectiveParentType, name: parentName })}</p>
              </div>

              <div className="border-border/60 bg-background/80 flex items-center justify-between gap-3 rounded-md border p-2 shadow-2xs">
                <div className="space-y-0.5">
                  <span className="text-foreground block text-[11px] font-semibold">
                    {tAlert('autoRegisterLabel', { parent: effectiveParentType })}
                  </span>
                  <span className="text-muted-foreground block text-[10px]">
                    {autoAdd ? tAlert('autoRegisterHelpActive') : tAlert('autoRegisterHelpInactive')}
                  </span>
                </div>
                <Switch
                  checked={autoAdd}
                  onCheckedChange={onAutoAddChange}
                  aria-label={tAlert('autoRegisterLabel', { parent: effectiveParentType })}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
