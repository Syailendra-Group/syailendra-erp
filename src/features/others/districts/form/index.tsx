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
import { useCheckDistrictExistsQuery, useCheckParentRegencyQuery, useSaveDistrictMutation } from '@/hooks/others/use-districts'
import { useCatalogDistrictsQuery, useCatalogRegenciesQuery } from '@/hooks/shared/use-regional-catalog'
import { getDistrictFormSchema } from '@/schemas/others/district-schema'

import { ForeignDistrictSection } from './foreign-section'

import type { DistrictFormValues } from '@/schemas/others/district-schema'
import type { DistrictRecord } from '@/types/others/district'
import type { ReactElement } from 'react'

export interface DistrictFormProps {
  currentRow: DistrictRecord | null
  onSuccess: () => void
  onValidationChange?: (canSubmit: boolean) => void
}

function getInitialValues(row: DistrictRecord | null): DistrictFormValues {
  return {
    id: row?.id,
    is_domestic: row?.country_id ? row.country_id[0] === 100 : true,
    name: row?.name || '',
    code: (row?.code as string) || '',
    alias: (row?.alias as string) || '',
    description: (row?.description as string) || '',
    country_id: row?.country_id ? row.country_id[0] : 100,
    state_id: row?.state_id ? row.state_id[0] : undefined,
    city_id: row?.city_id ? row.city_id[0] : undefined,
    regency_name_raw: '',
    regency_code_raw: '',
    province_name_raw: '',
    province_code_raw: '',
    auto_add_regency: true,
    latitude: row?.latitude || 0,
    longitude: row?.longitude || 0
  }
}

export function DistrictForm({ currentRow, onSuccess, onValidationChange }: DistrictFormProps): ReactElement {
  const isEdit = !!currentRow
  const t = useTranslations('others.districts')
  const tReg = useTranslations('regional.common')
  const tToast = useTranslations('regional.regionalToasts')
  const { mutateAsync: saveDistrict, isPending } = useSaveDistrictMutation()

  const form = useForm<DistrictFormValues>({
    resolver: zodResolver(getDistrictFormSchema(t)),
    defaultValues: getInitialValues(currentRow)
  })

  useEffect(() => {
    form.reset(getInitialValues(currentRow))
  }, [currentRow, form])

  const isDomestic = form.watch('is_domestic')
  const { data: catalogDistricts = [], isLoading: isLoadingCatalog } = useCatalogDistrictsQuery()
  const { data: catalogRegencies = [] } = useCatalogRegenciesQuery({ enabled: isDomestic })
  const selectedRegName = form.watch('regency_name_raw') || ''
  const selectedRegCode = form.watch('regency_code_raw') || ''
  const autoAddRegency = form.watch('auto_add_regency')
  const currentCode = form.watch('code')
  const currentName = form.watch('name')

  const { data: parentStatus, isLoading: isCheckingParent } = useCheckParentRegencyQuery(
    selectedRegName,
    selectedRegCode,
    isDomestic && Boolean(selectedRegName)
  )

  const { data: districtExists } = useCheckDistrictExistsQuery(
    { code: currentCode, name: currentName },
    isDomestic && Boolean(currentCode) && !isEdit
  )
  const isDuplicate = isDomestic && !isEdit && Boolean(districtExists?.exists)

  useEffect(() => {
    if (isDomestic && parentStatus?.exists && parentStatus.id) {
      form.setValue('city_id', parentStatus.id, { shouldValidate: true })
    } else if (isDomestic && parentStatus && !parentStatus.exists) {
      form.setValue('city_id', undefined)
    }
  }, [isDomestic, parentStatus, form])

  const isParentMissing = isDomestic && Boolean(selectedRegName) && Boolean(parentStatus) && !parentStatus?.exists
  const isSubmitDisabled = isPending || (isParentMissing && !autoAddRegency) || isDuplicate

  useEffect(() => {
    onValidationChange?.(!isSubmitDisabled)
  }, [isSubmitDisabled, onValidationChange])

  const handleSelectDomestic = (distCode: string) => {
    const found = catalogDistricts.find((d) => d.code === distCode)
    if (found) {
      form.setValue('name', found.name, { shouldValidate: true })
      form.setValue('code', found.code, { shouldValidate: true })
      form.setValue('alias', found.alias, { shouldValidate: true })
      form.setValue('regency_code_raw', found.regencyCode, { shouldValidate: true })
      form.setValue('province_code_raw', found.provinceCode, { shouldValidate: true })
      form.setValue('country_id', 100, { shouldValidate: true })

      const reg = catalogRegencies.find((r) => r.code === found.regencyCode)
      if (reg) {
        form.setValue('regency_name_raw', reg.name, { shouldValidate: true })
      }
    }
  }

  const onSubmit = async (values: DistrictFormValues) => {
    if (isDomestic && isDuplicate) {
      toast.error(tToast('alreadyExists', { entity: tReg('entities.district') }))
      return
    }
    if (isDomestic && isParentMissing && !values.auto_add_regency) {
      toast.error(tToast('parentMissing', { parent: tReg('entities.regency') }))
      return
    }
    if (!isDomestic && !values.city_id) {
      toast.error(tToast('foreignParentRequired', { parent: tReg('entities.regency') }))
      return
    }

    try {
      const res = await saveDistrict(values)
      if (res.success) {
        toast.success(
          isEdit ? tToast('updateSuccess', { entity: tReg('entities.district') }) : tToast('createSuccess', { entity: tReg('entities.district') })
        )
        onSuccess()
        form.reset()
      } else {
        toast.error(res.error || tToast('saveFailed', { entity: tReg('entities.district') }))
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tToast('genericError'))
    }
  }

  const catalogOptions = useMemo(() => {
    const regMap = new Map<string, string>()
    catalogRegencies.forEach((r) => regMap.set(r.code, r.name))
    return catalogDistricts.map((d) => {
      const regName = regMap.get(d.regencyCode)
      const label = regName ? `${d.name} - ${regName} (${d.code})` : `${d.name} (${d.code})`
      return { label, value: d.code }
    })
  }, [catalogDistricts, catalogRegencies])

  return (
    <Form {...form}>
      <form
        id="district-action-form"
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
            <FormFieldWrapper id="catalog-district" label={t('form.catalogLabel')} required>
              <SelectForm
                placeholder={
                  isLoadingCatalog ? tReg('placeholders.loadingCatalog', { entity: tReg('entities.district') }) : t('form.catalogPlaceholder')
                }
                disabled={isPending || isLoadingCatalog}
                value={currentCode || undefined}
                onValueChange={handleSelectDomestic}
                items={catalogOptions}
                onAddNewClick={() => {
                  form.setValue('is_domestic', false)
                  toast.info(tToast('switchedToForeign'))
                }}
              />
            </FormFieldWrapper>

            <ParentEntityAlert
              parentLabel={tReg('parentAlert.parentRegency')}
              parentName={selectedRegName}
              isChecking={isCheckingParent}
              exists={Boolean(parentStatus?.exists)}
              autoAdd={autoAddRegency}
              onAutoAddChange={(checked) => form.setValue('auto_add_regency', checked)}
              isDuplicate={isDuplicate}
              duplicateId={districtExists?.id}
              currentName={currentName}
              entityTypeLabel={tReg('entities.district')}
              parentTypeLabel={tReg('entities.regency')}
            />

            <FormField
              control={form.control}
              name="alias"
              render={({ field }) => (
                <FormItem>
                  <FormFieldWrapper id="dist-alias" label={t('form.aliasLabel')} required error={form.formState.errors.alias?.message}>
                    <Input id="dist-alias" placeholder={t('form.aliasPlaceholder')} disabled={isPending} {...field} />
                  </FormFieldWrapper>
                </FormItem>
              )}
            />
          </>
        ) : (
          <ForeignDistrictSection form={form} isPending={isPending} t={t} />
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormFieldWrapper id="dist-desc" label={t('form.descLabel')} error={form.formState.errors.description?.message}>
                <Textarea id="dist-desc" rows={3} placeholder={t('form.descPlaceholder')} disabled={isPending} {...field} />
              </FormFieldWrapper>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
