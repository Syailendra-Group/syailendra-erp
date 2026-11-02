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
import { INDONESIA_PROVINCES } from '@/features/others/provinces/form/options'
import { useSaveProvinceMutation } from '@/hooks/others/use-provinces'
import { provinceFormSchema } from '@/schemas/others/province-schema'

import type { ProvinceFormValues } from '@/schemas/others/province-schema'
import type { ProvinceRecord } from '@/types/others/province'
import type { ReactElement } from 'react'

export interface ProvinceActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: ProvinceRecord | null
}

export function ProvinceActionDialog({ open, onOpenChange, currentRow }: ProvinceActionDialogProps): ReactElement {
  const isEdit = !!currentRow
  const t = useTranslations('regional.provinces')
  const { mutateAsync: saveProvince, isPending } = useSaveProvinceMutation()

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
    if (open) {
      if (currentRow) {
        form.reset({
          id: currentRow.id,
          is_domestic: true,
          name: currentRow.name,
          code: currentRow.code || '',
          country_id: 100
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
    }
  }, [open, currentRow, form])

  const handleSelectDomestic = (provCode: string) => {
    const found = INDONESIA_PROVINCES.find((p) => p.code === provCode)
    if (found) {
      form.setValue('name', found.name, { shouldValidate: true })
      form.setValue('code', found.code, { shouldValidate: true })
    }
  }

  const onSubmit = async (values: ProvinceFormValues) => {
    try {
      const res = await saveProvince(values)
      if (res.success) {
        toast.success(isEdit ? 'Provinsi berhasil diperbarui' : 'Provinsi berhasil didaftarkan')
        onOpenChange(false)
        form.reset()
      } else {
        toast.error(res.error || 'Gagal menyimpan provinsi')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan data')
    }
  }

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      formId="province-action-form"
      isEdit={isEdit}
      isPending={isPending}
      title={isEdit ? t('dialog.editTitle') : t('dialog.addTitle')}
      description={isEdit ? t('dialog.editDesc') : t('dialog.addDesc')}
    >
      <Form {...form}>
        <form id="province-action-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
          {!isEdit && (
            <div className="grid grid-cols-6 items-center gap-x-3 gap-y-1">
              <label className="text-muted-foreground col-span-2 text-end text-xs font-medium">Katalog BPS</label>
              <div className="col-span-4">
                <SelectForm
                  placeholder="Pilih 38 Provinsi Resmi..."
                  disabled={isPending}
                  onValueChange={handleSelectDomestic}
                  items={INDONESIA_PROVINCES.map((p) => ({
                    label: `${p.name} (${p.code})`,
                    value: p.code
                  }))}
                />
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-3 gap-y-1">
                <FormLabel className="col-span-2 text-end text-xs font-medium">{t('table.name')}</FormLabel>
                <FormControl>
                  <Input placeholder="Nama Provinsi (e.g. Jawa Tengah)" className="col-span-4 text-xs" disabled={isPending} {...field} />
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
                  <Input placeholder="Kode (e.g. JT / 33)" className="col-span-4 text-xs" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage className="col-span-4 col-start-3 text-xs" />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </ActionDialog>
  )
}
