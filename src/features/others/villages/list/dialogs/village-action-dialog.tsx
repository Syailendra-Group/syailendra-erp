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
import { useDistrictsQuery } from '@/hooks/others/use-districts'
import { useSaveVillageMutation } from '@/hooks/others/use-villages'
import { villageFormSchema } from '@/schemas/others/village-schema'

import type { VillageFormValues } from '@/schemas/others/village-schema'
import type { VillageRecord } from '@/types/others/village'
import type { ReactElement } from 'react'

export interface VillageActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: VillageRecord | null
}

export function VillageActionDialog({ open, onOpenChange, currentRow }: VillageActionDialogProps): ReactElement {
  const isEdit = !!currentRow
  const t = useTranslations('regional.villages')
  const { data: districts = [] } = useDistrictsQuery()
  const { mutateAsync: saveVillage, isPending } = useSaveVillageMutation()

  const form = useForm<VillageFormValues>({
    resolver: zodResolver(villageFormSchema),
    defaultValues: {
      id: currentRow?.id,
      name: currentRow?.name || '',
      code: (currentRow?.code as string) || '',
      district_id: currentRow?.district_id ? currentRow.district_id[0] : districts[0]?.id || 1,
      auto_add_district: true,
      zip_code: (currentRow?.zip_code as string) || '',
      latitude: currentRow?.latitude || -7.21,
      longitude: currentRow?.longitude || 109.91
    }
  })

  useEffect(() => {
    if (open) {
      if (currentRow) {
        form.reset({
          id: currentRow.id,
          name: currentRow.name,
          code: (currentRow.code as string) || '',
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
          district_id: districts[0]?.id || 1,
          auto_add_district: true,
          zip_code: '',
          latitude: -7.21,
          longitude: 109.91
        })
      }
    }
  }, [open, currentRow, districts, form])

  const onSubmit = async (values: VillageFormValues) => {
    try {
      const res = await saveVillage(values)
      if (res.success) {
        toast.success(isEdit ? 'Kelurahan/Desa berhasil diperbarui' : 'Kelurahan/Desa berhasil didaftarkan')
        onOpenChange(false)
        form.reset()
      } else {
        toast.error(res.error || 'Gagal menyimpan desa')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan data')
    }
  }

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      formId="village-action-form"
      isEdit={isEdit}
      isPending={isPending}
      title={isEdit ? t('dialog.editTitle') : t('dialog.addTitle')}
      description={isEdit ? t('dialog.editDesc') : t('dialog.addDesc')}
    >
      <Form {...form}>
        <form id="village-action-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-3 gap-y-1">
                <FormLabel className="col-span-2 text-end text-xs font-medium">{t('table.name')}</FormLabel>
                <FormControl>
                  <Input placeholder="Nama Kelurahan / Desa" className="col-span-4 text-xs" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage className="col-span-4 col-start-3 text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="zip_code"
            render={({ field }) => (
              <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-3 gap-y-1">
                <FormLabel className="col-span-2 text-end text-xs font-medium">{t('table.zipCode')}</FormLabel>
                <FormControl>
                  <Input placeholder="Kode Pos (e.g. 56257)" className="col-span-4 text-xs" disabled={isPending} {...field} />
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
                  <Input placeholder="Kode Wilayah Kemendagri" className="col-span-4 text-xs" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage className="col-span-4 col-start-3 text-xs" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-6 items-center gap-x-3 gap-y-1">
            <label className="col-span-2 text-end text-xs font-medium">{t('table.district')}</label>
            <div className="col-span-4">
              <SelectForm
                value={form.watch('district_id') ? String(form.watch('district_id')) : undefined}
                onValueChange={(val) => form.setValue('district_id', Number(val), { shouldValidate: true })}
                placeholder="Pilih Kecamatan"
                disabled={isPending}
                items={districts.map((d) => ({
                  label: d.name,
                  value: String(d.id)
                }))}
              />
            </div>
          </div>
        </form>
      </Form>
    </ActionDialog>
  )
}
