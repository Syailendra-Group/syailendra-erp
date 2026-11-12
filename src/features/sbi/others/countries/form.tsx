'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { RegionalMapField } from '@/components/map/regional-map-field'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useSaveCountryMutation } from '@/hooks/sbi/others/use-countries'
import { getCountryFormSchema } from '@/schemas/sbi/others/country-schema'

import type { CountryFormValues } from '@/schemas/sbi/others/country-schema'
import type { CountryRecord } from '@/types/sbi/others/country'
import type { ReactElement } from 'react'

export interface CountryFormProps {
  currentRow: CountryRecord | null
  onSuccess: () => void
}

export function CountryForm({ currentRow, onSuccess }: CountryFormProps): ReactElement {
  const isEdit = !!currentRow
  const t = useTranslations('others.countries')
  const tToast = useTranslations('regional.regionalToasts')
  const { mutateAsync: saveCountry, isPending } = useSaveCountryMutation()

  const form = useForm<CountryFormValues>({
    resolver: zodResolver(getCountryFormSchema(t)),
    defaultValues: {
      id: currentRow?.id,
      name: currentRow?.name || '',
      code: currentRow?.code || '',
      phone_code: currentRow?.phone_code ? Number(currentRow.phone_code) : undefined,
      description: currentRow?.description || '',
      latitude: typeof currentRow?.latitude === 'number' ? currentRow.latitude : -0.789275,
      longitude: typeof currentRow?.longitude === 'number' ? currentRow.longitude : 113.921327
    }
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        id: currentRow.id,
        name: currentRow.name,
        code: currentRow.code || '',
        phone_code: currentRow.phone_code ? Number(currentRow.phone_code) : undefined,
        description: currentRow.description || '',
        latitude: typeof currentRow.latitude === 'number' ? currentRow.latitude : -0.789275,
        longitude: typeof currentRow.longitude === 'number' ? currentRow.longitude : 113.921327
      })
    } else {
      form.reset({
        id: undefined,
        name: '',
        code: '',
        phone_code: undefined,
        description: '',
        latitude: -0.789275,
        longitude: 113.921327
      })
    }
  }, [currentRow, form])

  const onSubmit = async (values: CountryFormValues) => {
    try {
      const res = await saveCountry(values)
      if (res.success) {
        toast.success(isEdit ? tToast('updateSuccess', { entity: t('title') }) : tToast('createSuccess', { entity: t('title') }))
        onSuccess()
        form.reset()
      } else {
        toast.error(res.error || tToast('saveFailed', { entity: t('title') }))
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tToast('genericError'))
    }
  }

  const lat = form.watch('latitude')
  const lng = form.watch('longitude')

  return (
    <Form {...form}>
      <form id="country-action-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
          {/* Left Column: Administrative Details (Clean 1-per-line stack) */}
          <div className="space-y-3.5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormFieldWrapper id="cntry-name" label={t('form.name')} required error={form.formState.errors.name?.message}>
                    <FormControl>
                      <Input id="cntry-name" placeholder={t('form.namePlaceholder')} disabled={isPending} {...field} />
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
                  <FormFieldWrapper id="cntry-code" label={t('form.code')} required error={form.formState.errors.code?.message}>
                    <FormControl>
                      <Input id="cntry-code" placeholder={t('form.codePlaceholder')} disabled={isPending} maxLength={5} {...field} />
                    </FormControl>
                  </FormFieldWrapper>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone_code"
              render={({ field }) => (
                <FormItem>
                  <FormFieldWrapper id="cntry-phone" label={t('form.phoneCode')} error={form.formState.errors.phone_code?.message}>
                    <FormControl>
                      <Input
                        id="cntry-phone"
                        type="number"
                        placeholder={t('form.phoneCodePlaceholder')}
                        disabled={isPending}
                        value={field.value !== undefined ? String(field.value) : ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                  </FormFieldWrapper>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormFieldWrapper id="cntry-desc" label={t('form.description')} error={form.formState.errors.description?.message}>
                    <FormControl>
                      <Textarea id="cntry-desc" rows={2} placeholder={t('form.descriptionPlaceholder')} disabled={isPending} {...field} />
                    </FormControl>
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
