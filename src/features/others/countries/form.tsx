'use client'

import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCurrenciesQuery, useSaveCountryMutation } from '@/hooks/others/use-countries'
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
  const { mutateAsync: saveCountry, isPending } = useSaveCountryMutation()
  const { data: currencies = [] } = useCurrenciesQuery()

  const currencyOptions = useMemo(
    () =>
      currencies.map((c) => ({
        label: `${c.name} (${c.symbol})`,
        value: String(c.id)
      })),
    [currencies]
  )

  const form = useForm<CountryFormValues>({
    resolver: zodResolver(countryFormSchema),
    defaultValues: {
      id: currentRow?.id,
      name: currentRow?.name || '',
      code: currentRow?.code || '',
      phone_code: typeof currentRow?.phone_code === 'number' ? currentRow.phone_code : undefined,
      currency_id: currentRow?.currency_id ? currentRow.currency_id[0] : undefined,
      description: (currentRow?.description as string) || ''
    }
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        id: currentRow.id,
        name: currentRow.name,
        code: currentRow.code,
        phone_code: typeof currentRow.phone_code === 'number' ? currentRow.phone_code : undefined,
        currency_id: currentRow.currency_id ? currentRow.currency_id[0] : undefined,
        description: (currentRow.description as string) || ''
      })
    } else {
      form.reset({
        id: undefined,
        name: '',
        code: '',
        phone_code: undefined,
        currency_id: undefined,
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormFieldWrapper id="country-name" label="Nama Resmi Negara" required error={form.formState.errors.name?.message}>
                <FormControl>
                  <Input id="country-name" placeholder="Contoh: Indonesia, Singapore, Japan" disabled={isPending} {...field} />
                </FormControl>
              </FormFieldWrapper>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormFieldWrapper id="country-code" label="Kode Negara (ISO 2-Huruf)" required error={form.formState.errors.code?.message}>
                  <FormControl>
                    <Input
                      id="country-code"
                      placeholder="Contoh: ID, SG, JP"
                      maxLength={5}
                      disabled={isPending}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
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
                <FormFieldWrapper id="country-phone-code" label="Kode Telepon Panggilan" error={form.formState.errors.phone_code?.message}>
                  <FormControl>
                    <Input
                      id="country-phone-code"
                      type="number"
                      placeholder="Contoh: 62, 65, 81"
                      disabled={isPending}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                </FormFieldWrapper>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="currency_id"
          render={({ field }) => (
            <FormItem>
              <FormFieldWrapper id="country-currency" label="Mata Uang Resmi (Currency)" error={form.formState.errors.currency_id?.message}>
                <SelectForm
                  placeholder="Pilih mata uang..."
                  disabled={isPending}
                  value={field.value ? String(field.value) : ''}
                  onValueChange={(val) => field.onChange(Number(val))}
                  items={currencyOptions}
                />
              </FormFieldWrapper>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormFieldWrapper
                id="country-desc"
                label="Deskripsi / Catatan Yurisdiksi (Opsional)"
                error={form.formState.errors.description?.message}
              >
                <FormControl>
                  <Textarea
                    id="country-desc"
                    rows={3}
                    placeholder="Catatan regulasi ekspor-impor, yurisdiksi kepatuhan, atau catatan agronomis..."
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
              </FormFieldWrapper>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
