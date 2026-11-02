'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { SelectForm } from '@/components/form/select-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useSaveDistrictMutation } from '@/hooks/others/use-districts'
import { useRegenciesQuery } from '@/hooks/others/use-regencies'
import { districtFormSchema } from '@/schemas/others/district-schema'

import type { DistrictFormValues } from '@/schemas/others/district-schema'
import type { DistrictRecord } from '@/types/others/district'
import type { ReactElement } from 'react'

export interface DistrictActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: DistrictRecord | null
}

export function DistrictActionDialog({ open, onOpenChange, currentRow }: DistrictActionDialogProps): ReactElement {
  const isEdit = !!currentRow
  const t = useTranslations('regional.districts')
  const { data: regencies = [] } = useRegenciesQuery()
  const { mutateAsync: saveDistrict, isPending } = useSaveDistrictMutation()

  const form = useForm<DistrictFormValues>({
    resolver: zodResolver(districtFormSchema),
    defaultValues: {
      id: currentRow?.id,
      name: currentRow?.name || '',
      code: (currentRow?.code as string) || '',
      city_id: currentRow?.city_id ? currentRow.city_id[0] : regencies[0]?.id || 1,
      auto_add_regency: true,
      latitude: currentRow?.latitude || -7.2,
      longitude: currentRow?.longitude || 110.0
    }
  })

  useEffect(() => {
    if (open) {
      if (currentRow) {
        form.reset({
          id: currentRow.id,
          name: currentRow.name,
          code: (currentRow.code as string) || '',
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
          city_id: regencies[0]?.id || 1,
          auto_add_regency: true,
          latitude: -7.2,
          longitude: 110.0
        })
      }
    }
  }, [open, currentRow, regencies, form])

  const onSubmit = async (values: DistrictFormValues) => {
    try {
      const res = await saveDistrict(values)
      if (res.success) {
        toast.success(isEdit ? 'Kecamatan berhasil diperbarui' : 'Kecamatan berhasil didaftarkan')
        onOpenChange(false)
        form.reset()
      } else {
        toast.error(res.error || 'Gagal menyimpan kecamatan')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan data')
    }
  }

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      formId="district-action-form"
      isEdit={isEdit}
      isPending={isPending}
      title={isEdit ? t('dialog.editTitle') : t('dialog.addTitle')}
      description={isEdit ? t('dialog.editDesc') : t('dialog.addDesc')}
    >
      <Form {...form}>
        <form id="district-action-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-3 gap-y-1">
                <FormLabel className="col-span-2 text-end text-xs font-medium">{t('table.name')}</FormLabel>
                <FormControl>
                  <Input placeholder="Nama Kecamatan" className="col-span-4 text-xs" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage className="col-span-4 col-start-3 text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-3 gap-y-1">
                <FormLabel className="col-span-2 text-end text-xs font-medium">{t('table.code')}</FormLabel>
                <FormControl>
                  <Input placeholder="Kode (e.g. 33.23.08)" className="col-span-4 text-xs" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage className="col-span-4 col-start-3 text-xs" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-6 items-center gap-x-3 gap-y-1">
            <label className="col-span-2 text-end text-xs font-medium">Kabupaten Induk</label>
            <div className="col-span-4">
              <SelectForm
                value={form.watch('city_id') ? String(form.watch('city_id')) : undefined}
                onValueChange={(val) => form.setValue('city_id', Number(val), { shouldValidate: true })}
                placeholder="Pilih Kabupaten"
                disabled={isPending}
                items={regencies.map((r) => ({
                  label: r.name,
                  value: String(r.id)
                }))}
              />
            </div>
          </div>
        </form>
      </Form>
    </ActionDialog>
  )
}
