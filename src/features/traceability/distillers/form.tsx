'use client'

import { useEffect, useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { distillerFormSchema } from '@/schemas/distiller'

import { saveDistillerAction } from './actions'
import { useDistillers } from './context'
import { DistillerFields } from './distiller-fields'

import type { DistillerFormValues } from '@/schemas/distiller'
import type { ReactElement } from 'react'
import type { SubmitHandler } from 'react-hook-form'

export function DistillersActionDialog(): ReactElement {
  const tTrace = useTranslations('traceability.distillers')
  const tCommon = useTranslations('common')
  const { open, setOpen, currentRow, setCurrentRow, refreshData } = useDistillers()
  const [isPending, startTransition] = useTransition()
  const isEdit = open === 'edit'

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<DistillerFormValues>({
    resolver: zodResolver(distillerFormSchema),
    defaultValues: {
      ref: '',
      name: '',
      boiler_capacity_kg: 500,
      method: 'steam',
      boiler_material: 'sus316',
      ownership: 'internal',
      operator_name: '',
      phone: '',
      city: 'Temanggung',
      street: '',
      partner_latitude: -7.315,
      partner_longitude: 110.17,
      sanitation_status: 'passed',
      comment: ''
    }
  })

  useEffect(() => {
    if (currentRow && isEdit) {
      reset({
        id: currentRow.id,
        ref: currentRow.ref,
        name: currentRow.name,
        boiler_capacity_kg: currentRow.boiler_capacity_kg || 500,
        method: currentRow.method || 'steam',
        boiler_material: currentRow.boiler_material || 'sus316',
        ownership: currentRow.ownership || 'internal',
        operator_name: currentRow.operator_name || '',
        phone: currentRow.phone || '',
        city: currentRow.city || 'Temanggung',
        street: currentRow.street || '',
        partner_latitude: currentRow.partner_latitude || -7.315,
        partner_longitude: currentRow.partner_longitude || 110.17,
        sanitation_status: currentRow.sanitation_status || 'passed',
        comment: currentRow.comment || ''
      })
    } else if (open === 'add') {
      reset({
        ref: `DST-JTG-${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        boiler_capacity_kg: 500,
        method: 'steam',
        boiler_material: 'sus316',
        ownership: 'internal',
        operator_name: '',
        phone: '',
        city: 'Temanggung',
        street: 'Kawasan Industri Agro Mandiri',
        partner_latitude: -7.315,
        partner_longitude: 110.17,
        sanitation_status: 'passed',
        comment: ''
      })
    }
  }, [currentRow, isEdit, open, reset])

  const onSubmit: SubmitHandler<DistillerFormValues> = (values) => {
    startTransition(async () => {
      const res = await saveDistillerAction(values)
      if (res.success) {
        toast.success(tTrace('messages.saved'))
        refreshData()
        setOpen(null)
        setCurrentRow(null)
      } else {
        toast.error(res.error || tTrace('messages.saveFailed'))
      }
    })
  }

  const isOpen = open === 'add' || open === 'edit'

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setOpen(null)
          setCurrentRow(null)
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base">{isEdit ? tTrace('dialog.editTitle') : tTrace('dialog.addTitle')}</DialogTitle>
          <DialogDescription className="text-xs">{isEdit ? tTrace('dialog.editDesc') : tTrace('dialog.addDesc')}</DialogDescription>
        </DialogHeader>

        <form id="distiller-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2 text-xs">
          <DistillerFields register={register} errors={errors} watch={watch} setValue={setValue} isPending={isPending} isEdit={isEdit} />
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => {
              setOpen(null)
              setCurrentRow(null)
            }}
          >
            {tCommon('actions.cancel')}
          </Button>
          <Button type="submit" form="distiller-form" size="sm" disabled={isPending} className="cursor-pointer font-semibold">
            {isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            {tCommon('actions.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
