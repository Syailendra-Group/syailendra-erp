'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useSaveCountryMutation } from '@/hooks/others/use-countries'
import { countryFormSchema } from '@/schemas/others/country-schema'

import type { CountryFormValues } from '@/schemas/others/country-schema'
import type { CountryRecord } from '@/types/others/country'
import type { ReactElement } from 'react'

export interface CountryFormProps {
  currentRow: CountryRecord | null
  onSuccess: () => void
}

export function CountryForm({ currentRow, onSuccess }: CountryFormProps): ReactElement {
  const isEdit = !!currentRow
  const t = useTranslations('others.countries')
  const { mutateAsync: saveCountry, isPending } = useSaveCountryMutation()

  const form = useForm<CountryFormValues>({
    resolver: zodResolver(countryFormSchema),
    defaultValues: {
      id: currentRow?.id,
      name: currentRow?.name || '',
      code: currentRow?.code || '',
      phone_code: currentRow?.phone_code ? Number(currentRow.phone_code) : undefined,
      description: currentRow?.description || ''
    }
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        id: currentRow.id,
        name: currentRow.name,
        code: currentRow.code || '',
        phone_code: currentRow.phone_code ? Number(currentRow.phone_code) : undefined,
        description: currentRow.description || ''
      })
    } else {
      form.reset({
        id: undefined,
        name: '',
        code: '',
        phone_code: undefined,
        description: ''
      })
    }
  }, [currentRow, form])

  const onSubmit = async (values: CountryFormValues) => {
    try {
      const res = await saveCountry(values)
      if (res.success) {
        toast.success(isEdit ? 'Negara berhasil diperbarui' : 'Negara berhasil didaftarkan')
        onSuccess()
        form.reset()
      } else {
        toast.error(res.error || 'Gagal menyimpan negara')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan data')
    }
  }

  return (
    <Form {...form}>
      <form id="country-action-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
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
        </div>

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
                  <Textarea id="cntry-desc" rows={3} placeholder={t('form.descriptionPlaceholder')} disabled={isPending} {...field} />
                </FormControl>
              </FormFieldWrapper>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
