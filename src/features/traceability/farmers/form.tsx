'use client'

import { useEffect, useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { farmerFormSchema } from '@/schemas/farmer'

import { saveFarmerAction } from './actions'
import { useFarmers } from './context'
import { FarmerFields } from './farmer-fields'

import type { FarmerFormValues } from '@/schemas/farmer'
import type { ReactElement } from 'react'
import type { SubmitHandler } from 'react-hook-form'

export function FarmersActionDialog(): ReactElement {
  const tTrace = useTranslations('traceability.farmers')
  const tCommon = useTranslations('common')
  const { open, setOpen, currentRow, setCurrentRow, refreshData } = useFarmers()
  const [isPending, startTransition] = useTransition()
  const isEdit = open === 'edit'

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FarmerFormValues>({
    resolver: zodResolver(farmerFormSchema),
    defaultValues: {
      ref: '',
      name: '',
      vat: '',
      phone: '',
      email: '',
      street: '',
      city: '',
      partner_latitude: -7.2145,
      partner_longitude: 109.9124,
      commodity: 'gaharu',
      farming_method: 'organic',
      land_area_m2: 2500,
      comment: ''
    }
  })

  useEffect(() => {
    if (currentRow && isEdit) {
      reset({
        id: currentRow.id,
        ref: currentRow.ref,
        name: currentRow.name,
        vat: currentRow.vat || '',
        phone: currentRow.phone || '',
        email: currentRow.email || '',
        street: currentRow.street || '',
        city: currentRow.city || '',
        partner_latitude: currentRow.partner_latitude || -7.2145,
        partner_longitude: currentRow.partner_longitude || 109.9124,
        commodity: currentRow.commodity || 'gaharu',
        farming_method: currentRow.farming_method || 'organic',
        land_area_m2: currentRow.land_area_m2 || 2500,
        comment: currentRow.comment || ''
      })
    } else if (open === 'add') {
      reset({
        ref: `FMR-JTG-${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        vat: '',
        phone: '',
        email: '',
        street: '',
        city: 'Wonosobo',
        partner_latitude: -7.2145,
        partner_longitude: 109.9124,
        commodity: 'gaharu',
        farming_method: 'organic',
        land_area_m2: 2500,
        comment: ''
      })
    }
  }, [currentRow, isEdit, open, reset])

  const onSubmit: SubmitHandler<FarmerFormValues> = (values) => {
    startTransition(async () => {
      const res = await saveFarmerAction(values)
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

        <form id="farmer-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2 text-xs">
          <FarmerFields register={register} errors={errors} watch={watch} setValue={setValue} isPending={isPending} isEdit={isEdit} />
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
          <Button type="submit" form="farmer-form" size="sm" disabled={isPending} className="cursor-pointer font-semibold">
            {isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            {tCommon('actions.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
