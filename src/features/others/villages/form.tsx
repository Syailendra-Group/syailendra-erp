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
import { useDistrictsQuery } from '@/hooks/others/use-districts'
import { useSaveVillageMutation } from '@/hooks/others/use-villages'
import { villageFormSchema } from '@/schemas/others/village-schema'

import type { VillageFormValues } from '@/schemas/others/village-schema'
import type { VillageRecord } from '@/types/others/village'
import type { ReactElement } from 'react'

export interface VillageFormProps {
  currentRow: VillageRecord | null
  onSuccess: () => void
}

export function VillageForm({ currentRow, onSuccess }: VillageFormProps): ReactElement {
  const isEdit = !!currentRow
  const t = useTranslations('others.villages')
  const { data: districts = [] } = useDistrictsQuery()
  const { mutateAsync: saveVillage, isPending } = useSaveVillageMutation()

  const districtOptions = useMemo(
    () =>
      districts.map((d) => ({
        label: d.name,
        value: String(d.id)
      })),
    [districts]
  )

  const form = useForm<VillageFormValues>({
    resolver: zodResolver(villageFormSchema),
    defaultValues: {
      id: currentRow?.id,
      name: currentRow?.name || '',
      code: (currentRow?.code as string) || '',
      alias: (currentRow?.alias as string) || '',
      description: (currentRow?.description as string) || '',
      district_id: currentRow?.district_id ? currentRow.district_id[0] : districts[0]?.id || 1,
      auto_add_district: true,
      zip_code: (currentRow?.zip_code as string) || '',
      latitude: currentRow?.latitude || -7.21,
      longitude: currentRow?.longitude || 109.91
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
        district_id: currentRow.district_id ? currentRow.district_id[0] : districts[0]?.id || 1,
        auto_add_district: true,
        zip_code: (currentRow.zip_code as string) || '',
        latitude: currentRow.latitude || -7.21,
        longitude: currentRow.longitude || 109.91
      })
    } else {
      form.reset({
        id: undefined,
        name: '',
        code: '',
        alias: '',
        description: '',
        district_id: districts[0]?.id || 1,
        auto_add_district: true,
        zip_code: '',
        latitude: -7.21,
        longitude: 109.91
      })
    }
  }, [currentRow, districts, form])

  const onSubmit = async (values: VillageFormValues) => {
    try {
      const res = await saveVillage(values)
      if (res.success) {
        toast.success(isEdit ? 'Kelurahan/Desa berhasil diperbarui' : 'Kelurahan/Desa berhasil didaftarkan')
        onSuccess()
        form.reset()
      } else {
        toast.error(res.error || 'Gagal menyimpan kelurahan/desa')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan data')
    }
  }

  return (
    <Form {...form}>
      <form id="village-action-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
        <FormFieldWrapper id="vil-parent" label={t('form.parentLabel')} required>
          <SelectForm
            value={form.watch('district_id') ? String(form.watch('district_id')) : undefined}
            onValueChange={(val) => form.setValue('district_id', Number(val), { shouldValidate: true })}
            placeholder={t('form.parentPlaceholder')}
            disabled={isPending}
            items={districtOptions}
          />
        </FormFieldWrapper>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormFieldWrapper id="vil-name" label={t('table.name')} required error={form.formState.errors.name?.message}>
                  <FormControl>
                    <Input id="vil-name" placeholder={t('form.namePlaceholder')} disabled={isPending} {...field} />
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
                <FormFieldWrapper id="vil-alias" label={t('form.aliasLabel')} required error={form.formState.errors.alias?.message}>
                  <FormControl>
                    <Input id="vil-alias" placeholder={t('form.aliasPlaceholder')} disabled={isPending} {...field} />
                  </FormControl>
                </FormFieldWrapper>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormFieldWrapper id="vil-code" label={t('table.code')} required error={form.formState.errors.code?.message}>
                  <FormControl>
                    <Input id="vil-code" placeholder={t('form.codePlaceholder')} disabled={isPending} {...field} />
                  </FormControl>
                </FormFieldWrapper>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="zip_code"
            render={({ field }) => (
              <FormItem>
                <FormFieldWrapper id="vil-zip" label={t('form.zipLabel')} error={form.formState.errors.zip_code?.message}>
                  <FormControl>
                    <Input id="vil-zip" placeholder={t('form.zipPlaceholder')} disabled={isPending} {...field} />
                  </FormControl>
                </FormFieldWrapper>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormFieldWrapper id="vil-desc" label={t('form.descLabel')} error={form.formState.errors.description?.message}>
                <FormControl>
                  <Textarea id="vil-desc" rows={3} placeholder={t('form.descPlaceholder')} disabled={isPending} {...field} />
                </FormControl>
              </FormFieldWrapper>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
