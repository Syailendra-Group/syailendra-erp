'use client'

import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { INDONESIA_ALL_REGENCIES } from '@/data/indonesia-regions/regencies'
import { useCheckParentProvinceQuery, useSaveRegencyMutation } from '@/hooks/others/use-regencies'
import { regencyFormSchema } from '@/schemas/others/regency-schema'

import type { RegencyFormValues } from '@/schemas/others/regency-schema'
import type { RegencyRecord } from '@/types/others/regency'
import type { ReactElement } from 'react'

export interface RegencyFormProps {
  currentRow: RegencyRecord | null
  onSuccess: () => void
}

export function RegencyForm({ currentRow, onSuccess }: RegencyFormProps): ReactElement {
  const isEdit = !!currentRow
  const t = useTranslations('others.regencies')
  const tReg = useTranslations('regional.common')
  const { mutateAsync: saveRegency, isPending } = useSaveRegencyMutation()

  const form = useForm<RegencyFormValues>({
    resolver: zodResolver(regencyFormSchema),
    defaultValues: {
      id: currentRow?.id,
      is_domestic: true,
      name: currentRow?.name || '',
      code: (currentRow?.code as string) || '',
      alias: (currentRow?.alias as string) || '',
      description: (currentRow?.description as string) || '',
      country_id: 100,
      state_id: currentRow?.state_id ? currentRow.state_id[0] : undefined,
      province_name_raw: '',
      province_code_raw: '',
      auto_add_province: true,
      latitude: currentRow?.latitude || -7.321,
      longitude: currentRow?.longitude || 110.123
    }
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        id: currentRow.id,
        is_domestic: true,
        name: currentRow.name,
        code: (currentRow.code as string) || '',
        alias: (currentRow.alias as string) || '',
        description: (currentRow.description as string) || '',
        country_id: 100,
        state_id: currentRow.state_id ? currentRow.state_id[0] : undefined,
        province_name_raw: '',
        province_code_raw: '',
        auto_add_province: true,
        latitude: currentRow.latitude || -7.321,
        longitude: currentRow.longitude || 110.123
      })
    } else {
      form.reset({
        id: undefined,
        is_domestic: true,
        name: '',
        code: '',
        alias: '',
        description: '',
        country_id: 100,
        state_id: undefined,
        province_name_raw: '',
        province_code_raw: '',
        auto_add_province: true,
        latitude: -7.321,
        longitude: 110.123
      })
    }
  }, [currentRow, form])

  const isDomestic = form.watch('is_domestic')
  const selectedProvName = form.watch('province_name_raw') || ''
  const selectedProvCode = form.watch('province_code_raw') || ''
  const autoAddProvince = form.watch('auto_add_province')

  const { data: parentStatus, isLoading: isCheckingParent } = useCheckParentProvinceQuery(selectedProvName, selectedProvCode)

  useEffect(() => {
    if (parentStatus?.exists && parentStatus.id) {
      form.setValue('state_id', parentStatus.id, { shouldValidate: true })
    } else if (parentStatus && !parentStatus.exists) {
      form.setValue('state_id', undefined)
    }
  }, [parentStatus, form])

  const handleSelectDomestic = (regCode: string) => {
    const found = INDONESIA_ALL_REGENCIES.find((r) => r.code === regCode)
    if (found) {
      form.setValue('name', found.name, { shouldValidate: true })
      form.setValue('code', found.code, { shouldValidate: true })
      form.setValue('alias', found.alias, { shouldValidate: true })
      form.setValue('province_name_raw', found.provinceName, { shouldValidate: true })
      form.setValue('province_code_raw', found.provinceCode, { shouldValidate: true })
      form.setValue('latitude', found.latitude, { shouldValidate: true })
      form.setValue('longitude', found.longitude, { shouldValidate: true })
    }
  }

  const onSubmit = async (values: RegencyFormValues) => {
    try {
      const res = await saveRegency(values)
      if (res.success) {
        toast.success(isEdit ? 'Kabupaten/Kota berhasil diperbarui' : 'Kabupaten/Kota berhasil didaftarkan')
        onSuccess()
        form.reset()
      } else {
        toast.error(res.error || 'Gagal menyimpan kabupaten')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan data')
    }
  }

  const catalogOptions = useMemo(
    () =>
      INDONESIA_ALL_REGENCIES.map((r) => ({
        label: `${r.name} (${r.provinceName})`,
        value: r.code
      })),
    []
  )

  return (
    <Form {...form}>
      <form id="regency-action-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
        {!isEdit && (
          <div className="border-border/60 flex items-center justify-between border-b pb-1">
            <span className="text-foreground text-xs font-semibold">{tReg('category')}</span>
            <Tabs value={isDomestic ? 'domestic' : 'foreign'} onValueChange={(val) => form.setValue('is_domestic', val === 'domestic')}>
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
          <FormFieldWrapper id="catalog-regency" label={t('form.catalogLabel')}>
            <SelectForm
              placeholder={t('form.catalogPlaceholder')}
              disabled={isPending}
              onValueChange={handleSelectDomestic}
              items={catalogOptions}
              onAddNew={() => {
                form.setValue('is_domestic', false)
                toast.info('Beralih ke mode input manual / luar negeri')
              }}
            />
          </FormFieldWrapper>
        )}

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormFieldWrapper id="reg-name" label={t('table.name')} required error={form.formState.errors.name?.message}>
                  <FormControl>
                    <Input id="reg-name" placeholder={t('form.namePlaceholder')} disabled={isPending} {...field} />
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
                <FormFieldWrapper id="reg-alias" label={t('form.aliasLabel')} required error={form.formState.errors.alias?.message}>
                  <FormControl>
                    <Input id="reg-alias" placeholder={t('form.aliasPlaceholder')} disabled={isPending} {...field} />
                  </FormControl>
                </FormFieldWrapper>
              </FormItem>
            )}
          />
        </div>

        {selectedProvName && (
          <div className="border-border/80 bg-muted/40 space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>
                {tReg('fields.parent')}: {selectedProvName}
              </span>
              {isCheckingParent ? (
                <span className="text-muted-foreground text-[10px]">{tReg('checkingParent')}</span>
              ) : parentStatus?.exists ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                  <CheckCircle2 className="size-3.5" /> {tReg('parentRegistered')}
                </span>
              ) : (
                <span className="text-destructive flex items-center gap-1 text-[11px]">
                  <AlertCircle className="size-3.5" /> {tReg('parentUnregistered')}
                </span>
              )}
            </div>

            {!isCheckingParent && parentStatus && !parentStatus.exists && (
              <Alert variant="destructive" className="py-2 text-xs">
                <AlertCircle className="size-4" />
                <AlertTitle className="text-xs font-bold">{t('alert.parentMissingTitle')}</AlertTitle>
                <AlertDescription className="text-[11px]">{t('alert.parentMissingDesc', { province: selectedProvName })}</AlertDescription>
                <div className="border-destructive/20 mt-2 flex items-center justify-between border-t pt-2">
                  <span className="text-foreground text-[11px] font-semibold">{t('alert.autoAddLabel')}</span>
                  <Switch checked={autoAddProvince} onCheckedChange={(checked) => form.setValue('auto_add_province', checked)} />
                </div>
              </Alert>
            )}
          </div>
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormFieldWrapper id="reg-desc" label={t('form.descLabel')} error={form.formState.errors.description?.message}>
                <FormControl>
                  <Textarea id="reg-desc" rows={3} placeholder={t('form.descPlaceholder')} disabled={isPending} {...field} />
                </FormControl>
              </FormFieldWrapper>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
