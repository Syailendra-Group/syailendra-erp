'use client'

import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { RegionalMapField } from '@/components/map/regional-map-field'
import { Form, FormField, FormItem } from '@/components/ui/form'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { INDONESIA_ALL_REGENCIES } from '@/data/indonesia-regions/regencies'
import { useCountriesQuery } from '@/hooks/others/use-countries'
import { useProvincesQuery } from '@/hooks/others/use-provinces'
import { useCheckParentProvinceQuery, useCheckRegencyExistsQuery, useSaveRegencyMutation } from '@/hooks/others/use-regencies'
import { useCatalogRegenciesQuery } from '@/hooks/shared/use-regional-catalog'
import { getRegencyFormSchema } from '@/schemas/others/regency-schema'
import { filterForeignProvinces, getProvinceCentroid } from '@/utils/regional-helper'

import { DomesticRegencySection } from './domestic-section'
import { ForeignRegencySection } from './foreign-section'

import type { RegencyFormValues } from '@/schemas/others/regency-schema'
import type { MapCoordinates } from '@/types/components/map'
import type { RegencyRecord } from '@/types/others/regency'
import type { ReactElement } from 'react'

export interface RegencyFormProps {
  currentRow: RegencyRecord | null
  onSuccess: () => void
  onValidationChange?: (canSubmit: boolean) => void
}

function getInitialValues(row: RegencyRecord | null): RegencyFormValues {
  return {
    id: row?.id,
    is_domestic: row?.country_id ? row.country_id[0] === 100 : true,
    name: row?.name || '',
    code: (row?.code as string) || '',
    alias: (row?.alias as string) || '',
    description: (row?.description as string) || '',
    country_id: row?.country_id ? row.country_id[0] : 100,
    state_id: row?.state_id ? row.state_id[0] : undefined,
    province_name_raw: '',
    province_code_raw: '',
    auto_add_province: true,
    latitude: row?.latitude || undefined,
    longitude: row?.longitude || undefined
  }
}

export function RegencyForm({ currentRow, onSuccess, onValidationChange }: RegencyFormProps): ReactElement {
  const isEdit = !!currentRow
  const t = useTranslations('others.regencies')
  const tReg = useTranslations('regional.common')
  const tToast = useTranslations('regional.regionalToasts')
  const { mutateAsync: saveRegency, isPending } = useSaveRegencyMutation()
  const [activeCentroid, setActiveCentroid] = useState<MapCoordinates | null>(null)

  const { data: countries = [] } = useCountriesQuery()
  const { data: allProvinces = [] } = useProvincesQuery()
  const { data: catalogRegencies = [], isLoading: isLoadingCatalog } = useCatalogRegenciesQuery()

  const form = useForm<RegencyFormValues>({
    resolver: zodResolver(getRegencyFormSchema(t)),
    defaultValues: getInitialValues(currentRow)
  })

  useEffect(() => {
    form.reset(getInitialValues(currentRow))
  }, [currentRow, form])

  const isDomestic = form.watch('is_domestic')
  const selectedCountryId = form.watch('country_id')
  const selectedStateId = form.watch('state_id')
  const selectedProvName = form.watch('province_name_raw') || ''
  const selectedProvCode = form.watch('province_code_raw') || ''
  const autoAddProvince = form.watch('auto_add_province')
  const currentCode = form.watch('code')
  const currentName = form.watch('name')
  const lat = form.watch('latitude')
  const lng = form.watch('longitude')

  const { data: parentStatus, isLoading: isCheckingParent } = useCheckParentProvinceQuery(
    selectedProvName,
    selectedProvCode,
    isDomestic && Boolean(selectedProvName)
  )

  const { data: regencyExists } = useCheckRegencyExistsQuery({ code: currentCode, name: currentName }, isDomestic && Boolean(currentCode) && !isEdit)
  const isDuplicate = isDomestic && !isEdit && Boolean(regencyExists?.exists)

  useEffect(() => {
    if (isDomestic && parentStatus?.exists && parentStatus.id) {
      form.setValue('state_id', parentStatus.id, { shouldValidate: true })
    } else if (isDomestic && parentStatus && !parentStatus.exists) {
      form.setValue('state_id', undefined)
    }
  }, [isDomestic, parentStatus, form])

  const isParentMissing = isDomestic && Boolean(selectedProvName) && Boolean(parentStatus) && !parentStatus?.exists
  const isSubmitDisabled = isPending || (isParentMissing && !autoAddProvince) || isDuplicate

  useEffect(() => {
    onValidationChange?.(!isSubmitDisabled)
  }, [isSubmitDisabled, onValidationChange])

  const handleSelectDomestic = (regCode: string) => {
    const found = catalogRegencies.find((r) => r.code === regCode)
    if (found) {
      const { name, code, alias, provinceName, provinceCode } = found
      form.setValue('name', name, { shouldValidate: true })
      form.setValue('code', code, { shouldValidate: true })
      form.setValue('alias', alias, { shouldValidate: true })
      form.setValue('province_name_raw', provinceName, { shouldValidate: true })
      form.setValue('province_code_raw', provinceCode, { shouldValidate: true })
      form.setValue('country_id', 100, { shouldValidate: true })

      const curated = INDONESIA_ALL_REGENCIES.find((r) => r.code === regCode)
      if (curated && curated.latitude && curated.longitude) {
        form.setValue('latitude', curated.latitude, { shouldValidate: true, shouldDirty: true })
        form.setValue('longitude', curated.longitude, { shouldValidate: true, shouldDirty: true })
        setActiveCentroid({ latitude: curated.latitude, longitude: curated.longitude, zoom: 11 })
      } else {
        const provCentroid = getProvinceCentroid(provinceName)
        if (provCentroid) {
          form.setValue('latitude', provCentroid.latitude, { shouldValidate: true, shouldDirty: true })
          form.setValue('longitude', provCentroid.longitude, { shouldValidate: true, shouldDirty: true })
          setActiveCentroid({ ...provCentroid, zoom: 8 })
        }
      }
    }
  }

  const foreignCountries = useMemo(() => countries.filter((c) => c.id !== 100).map((c) => ({ label: c.name, value: String(c.id) })), [countries])
  const foreignProvinces = useMemo(() => allProvinces.filter((p) => p.country_id && p.country_id[0] !== 100), [allProvinces])
  const availableForeignProvinces = useMemo(() => filterForeignProvinces(allProvinces, selectedCountryId), [allProvinces, selectedCountryId])

  const handleSelectForeignCountry = (countryIdStr: string) => {
    const countryId = Number(countryIdStr)
    form.setValue('country_id', countryId, { shouldValidate: true })
    form.setValue('state_id', undefined)
  }

  const handleSelectForeignProvince = (provIdStr: string) => {
    const provId = Number(provIdStr)
    form.setValue('state_id', provId, { shouldValidate: true })
    const found = foreignProvinces.find((p) => p.id === provId)
    if (found?.country_id) {
      form.setValue('country_id', found.country_id[0], { shouldValidate: true })
    }
  }

  const onSubmit = async (values: RegencyFormValues) => {
    if (isDuplicate) {
      toast.error(tToast('alreadyExists', { entity: tReg('entities.regency') }))
      return
    }
    if (isParentMissing && !autoAddProvince) {
      toast.error(tToast('parentMissing', { parent: tReg('entities.province') }))
      return
    }
    if (!isDomestic && !values.state_id) {
      toast.error(tToast('foreignParentRequired', { parent: tReg('entities.province') }))
      return
    }
    try {
      const res = await saveRegency(values)
      if (res.success) {
        toast.success(isEdit ? tToast('updateSuccess', { entity: tReg('entities.regency') }) : tToast('createSuccess', { entity: tReg('entities.regency') }))
        onSuccess()
        form.reset()
      } else {
        toast.error(res.error || tToast('saveFailed', { entity: tReg('entities.regency') }))
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tToast('genericError'))
    }
  }

  const catalogOptions = useMemo(() => catalogRegencies.map((r) => ({ label: `${r.name} (${r.provinceName})`, value: r.code })), [catalogRegencies])

  return (
    <Form {...form}>
      <form id="regency-action-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
        <div className="border-border/60 flex items-center justify-between border-b pb-1">
          <span className="text-foreground text-xs font-semibold">{t('form.category')}</span>
          <Tabs
            value={isDomestic ? 'domestic' : 'foreign'}
            onValueChange={(val) => {
              const dom = val === 'domestic'
              form.setValue('is_domestic', dom)
              form.setValue('country_id', dom ? 100 : Number(foreignCountries[0]?.value || 100))
              form.setValue('state_id', undefined)
            }}
          >
            <TabsList className="h-7 text-xs">
              <TabsTrigger value="domestic" className="px-2.5 text-xs">{tReg('domesticCatalog')}</TabsTrigger>
              <TabsTrigger value="foreign" className="px-2.5 text-xs">{tReg('foreignManual')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
          {/* Left Column: Administrative Details (stacked 1-per-line, zero grid) */}
          <div className="space-y-3.5">
            {isDomestic ? (
              <DomesticRegencySection
                form={form}
                isPending={isPending}
                isLoadingCatalog={isLoadingCatalog}
                currentCode={currentCode}
                currentName={currentName}
                catalogOptions={catalogOptions}
                selectedProvName={selectedProvName}
                parentStatus={parentStatus}
                isCheckingParent={isCheckingParent}
                autoAddProvince={autoAddProvince}
                isDuplicate={isDuplicate}
                duplicateId={regencyExists?.id}
                onSelectDomestic={handleSelectDomestic}
                t={t}
                tReg={tReg}
                tToast={tToast}
              />
            ) : (
              <ForeignRegencySection
                form={form}
                isPending={isPending}
                foreignCountries={foreignCountries}
                availableForeignProvinces={availableForeignProvinces}
                selectedCountryId={selectedCountryId}
                selectedStateId={selectedStateId}
                onCountryChange={handleSelectForeignCountry}
                onProvinceChange={handleSelectForeignProvince}
                t={t}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormFieldWrapper id="reg-desc" label={t('form.descLabel')} error={form.formState.errors.description?.message}>
                    <Textarea id="reg-desc" rows={2} placeholder={t('form.descPlaceholder') || tReg('placeholders.defaultNotes')} disabled={isPending} {...field} />
                  </FormFieldWrapper>
                </FormItem>
              )}
            />
          </div>

          {/* Right Column: Interactive MapPicker */}
          <div className="border-border/60 bg-muted/10 rounded-lg border p-3">
            <RegionalMapField
              latitude={lat}
              longitude={lng}
              centroidPan={activeCentroid}
              disabled={isPending}
              onLocationChange={({ latitude, longitude }) => {
                form.setValue('latitude', latitude, { shouldValidate: true, shouldDirty: true })
                form.setValue('longitude', longitude, { shouldValidate: true, shouldDirty: true })
              }}
            />
          </div>
        </div>
      </form>
    </Form>
  )
}
