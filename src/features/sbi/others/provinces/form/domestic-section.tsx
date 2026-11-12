'use client'

import { AlertCircle } from 'lucide-react'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import type { ProvinceFormValues } from '@/schemas/sbi/others/province-schema'
import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

export interface DomesticProvinceSectionProps {
  form: UseFormReturn<ProvinceFormValues>
  isPending: boolean
  isLoadingCatalog: boolean
  currentCode?: string
  currentName?: string
  catalogItems: Array<{ label: string; value: string }>
  isDuplicate: boolean
  duplicateId?: number
  onSelectDomestic: (code: string) => void
  t: (key: string) => string
  tReg: (key: string, values?: Record<string, string | number>) => string
  tToast: (key: string) => string
}

export function DomesticProvinceSection({
  form,
  isPending,
  isLoadingCatalog,
  currentCode,
  currentName,
  catalogItems,
  isDuplicate,
  duplicateId,
  onSelectDomestic,
  t,
  tReg,
  tToast
}: DomesticProvinceSectionProps): ReactElement {
  return (
    <>
      <FormFieldWrapper id="catalog-bps" label={t('form.catalogLabel')} required>
        <SelectForm
          placeholder={isLoadingCatalog ? tReg('placeholders.loadingCatalog', { entity: tReg('entities.province') }) : t('form.catalogPlaceholder')}
          disabled={isPending || isLoadingCatalog}
          value={currentCode || undefined}
          onValueChange={onSelectDomestic}
          items={catalogItems}
          onAddNewClick={() => {
            form.setValue('is_domestic', false)
            toastInfo(tToast('switchedToForeign'))
          }}
        />
      </FormFieldWrapper>

      {isDuplicate && (
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/10 text-destructive py-2 text-xs">
          <AlertCircle className="size-4 shrink-0" />
          <div className="space-y-0.5">
            <AlertTitle className="text-xs font-bold">{tReg('parentAlert.alreadyRegistered', { entity: tReg('entities.province') })}</AlertTitle>
            <AlertDescription className="text-muted-foreground text-[11px] leading-relaxed">
              {tReg('parentAlert.alreadyRegisteredDesc', { name: currentName || '', id: duplicateId || 0 })}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Prefix ID (Full Width) */}
      <FormField
        control={form.control}
        name="prefix"
        render={({ field }) => (
          <FormItem>
            <FormFieldWrapper id="prov-prefix" label={t('table.prefix')} required error={form.formState.errors.prefix?.message}>
              <FormControl>
                <Input id="prov-prefix" placeholder={t('form.prefixPlaceholder')} disabled={isPending} {...field} />
              </FormControl>
            </FormFieldWrapper>
          </FormItem>
        )}
      />

      {/* Alias Name (Full Width) */}
      <FormField
        control={form.control}
        name="alias"
        render={({ field }) => (
          <FormItem>
            <FormFieldWrapper id="prov-alias" label={tReg('fields.alias')} error={form.formState.errors.alias?.message}>
              <FormControl>
                <Input id="prov-alias" placeholder={t('form.aliasPlaceholder')} disabled={isPending} {...field} />
              </FormControl>
            </FormFieldWrapper>
          </FormItem>
        )}
      />
    </>
  )
}

function toastInfo(msg: string) {
  import('sonner').then(({ toast }) => toast.info(msg))
}
