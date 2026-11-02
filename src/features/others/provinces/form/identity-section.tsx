'use client'

import { Landmark } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

import { INDONESIA_PROVINCES } from './options'

import type { ProvinceFormValues } from '@/schemas/others/province-schema'
import type { ReactElement } from 'react'
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'

export interface IdentitySectionProps {
  register: UseFormRegister<ProvinceFormValues>
  errors: FieldErrors<ProvinceFormValues>
  watch: UseFormWatch<ProvinceFormValues>
  setValue: UseFormSetValue<ProvinceFormValues>
  isPending: boolean
}

export function IdentitySection({ register, errors, watch, setValue, isPending }: IdentitySectionProps): ReactElement {
  const t = useTranslations('regional.provinces')
  const tCommon = useTranslations('regional.common')
  const isDomestic = watch('is_domestic')
  const currentName = watch('name')

  const handleSelectDomestic = (selectedName: string) => {
    const found = INDONESIA_PROVINCES.find((p) => p.name === selectedName)
    if (found) {
      setValue('name', found.name, { shouldValidate: true })
      setValue('code', found.code, { shouldValidate: true })
      if (found.alias) setValue('alias', found.alias)
    }
  }

  return (
    <SectionCard
      title="Identitas Provinsi"
      description="Yurisdiksi teritorial provinsi dan kode standar wilayah"
      icon={Landmark}
      contentClassName="space-y-4"
    >
      <div className="border-border/60 bg-muted/20 flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="is_domestic" className="text-xs font-semibold">
            Wilayah Domestik (Indonesia)
          </Label>
          <p className="text-muted-foreground text-[11px]">Aktifkan untuk memilih 38 provinsi resmi Republik Indonesia</p>
        </div>
        <Switch id="is_domestic" checked={isDomestic} onCheckedChange={(checked) => setValue('is_domestic', checked)} disabled={isPending} />
      </div>

      {isDomestic ? (
        <FormFieldWrapper id="domestic_province" label="Provinsi Indonesia" required error={errors.name?.message}>
          <SelectForm
            value={currentName}
            onValueChange={handleSelectDomestic}
            placeholder="Pilih 38 Provinsi Resmi"
            disabled={isPending}
            items={INDONESIA_PROVINCES.map((p) => ({
              label: `${p.name} (${p.code})`,
              value: p.name
            }))}
          />
        </FormFieldWrapper>
      ) : (
        <FormFieldWrapper id="name" label={t('table.name')} required error={errors.name?.message}>
          <Input id="name" placeholder="Nama State / Province Internasional" disabled={isPending} {...register('name')} />
        </FormFieldWrapper>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormFieldWrapper id="code" label={tCommon('code')} required error={errors.code?.message}>
          <Input id="code" placeholder="Kode (e.g. JT / CA)" disabled={isPending} {...register('code')} />
        </FormFieldWrapper>

        <FormFieldWrapper id="alias" label={tCommon('alias')}>
          <Input id="alias" placeholder="Alias (e.g. Jateng)" disabled={isPending} {...register('alias')} />
        </FormFieldWrapper>
      </div>

      <FormFieldWrapper id="description" label={tCommon('description')}>
        <Input id="description" placeholder="Catatan sentra pertanian atau komoditas" disabled={isPending} {...register('description')} />
      </FormFieldWrapper>
    </SectionCard>
  )
}
