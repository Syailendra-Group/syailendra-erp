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
import { Textarea } from '@/components/ui/textarea'
import { useSaveDistrictMutation } from '@/hooks/others/use-districts'
import { useRegenciesQuery } from '@/hooks/others/use-regencies'
import { districtFormSchema } from '@/schemas/others/district-schema'

import type { DistrictFormValues } from '@/schemas/others/district-schema'
import type { DistrictRecord } from '@/types/others/district'
import type { ReactElement } from 'react'

export interface DistrictFormProps {
  currentRow: DistrictRecord | null
  onSuccess: () => void
}

export function DistrictForm({ currentRow, onSuccess }: DistrictFormProps): ReactElement {
  const isEdit = !!currentRow
  const t = useTranslations('regional.districts')
  const { data: regencies = [] } = useRegenciesQuery()
  const { mutateAsync: saveDistrict, isPending } = useSaveDistrictMutation()

  const regencyOptions = useMemo(
    () =>
      regencies.map((r) => ({
        label: r.name,
        value: String(r.id)
      })),
    [regencies]
  )

  const form = useForm<DistrictFormValues>({
    resolver: zodResolver(districtFormSchema),
    defaultValues: {
      id: currentRow?.id,
      name: currentRow?.name || '',
      code: (currentRow?.code as string) || '',
      alias: (currentRow?.alias as string) || '',
      description: (currentRow?.description as string) || '',
      city_id: currentRow?.city_id ? currentRow.city_id[0] : regencies[0]?.id || 1,
      auto_add_regency: true,
      latitude: currentRow?.latitude || -7.2,
      longitude: currentRow?.longitude || 110.0
    }
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        id: currentRow.id,
        name: currentRow.name,
        code: (currentRow.code as string) || '',
        alias: (currentRow.alias as string) || '',
        description: (currentRow.description as string) || '',
        city_id: currentRow.city_id ? currentRow.city_id[0] : regencies[0]?.id || 1,
        auto_add_regency: true,
        latitude: currentRow.latitude || -7.2,
        longitude: currentRow.longitude || 110.0
      })
    } else {
      form.reset({
        id: undefined,
        name: '',
        code: '',
        alias: '',
        description: '',
        city_id: regencies[0]?.id || 1,
        auto_add_regency: true,
        latitude: -7.2,
        longitude: 110.0
      })
    }
  }, [currentRow, regencies, form])

  const onSubmit = async (values: DistrictFormValues) => {
    try {
      const res = await saveDistrict(values)
      if (res.success) {
        toast.success(isEdit ? 'Kecamatan berhasil diperbarui' : 'Kecamatan berhasil didaftarkan')
        onSuccess()
        form.reset()
      } else {
        toast.error(res.error || 'Gagal menyimpan kecamatan')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan data')
    }
  }

  return (
    <Form {...form}>
      <form id="district-action-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
        <FormFieldWrapper id="dist-parent" label="Kabupaten Induk" required>
          <SelectForm
            value={form.watch('city_id') ? String(form.watch('city_id')) : undefined}
            onValueChange={(val) => form.setValue('city_id', Number(val), { shouldValidate: true })}
            placeholder="Pilih Kabupaten"
            disabled={isPending}
            items={regencyOptions}
          />
        </FormFieldWrapper>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormFieldWrapper id="dist-name" label={t('table.name')} required error={form.formState.errors.name?.message}>
                  <FormControl>
                    <Input id="dist-name" placeholder="Contoh: Kecamatan Kejajar" disabled={isPending} {...field} />
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
                <FormFieldWrapper id="dist-alias" label="Nama Alias (Dropdown)" required error={form.formState.errors.alias?.message}>
                  <FormControl>
                    <Input id="dist-alias" placeholder="Contoh: Kejajar" disabled={isPending} {...field} />
                  </FormControl>
                </FormFieldWrapper>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormFieldWrapper id="dist-code" label={t('table.code')} required error={form.formState.errors.code?.message}>
                <FormControl>
                  <Input id="dist-code" placeholder="Contoh: 33.23.08" disabled={isPending} {...field} />
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
              <FormFieldWrapper id="dist-desc" label="Deskripsi / Catatan Wilayah (Opsional)" error={form.formState.errors.description?.message}>
                <FormControl>
                  <Textarea
                    id="dist-desc"
                    rows={3}
                    placeholder="Karakteristik agronomis dataran tinggi, sentra bibit..."
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
