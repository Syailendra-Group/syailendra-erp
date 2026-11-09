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
import { useCountriesQuery } from '@/hooks/others/use-countries'
import { useProvincesQuery } from '@/hooks/others/use-provinces'
import { useCheckParentProvinceQuery, useCheckRegencyExistsQuery, useSaveRegencyMutation } from '@/hooks/others/use-regencies'
import { useCatalogRegenciesQuery } from '@/hooks/shared/use-regional-catalog'
import { getRegencyFormSchema } from '@/schemas/others/regency-schema'
import { filterForeignProvinces } from '@/utils/regional-helper'

import { ForeignRegencySection } from './foreign-section'

import type { RegencyFormValues } from '@/schemas/others/regency-schema'
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
    latitude: row?.latitude || 0,
    longitude: row?.longitude || 0
  }
}

export function RegencyForm({ currentRow, onSuccess, onValidationChange }: RegencyFormProps): ReactElement {
  const isEdit = !!currentRow
  const t = useTranslations('others.regencies')
  const tReg = useTranslations('regional.common')
  const tToast = useTranslations('regional.regionalToasts')
  const { mutateAsync: saveRegency, isPending } = useSaveRegencyMutation()

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
    }
  }

  const foreignCountries = useMemo(() => countries.filter((c) => c.id !== 100).map((c) => ({ label: c.name, value: String(c.id) })), [countries])
  const foreignProvinces = useMemo(() => allProvinces.filter((p) => p.country_id && p.country_id[0] !== 100), [allProvinces])

  const availableForeignProvinces = useMemo(() => filterForeignProvinces(allProvinces, selectedCountryId), [allProvinces, selectedCountryId])

  const handleSelectForeignProvince = (provIdStr: string) => {
    const provId = Number(provIdStr)
    form.setValue('state_id', provId, { shouldValidate: true })
    const found = foreignProvinces.find((p) => p.id === provId)
    if (found && found.country_id) {
      form.setValue('country_id', found.country_id[0], { shouldValidate: true })
    }
  }

  const handleSelectForeignCountry = (cntryIdStr: string) => {
    const cntryId = Number(cntryIdStr)
    form.setValue('country_id', cntryId, { shouldValidate: true })
    const currentProv = foreignProvinces.find((p) => p.id === selectedStateId)
    if (currentProv && currentProv.country_id && currentProv.country_id[0] !== cntryId) {
      form.setValue('state_id', undefined)
    }
  }

  const onSubmit = async (values: RegencyFormValues) => {
    if (isDomestic && isDuplicate) {
      toast.error(tToast('alreadyExists', { entity: tReg('entities.regency') }))
      return
    }
    if (isDomestic && isParentMissing && !values.auto_add_province) {
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
        toast.success(
          isEdit ? tToast('updateSuccess', { entity: tReg('entities.regency') }) : tToast('createSuccess', { entity: tReg('entities.regency') })
        )
        onSuccess()
        form.reset()
      } else {
        toast.error(res.error || tToast('saveFailed', { entity: tReg('entities.regency') }))
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tToast('genericError'))
    }
  }

  const catalogOptions = useMemo(
    () => catalogRegencies.map((r) => ({ label: `${r.name} - ${r.provinceName} (${r.code})`, value: r.code })),
    [catalogRegencies]
  )

  return (
    <Form {...form}>
      <form
        id="regency-action-form"
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
            <FormFieldWrapper id="catalog-regency" label={t('form.catalogLabel')} required>
              <SelectForm
                placeholder={
                  isLoadingCatalog ? tReg('placeholders.loadingCatalog', { entity: tReg('entities.regency') }) : t('form.catalogPlaceholder')
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
              parentLabel={tReg('parentAlert.parentProvince')}
              parentName={selectedProvName}
              entityTypeLabel={tReg('entities.regency')}
              parentTypeLabel={tReg('entities.province')}
              isChecking={isCheckingParent}
              exists={Boolean(parentStatus?.exists)}
              autoAdd={autoAddProvince}
              onAutoAddChange={(checked: boolean) => form.setValue('auto_add_province', checked)}
              isDuplicate={isDuplicate}
              duplicateId={regencyExists?.id}
              currentName={currentName}
            />

            <FormField
              control={form.control}
              name="alias"
              render={({ field }) => (
                <FormItem>
                  <FormFieldWrapper id="reg-alias" label={t('form.aliasLabel')} required error={form.formState.errors.alias?.message}>
                    <Input id="reg-alias" placeholder={t('form.aliasPlaceholder')} disabled={isPending} {...field} />
                  </FormFieldWrapper>
                </FormItem>
              )}
            />
          </>
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
                <Textarea
                  id="reg-desc"
                  rows={3}
                  placeholder={t('form.descPlaceholder') || tReg('placeholders.defaultNotes')}
                  disabled={isPending}
                  {...field}
                />
              </FormFieldWrapper>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
