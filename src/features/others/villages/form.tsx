'use client'

import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { ParentEntityAlert } from '@/components/form/parent-entity-alert'
import { SelectForm } from '@/components/form/select-form'
import { Form, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useCheckParentDistrictQuery, useCheckVillageExistsQuery, useSaveVillageMutation } from '@/hooks/others/use-villages'
import { useCatalogDistrictsQuery, useCatalogVillagesQuery } from '@/hooks/shared/use-regional-catalog'
import { getVillageFormSchema } from '@/schemas/others/village-schema'

import { ForeignVillageSection } from './foreign-section'

import type { VillageFormValues } from '@/schemas/others/village-schema'
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
    latitude: row?.latitude || 0,
    longitude: row?.longitude || 0
  }
}

export function VillageForm({ currentRow, onSuccess, onValidationChange }: VillageFormProps): ReactElement {
  const isEdit = !!currentRow
  const t = useTranslations('others.villages')
  const tReg = useTranslations('regional.common')
  const tToast = useTranslations('regional.regionalToasts')
  const { mutateAsync: saveVillage, isPending } = useSaveVillageMutation()

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
      toast.error(tToast('alreadyExists', { entity: 'Kelurahan/Desa' }))
      return
    }
    if (isDomestic && isParentMissing && !values.auto_add_district) {
      toast.error(tToast('parentMissing', { parent: 'Kecamatan' }))
      return
    }
    if (!isDomestic && !values.district_id) {
      toast.error(tToast('foreignParentRequired', { parent: 'Kecamatan' }))
      return
    }

    try {
      const res = await saveVillage(values)
      if (res.success) {
        toast.success(isEdit ? tToast('updateSuccess', { entity: 'Kelurahan/Desa' }) : tToast('createSuccess', { entity: 'Kelurahan/Desa' }))
        onSuccess()
        form.reset()
      } else {
        toast.error(res.error || tToast('saveFailed', { entity: 'Kelurahan/Desa' }))
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
          if (firstKey) {
            toast.error(tToast('validationFailed', { message: errors[firstKey as keyof typeof errors]?.message || '' }))
          }
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
              if (dom) {
                form.setValue('country_id', 100)
              } else {
                form.setValue('country_id', undefined)
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

        {isDomestic ? (
          <>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <FormFieldWrapper id="catalog-dist-filter" label={t('form.selectDistrictCatalog')} required>
                <SelectForm
                  placeholder="Ketik & pilih kecamatan..."
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
            </div>

            <ParentEntityAlert
              parentLabel="Kecamatan Induk"
              parentName={selectedDistName}
              isChecking={isCheckingParent}
              exists={Boolean(parentStatus?.exists)}
              autoAdd={autoAddDistrict}
              onAutoAddChange={(checked) => form.setValue('auto_add_district', checked)}
              isDuplicate={isDuplicate}
              duplicateId={villageExists?.id}
              currentName={currentName}
              entityTypeLabel="Kelurahan/Desa"
              parentTypeLabel="Kecamatan"
            />

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
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
            </div>
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
                <Textarea id="vil-desc" rows={3} placeholder={t('form.descPlaceholder')} disabled={isPending} {...field} />
              </FormFieldWrapper>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
