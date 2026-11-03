'use client'

import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { INDONESIA_PROVINCES } from '@/data/indonesia-regions/provinces'
import { useCountriesQuery } from '@/hooks/others/use-countries'
import { useSaveProvinceMutation } from '@/hooks/others/use-provinces'
import { provinceFormSchema } from '@/schemas/others/province-schema'

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
  const { mutateAsync: saveProvince, isPending } = useSaveProvinceMutation()
  const { data: countries = [] } = useCountriesQuery()

  const countryOptions = useMemo(() => countries.map((c) => ({ label: c.name, value: String(c.id) })), [countries])

  const form = useForm<ProvinceFormValues>({
    resolver: zodResolver(provinceFormSchema),
    defaultValues: {
      id: currentRow?.id,
      is_domestic: true,
      name: currentRow?.name || '',
      code: currentRow?.code || '',
      country_id: 100
    }
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        id: currentRow.id,
        is_domestic: currentRow.country_id ? currentRow.country_id[0] === 100 : true,
        name: currentRow.name,
        code: currentRow.code || '',
        country_id: currentRow.country_id ? currentRow.country_id[0] : 100
      })
    } else {
      form.reset({
        id: undefined,
        is_domestic: true,
        name: '',
        code: '',
        country_id: 100
      })
    }
  }, [currentRow, form])

  const isDomestic = form.watch('is_domestic')

  const handleSelectDomestic = (provCode: string) => {
    const found = INDONESIA_PROVINCES.find((p) => p.code === provCode)
    if (found) {
      form.setValue('name', found.name, { shouldValidate: true })
      form.setValue('code', found.code, { shouldValidate: true })
      form.setValue('country_id', 100, { shouldValidate: true })
    }
  }

  const onSubmit = async (values: ProvinceFormValues) => {
    try {
      const res = await saveProvince(values)
      if (res.success) {
        toast.success(isEdit ? 'Provinsi berhasil diperbarui' : 'Provinsi berhasil didaftarkan')
        onSuccess()
        form.reset()
      } else {
        toast.error(res.error || 'Gagal menyimpan provinsi')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan data')
    }
  }

  return (
    <Form {...form}>
      <form id="province-action-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
        {!isEdit && (
          <div className="border-border/60 flex items-center justify-between border-b pb-1">
            <span className="text-foreground text-xs font-semibold">{t('form.category')}</span>
            <Tabs
              value={isDomestic ? 'domestic' : 'foreign'}
              onValueChange={(val) => {
                const dom = val === 'domestic'
                form.setValue('is_domestic', dom)
                if (dom) form.setValue('country_id', 100)
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
        )}

        {!isEdit && isDomestic && (
          <FormFieldWrapper id="catalog-bps" label={t('form.catalogLabel')}>
            <SelectForm
              placeholder={t('form.catalogPlaceholder')}
              disabled={isPending}
              onValueChange={handleSelectDomestic}
              items={INDONESIA_PROVINCES.map((p) => ({
                label: `${p.name} (${p.code})`,
                value: p.code
              }))}
              onAddNew={() => {
                form.setValue('is_domestic', false)
                toast.info('Beralih ke mode input manual / luar negeri')
              }}
            />
          </FormFieldWrapper>
        )}

        {!isDomestic && (
          <FormFieldWrapper id="prov-country" label={t('form.foreignCountry')} required>
            <SelectForm
              placeholder={t('form.foreignCountryPlaceholder')}
              disabled={isPending}
              value={form.watch('country_id') ? String(form.watch('country_id')) : ''}
              onValueChange={(val) => form.setValue('country_id', Number(val))}
              items={countryOptions.filter((c) => c.value !== '100')}
            />
          </FormFieldWrapper>
        )}

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
      </form>
    </Form>
  )
}
