'use client'

import { Building2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

import { INDONESIA_REGENCIES } from './options'

import type { RegencyFormValues } from '@/schemas/others/regency-schema'
import type { ProvinceRecord } from '@/types/others/province'
import type { ReactElement } from 'react'
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'

export interface IdentitySectionProps {
  register: UseFormRegister<RegencyFormValues>
  errors: FieldErrors<RegencyFormValues>
  watch: UseFormWatch<RegencyFormValues>
  setValue: UseFormSetValue<RegencyFormValues>
  provinces: ProvinceRecord[]
  isPending: boolean
  onProvinceSelectChange: (pName: string, pCode?: string) => void
}

export function IdentitySection({
  register,
  errors,
  watch,
  setValue,
  provinces,
  isPending,
  onProvinceSelectChange
}: IdentitySectionProps): ReactElement {
  const t = useTranslations('regional.regencies')
  const tCommon = useTranslations('regional.common')
  const isDomestic = watch('is_domestic')
  const currentName = watch('name')
  const currentStateId = watch('state_id')

  const handleSelectDomesticRegency = (regName: string) => {
    const found = INDONESIA_REGENCIES.find((r) => r.name === regName)
    if (found) {
      setValue('name', found.name, { shouldValidate: true })
      if (found.code) setValue('code', found.code)
      if (found.alias) setValue('alias', found.alias)
      if (found.latitude) setValue('latitude', found.latitude)
      if (found.longitude) setValue('longitude', found.longitude)

      setValue('province_name_raw', found.provinceName)
      setValue('province_code_raw', found.provinceCode)

      // Match province in existing Odoo provinces
      const matchProv = provinces.find((p) => p.name.toLowerCase().includes(found.provinceName.toLowerCase()))
      if (matchProv) {
        setValue('state_id', matchProv.id)
      } else {
        setValue('state_id', undefined)
      }

      onProvinceSelectChange(found.provinceName, found.provinceCode)
    }
  }

  return (
    <SectionCard
      title="Identitas Wilayah"
      description="Kabupaten, kota otonom, dan yurisdiksi provinsi induk"
      icon={Building2}
      contentClassName="space-y-4"
    >
      <div className="border-border/60 bg-muted/20 flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="is_domestic_reg" className="text-xs font-semibold">
            Wilayah Domestik (Indonesia)
          </Label>
          <p className="text-muted-foreground text-[11px]">Pilih dari katalog 514 kabupaten & kota resmi BPS</p>
        </div>
        <Switch id="is_domestic_reg" checked={isDomestic} onCheckedChange={(checked) => setValue('is_domestic', checked)} disabled={isPending} />
      </div>

      {isDomestic ? (
        <FormFieldWrapper id="domestic_regency" label="Kabupaten / Kota Indonesia" required error={errors.name?.message}>
          <SelectForm
            value={currentName}
            onValueChange={handleSelectDomesticRegency}
            placeholder="Pilih Kabupaten / Kota"
            disabled={isPending}
            items={INDONESIA_REGENCIES.map((r) => ({
              label: `${r.name} (${r.provinceName})`,
              value: r.name
            }))}
          />
        </FormFieldWrapper>
      ) : (
        <FormFieldWrapper id="name" label={t('table.name')} required error={errors.name?.message}>
          <Input id="name" placeholder="Nama Kabupaten / Kota / Distrik Asing" disabled={isPending} {...register('name')} />
        </FormFieldWrapper>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormFieldWrapper id="code" label={tCommon('code')}>
          <Input id="code" placeholder="Kode BPS (e.g. 33.23)" disabled={isPending} {...register('code')} />
        </FormFieldWrapper>

        <FormFieldWrapper id="alias" label={tCommon('alias')}>
          <Input id="alias" placeholder="Nama Alias (e.g. Temanggung)" disabled={isPending} {...register('alias')} />
        </FormFieldWrapper>
      </div>

      <FormFieldWrapper id="state_id" label="Provinsi Induk" required error={errors.state_id?.message}>
        <SelectForm
          value={currentStateId ? String(currentStateId) : undefined}
          onValueChange={(val) => {
            const num = Number(val)
            setValue('state_id', num, { shouldValidate: true })
            const p = provinces.find((x) => x.id === num)
            if (p) onProvinceSelectChange(p.name, p.code)
          }}
          placeholder="Pilih Provinsi Terdaftar"
          disabled={isPending}
          items={provinces.map((p) => ({
            label: p.name,
            value: String(p.id)
          }))}
        />
      </FormFieldWrapper>
    </SectionCard>
  )
}
