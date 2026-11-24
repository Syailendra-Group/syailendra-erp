'use client'

import React from 'react'
import { AlertTriangle, Copy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { LoadingButton } from '@/components/button/loading-button'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { OtpInput } from '@/components/form/otp-input'
import { Button } from '@/components/ui/button'
import { useProvisionAndIssuePin } from '@/hooks/scm/use-supplier-access'

import type { PinIssueResponse } from '@/types/scm/partner-access'
import type { SupplierRecord } from '@/types/scm/supplier'

interface SupplierPinFormProps {
  partner: SupplierRecord
  onSuccess: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SupplierPinForm({ partner, onSuccess, open, onOpenChange }: SupplierPinFormProps) {
  const t = useTranslations('scm.suppliers')
  const form = useForm<{
    generate: boolean
  }>({
    defaultValues: { generate: true }
  })

  const issuePin = useProvisionAndIssuePin()
  const [revealedPin, setRevealedPin] = React.useState<string | null>(null)
  const [showingReveal, setShowingReveal] = React.useState(false)

  const handleGenerate = async () => {
    const result = (await issuePin.mutateAsync(partner.id)) as PinIssueResponse

    if (result.ok) {
      setRevealedPin(result.pin)
      setShowingReveal(true)
      toast.success(t('toast.pinIssued', { name: partner.name }))
      onSuccess()
    } else {
      toast.error(result.message ?? t('toast.pinIssueError'))
    }
  }

  const handleCopy = () => {
    if (!revealedPin) return
    navigator.clipboard.writeText(revealedPin)
    toast.success(t('toast.pinCopied'))
  }

  const tPin = useTranslations('scm.suppliers.dialog.pin')
  if (!open) return null

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleGenerate()
      }}
    >
      <div className="space-y-4">
        <div className="text-muted-foreground text-sm">{tPin('description')}</div>

        {!showingReveal ? (
          <div className="space-y-3">
            <FormFieldWrapper label={tPin('fields.generateLabel')} required error={form.formState.errors.generate?.message}>
              <div className="flex items-center gap-2">
                <input
                  id="generate-pin"
                  type="checkbox"
                  className="border-input bg-background text-primary focus:border-ring rounded shadow-sm focus:ring-1"
                  defaultChecked
                  readOnly
                />
                <label htmlFor="generate-pin" className="cursor-not-allowed text-sm font-medium">
                  {tPin('fields.generateHint')}
                </label>
              </div>
              <p className="text-muted-foreground text-[11px]">{tPin('fields.generateNotice')}</p>
            </FormFieldWrapper>

            <div className="flex items-center justify-between gap-2">
              <LoadingButton type="submit" isLoading={issuePin.isPending} disabled={issuePin.isPending} variant="default">
                {tPin('buttons.generate')}
              </LoadingButton>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-warning/10 border-warning/20 flex items-start gap-3 rounded-lg border p-3">
              <AlertTriangle className="text-warning mt-0.5 size-4 shrink-0" />
              <div className="text-warning-foreground text-sm">{tPin('messages.oneTime')}</div>
            </div>

            <FormFieldWrapper label={tPin('fields.pinLabel')} required>
              <div className="flex items-center gap-2">
                <OtpInput name="pin" length={6} disabled className="w-auto" />
                <Button type="button" variant="outline" size="icon" onClick={handleCopy} disabled={!revealedPin}>
                  <Copy className="size-3.5" />
                </Button>
              </div>
              <p className="text-muted-foreground text-[11px]">{tPin('fields.pinNotice')}</p>
            </FormFieldWrapper>

            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowingReveal(false)
                  setRevealedPin(null)
                  onOpenChange(false)
                }}
              >
                {tPin('buttons.close')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
