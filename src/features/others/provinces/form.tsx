'use client'

import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useCountriesQuery } from '@/hooks/others/use-countries'
import { useCheckProvinceExistsQuery, useSaveProvinceMutation } from '@/hooks/others/use-provinces'
import { useCatalogProvincesQuery } from '@/hooks/shared/use-regional-catalog'
import { getProvinceFormSchema } from '@/schemas/others/province-schema'
import { getProvincePrefix } from '@/utils/regional-helper'

import type { ProvinceFormValues } from '@/schemas/others/province-schema'
import type { ProvinceRecord } from '@/types/others/province'
import type { ReactElement } from 'react'

export interface ProvinceFormProps {
  currentRow: ProvinceRecord | null
  onSuccess: () => void
}

export function ProvinceForm({ currentRow, onSuccess }: ProvinceFormProps): ReactElement {
  const isEdit = !!currentRow
  const t = useTranslations('others.provinces')
  const tReg = useTranslations('regional.common')
  const tToast = useTranslations('regional.regionalToasts')
  const { mutateAsync: saveProvince, isPending } = useSaveProvinceMutation()
  const { data: countries = [] } = useCountriesQuery()
  const { data: catalogProvinces = [], isLoading: isLoadingCatalog } = useCatalogProvincesQuery()

  const countryOptions = useMemo(() => countries.map((c) => ({ label: c.name, value: String(c.id) })), [countries])

  const form = useForm<ProvinceFormValues>({
    resolver: zodResolver(getProvinceFormSchema(t)),
    defaultValues: {
      id: currentRow?.id,
      is_domestic: currentRow?.country_id ? currentRow.country_id[0] === 100 : true,
      name: currentRow?.name || '',
      code: currentRow?.code || '',
      prefix: (currentRow?.prefix as string) || '',
      alias: (currentRow?.alias as string) || '',
      description: (currentRow?.description as string) || '',
      country_id: currentRow?.country_id ? currentRow.country_id[0] : 100
    }
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        id: currentRow.id,
        is_domestic: currentRow.country_id ? currentRow.country_id[0] === 100 : true,
        name: currentRow.name,
        code: currentRow.code || '',
        prefix: (currentRow.prefix as string) || getProvincePrefix(currentRow.name),
        alias: (currentRow.alias as string) || '',
        description: (currentRow.description as string) || '',
        country_id: currentRow.country_id ? currentRow.country_id[0] : 100
      })
    } else {
      form.reset({
        id: undefined,
        is_domestic: true,
        name: '',
        code: '',
        prefix: '',
        alias: '',
        description: '',
        country_id: 100
      })
    }
  }, [currentRow, form])

  const isDomestic = form.watch('is_domestic')
  const currentCode = form.watch('code')
  const currentName = form.watch('name')

  const { data: provinceExists } = useCheckProvinceExistsQuery(
    { code: currentCode, name: currentName },
    isDomestic && Boolean(currentCode) && !isEdit
  )
  const isDuplicate = isDomestic && !isEdit && Boolean(provinceExists?.exists)

  const handleSelectDomestic = (provCode: string) => {
    const found = catalogProvinces.find((p) => p.code === provCode)
    if (found) {
      form.setValue('name', found.name, { shouldValidate: true })
      form.setValue('code', found.code, { shouldValidate: true })
      form.setValue('prefix', getProvincePrefix(found.name), { shouldValidate: true })
      form.setValue('alias', found.name, { shouldValidate: true })
    }
  }

  const onSubmit = async (values: ProvinceFormValues) => {
    if (isDuplicate) {
      toast.error(tToast('alreadyExists', { entity: tReg('entities.province') }))
      return
    }
    try {
      const res = await saveProvince(values)
      if (res.success) {
        toast.success(
          isEdit ? tToast('updateSuccess', { entity: tReg('entities.province') }) : tToast('createSuccess', { entity: tReg('entities.province') })
        )
        onSuccess()
        form.reset()
      } else {
        toast.error(res.error || tToast('saveFailed', { entity: tReg('entities.province') }))
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tToast('genericError'))
    }
  }

  const catalogItems = useMemo(
    () =>
      catalogProvinces.map((p) => ({
        label: `${p.name} (${p.code})`,
        value: p.code
      })),
    [catalogProvinces]
  )

  return (
    <Form {...form}>
      <form id="province-action-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
        {/* Regional Category Tabs */}
        <div className="border-border/60 flex items-center justify-between border-b pb-1">
          <span className="text-foreground text-xs font-semibold">{t('form.category')}</span>
          <Tabs
            value={isDomestic ? 'domestic' : 'foreign'}
            onValueChange={(val) => {
              const dom = val === 'domestic'
              form.setValue('is_domestic', dom)
              if (dom) {
                form.setValue('country_id', 100)
              } else {
                const firstForeign = countryOptions.find((c) => c.value !== '100')
                if (firstForeign) form.setValue('country_id', Number(firstForeign.value))
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

        {/* Domestic Catalog Mode */}
        {isDomestic ? (
          <>
            <FormFieldWrapper id="catalog-bps" label={t('form.catalogLabel')} required>
              <SelectForm
                placeholder={
                  isLoadingCatalog ? tReg('placeholders.loadingCatalog', { entity: tReg('entities.province') }) : t('form.catalogPlaceholder')
                }
                disabled={isPending || isLoadingCatalog}
                value={currentCode || undefined}
                onValueChange={handleSelectDomestic}
                items={catalogItems}
                onAddNewClick={() => {
                  form.setValue('is_domestic', false)
                  toast.info(tToast('switchedToForeign'))
                }}
              />
            </FormFieldWrapper>

            {isDuplicate && (
              <Alert variant="destructive" className="border-destructive/30 bg-destructive/10 text-destructive py-2 text-xs">
                <AlertCircle className="size-4 shrink-0" />
                <div className="space-y-0.5">
                  <AlertTitle className="text-xs font-bold">
                    {tReg('parentAlert.alreadyRegistered', { entity: tReg('entities.province') })}
                  </AlertTitle>
                  <AlertDescription className="text-muted-foreground text-[11px] leading-relaxed">
                    {tReg('parentAlert.alreadyRegisteredDesc', { name: currentName || '', id: provinceExists?.id || 0 })}
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </>
        ) : (
          /* International Mode: Country Selection and Code Inputs */
          <>
            <FormFieldWrapper id="prov-country" label={t('form.foreignCountry')} required>
              <SelectForm
                placeholder={t('form.foreignCountryPlaceholder')}
                disabled={isPending}
                value={form.watch('country_id') ? String(form.watch('country_id')) : ''}
                onValueChange={(val) => form.setValue('country_id', Number(val))}
                items={countryOptions.filter((c) => c.value !== '100')}
              />
            </FormFieldWrapper>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormFieldWrapper id="prov-name" label={t('table.name')} required error={form.formState.errors.name?.message}>
                      <FormControl>
                        <Input id="prov-name" placeholder={t('form.namePlaceholder')} disabled={isPending} {...field} />
                      </FormControl>
                    </FormFieldWrapper>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormFieldWrapper id="prov-code" label={t('table.code')} required error={form.formState.errors.code?.message}>
                      <FormControl>
                        <Input id="prov-code" placeholder={t('form.codePlaceholder')} disabled={isPending} {...field} />
                      </FormControl>
                    </FormFieldWrapper>
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        {/* Prefix ID & Alias Name Grid */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
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
        </div>

        {/* Description and Notes Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormFieldWrapper id="prov-desc" label={tReg('fields.description')} error={form.formState.errors.description?.message}>
                <FormControl>
                  <Textarea id="prov-desc" rows={3} placeholder={tReg('placeholders.defaultNotes')} disabled={isPending} {...field} />
                </FormControl>
              </FormFieldWrapper>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
