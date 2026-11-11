'use client'

import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { ParentEntityAlert } from '@/components/form/parent-entity-alert'
import { SelectForm } from '@/components/form/select-form'
import { RegionalMapField } from '@/components/map/regional-map-field'
import { Form, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { INDONESIA_ALL_REGENCIES } from '@/data/indonesia-regions/regencies'
import { useCheckParentDistrictQuery, useCheckVillageExistsQuery, useSaveVillageMutation } from '@/hooks/others/use-villages'
import { useCatalogDistrictsQuery, useCatalogVillagesQuery } from '@/hooks/shared/use-regional-catalog'
import { getVillageFormSchema } from '@/schemas/others/village-schema'

import { ForeignVillageSection } from './foreign-section'

import type { VillageFormValues } from '@/schemas/others/village-schema'
import type { MapCoordinates } from '@/types/components/map'
import type { VillageRecord } from '@/types/others/village'
import type { ReactElement } from 'react'

export interface VillageFormProps {
  currentRow: VillageRecord | null
  onSuccess: () => void
  onValidationChange?: (canSubmit: boolean) => void
}

function getInitialValues(row: VillageRecord | null): VillageFormValues {
  return {
    id: row?.id,
    is_domestic: true,
    name: row?.name || '',
    code: (row?.code as string) || '',
    alias: (row?.alias as string) || '',
    description: (row?.description as string) || '',
    country_id: 100,
    state_id: undefined,
    city_id: row?.city_id ? row.city_id[0] : undefined,
    district_id: row?.district_id ? row.district_id[0] : undefined,
    district_name_raw: '',
    district_code_raw: '',
    regency_code_raw: '',
    province_code_raw: '',
    auto_add_district: true,
    zip_code: (row?.zip_code as string) || '',
    latitude: row?.latitude || undefined,
    longitude: row?.longitude || undefined
  }
}

export function VillageForm({ currentRow, onSuccess, onValidationChange }: VillageFormProps): ReactElement {
  const isEdit = !!currentRow
  const t = useTranslations('others.villages')
  const tReg = useTranslations('regional.common')
  const tToast = useTranslations('regional.regionalToasts')
  const tForeign = useTranslations('regional.foreignForm')
  const { mutateAsync: saveVillage, isPending } = useSaveVillageMutation()
  const [activeCentroid, setActiveCentroid] = useState<MapCoordinates | null>(null)

  const form = useForm<VillageFormValues>({
    resolver: zodResolver(getVillageFormSchema(t)),
    defaultValues: getInitialValues(currentRow)
  })

  useEffect(() => {
    form.reset(getInitialValues(currentRow))
  }, [currentRow, form])

  const isDomestic = form.watch('is_domestic')
  const selectedDistName = form.watch('district_name_raw') || ''
  const selectedDistCode = form.watch('district_code_raw') || ''
  const autoAddDistrict = form.watch('auto_add_district')
  const currentCode = form.watch('code')
  const currentName = form.watch('name')
  const lat = form.watch('latitude')
  const lng = form.watch('longitude')

  const { data: catalogDistricts = [] } = useCatalogDistrictsQuery({ enabled: isDomestic })
  const { data: catalogVillages = [], isLoading: isLoadingCatalog } = useCatalogVillagesQuery({
    districtCode: selectedDistCode || undefined,
    enabled: isDomestic && Boolean(selectedDistCode)
  })

  const { data: parentStatus, isLoading: isCheckingParent } = useCheckParentDistrictQuery(
    selectedDistName,
    selectedDistCode,
    isDomestic && Boolean(selectedDistName)
  )

  const { data: villageExists } = useCheckVillageExistsQuery({ code: currentCode, name: currentName }, isDomestic && Boolean(currentCode) && !isEdit)
  const isDuplicate = isDomestic && !isEdit && Boolean(villageExists?.exists)

  useEffect(() => {
    if (isDomestic && parentStatus?.exists && parentStatus.id) {
      form.setValue('district_id', parentStatus.id, { shouldValidate: true })
    } else if (isDomestic && parentStatus && !parentStatus.exists) {
      form.setValue('district_id', undefined)
    }
  }, [isDomestic, parentStatus, form])

  const isParentMissing = isDomestic && Boolean(selectedDistName) && Boolean(parentStatus) && !parentStatus?.exists
  const isSubmitDisabled = isPending || (isParentMissing && !autoAddDistrict) || isDuplicate

  useEffect(() => {
    onValidationChange?.(!isSubmitDisabled)
  }, [isSubmitDisabled, onValidationChange])

  const handleSelectDistrict = (distCode: string) => {
    const found = catalogDistricts.find((d) => d.code === distCode)
    if (found) {
      form.setValue('district_name_raw', found.name, { shouldValidate: true })
      form.setValue('district_code_raw', found.code, { shouldValidate: true })
      form.setValue('regency_code_raw', found.regencyCode, { shouldValidate: true })
      form.setValue('province_code_raw', found.provinceCode, { shouldValidate: true })
      form.setValue('country_id', 100, { shouldValidate: true })
      form.setValue('code', '', { shouldValidate: true })
      form.setValue('name', '', { shouldValidate: true })
      form.setValue('alias', '', { shouldValidate: true })

      const regCurated = INDONESIA_ALL_REGENCIES.find((r) => r.code === found.regencyCode)
      if (regCurated && regCurated.latitude && regCurated.longitude) {
        form.setValue('latitude', regCurated.latitude, { shouldValidate: true, shouldDirty: true })
        form.setValue('longitude', regCurated.longitude, { shouldValidate: true, shouldDirty: true })
        setActiveCentroid({ latitude: regCurated.latitude, longitude: regCurated.longitude, zoom: 13 })
      }
    }
  }

  const handleSelectVillage = (vilCode: string) => {
    const found = catalogVillages.find((v) => v.code === vilCode)
    if (found) {
      form.setValue('name', found.name, { shouldValidate: true })
      form.setValue('code', found.code, { shouldValidate: true })
      form.setValue('alias', found.alias, { shouldValidate: true })
    }
  }

  const onSubmit = async (values: VillageFormValues) => {
    if (isDomestic && isDuplicate) {
      toast.error(tToast('alreadyExists', { entity: tReg('entities.village') }))
      return
    }
    if (isDomestic && isParentMissing && !values.auto_add_district) {
      toast.error(tToast('parentMissing', { parent: tReg('entities.district') }))
      return
    }
    if (!isDomestic && !values.district_id) {
      toast.error(tToast('foreignParentRequired', { parent: tReg('entities.district') }))
      return
    }
    try {
      const res = await saveVillage(values)
      if (res.success) {
        toast.success(
          isEdit ? tToast('updateSuccess', { entity: tReg('entities.village') }) : tToast('createSuccess', { entity: tReg('entities.village') })
        )
        onSuccess()
        form.reset()
      } else {
        toast.error(res.error || tToast('saveFailed', { entity: tReg('entities.village') }))
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tToast('genericError'))
    }
  }

  const districtCatalogOptions = useMemo(() => catalogDistricts.map((d) => ({ label: `${d.name} (${d.code})`, value: d.code })), [catalogDistricts])
  const villageCatalogOptions = useMemo(() => catalogVillages.map((v) => ({ label: `${v.name} (${v.code})`, value: v.code })), [catalogVillages])

  return (
    <Form {...form}>
      <form
        id="village-action-form"
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          const firstKey = Object.keys(errors)[0]
          if (firstKey) toast.error(tToast('validationFailed', { message: errors[firstKey as keyof typeof errors]?.message || '' }))
        })}
        className="space-y-4 px-1"
      >
        <div className="border-border/60 flex items-center justify-between border-b pb-1">
          <span className="text-foreground text-xs font-semibold">{tReg('category')}</span>
          <Tabs
            value={isDomestic ? 'domestic' : 'foreign'}
            onValueChange={(val) => {
              const dom = val === 'domestic'
              form.setValue('is_domestic', dom)
              form.setValue('country_id', dom ? 100 : undefined)
              if (!dom) {
                form.setValue('state_id', undefined)
                form.setValue('city_id', undefined)
                form.setValue('district_id', undefined)
              }
            }}
          >
            <TabsList className="h-7 text-xs">
              <TabsTrigger value="domestic" className="px-2.5 text-xs">
                {tReg('domesticCatalog')}
              </TabsTrigger>
              <TabsTrigger value="foreign" className="px-2.5 text-xs">
                {tReg('foreignManual')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
          {/* Left Column: Administrative Details (stacked 1-per-line, zero grid) */}
          <div className="space-y-3.5">
            {isDomestic ? (
              <>
                <FormFieldWrapper id="catalog-dist-filter" label={t('form.selectDistrictCatalog')} required>
                  <SelectForm
                    placeholder={tForeign('selectDistrictCatalogPlaceholder')}
                    value={selectedDistCode || undefined}
                    onValueChange={handleSelectDistrict}
                    items={districtCatalogOptions}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper id="catalog-village" label={t('form.selectVillageCatalog')} required>
                  <SelectForm
                    placeholder={
                      !selectedDistCode
                        ? t('form.selectDistrictFirst')
                        : isLoadingCatalog
                          ? t('form.loadingVillages')
                          : t('form.selectVillagePlaceholder')
                    }
                    disabled={isPending || !selectedDistCode || isLoadingCatalog}
                    value={currentCode || undefined}
                    onValueChange={handleSelectVillage}
                    items={villageCatalogOptions}
                  />
                </FormFieldWrapper>

                <ParentEntityAlert
                  parentLabel={tReg('parentAlert.parentDistrict')}
                  parentName={selectedDistName}
                  isChecking={isCheckingParent}
                  exists={Boolean(parentStatus?.exists)}
                  autoAdd={autoAddDistrict}
                  onAutoAddChange={(checked) => form.setValue('auto_add_district', checked)}
                  isDuplicate={isDuplicate}
                  duplicateId={villageExists?.id}
                  currentName={currentName}
                  entityTypeLabel={tReg('entities.village')}
                  parentTypeLabel={tReg('entities.district')}
                />

                <FormField
                  control={form.control}
                  name="zip_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper id="vil-zip" label={t('form.zipLabel')} error={form.formState.errors.zip_code?.message}>
                        <Input id="vil-zip" placeholder={t('form.zipPlaceholder')} disabled={isPending} {...field} />
                      </FormFieldWrapper>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alias"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper id="vil-alias" label={t('form.aliasLabel')} required error={form.formState.errors.alias?.message}>
                        <Input id="vil-alias" placeholder={t('form.aliasPlaceholder')} disabled={isPending} {...field} />
                      </FormFieldWrapper>
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <ForeignVillageSection form={form} isPending={isPending} t={t} />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormFieldWrapper id="vil-desc" label={t('form.descLabel')} error={form.formState.errors.description?.message}>
                    <Textarea id="vil-desc" rows={2} placeholder={t('form.descPlaceholder')} disabled={isPending} {...field} />
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
