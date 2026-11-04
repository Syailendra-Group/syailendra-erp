'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useDistillers } from '@/contexts/scm/distiller.context'
import { useSaveDistillerMutation } from '@/hooks/scm/use-distillers'
import { distillerFormSchema } from '@/schemas/scm/distiller-schema'

import { getDistillerOptions } from './options'

import type { DistillerFormValues } from '@/schemas/scm/distiller-schema'
import type { ReactElement } from 'react'

export function DistillersActionDialog(): ReactElement {
  const tTrace = useTranslations('scm.distillers')
  const tCommon = useTranslations('common')
  const { open, setOpen, currentRow, setCurrentRow, refreshData } = useDistillers()
  const { mutateAsync: saveDistiller, isPending } = useSaveDistillerMutation()
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
      const randomSuffix = Math.floor(100 + Math.random() * 900)
      reset({
        ref: `DST-JTG-${randomSuffix}`,
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

  const currentMethod = watch('method')
  const currentMaterial = watch('boiler_material')
  const currentOwnership = watch('ownership')
  const currentSanitation = watch('sanitation_status')

  const { methodOptions, materialOptions, ownershipOptions, sanitationOptions } = getDistillerOptions(tTrace)

  const onSubmit = async (values: DistillerFormValues) => {
    try {
      const res = await saveDistiller(values)
      if (res.success) {
        toast.success(tTrace('messages.saved'))
        refreshData?.()
        setOpen(null)
        setCurrentRow(null)
      } else {
        toast.error(res.error || tTrace('messages.saveFailed'))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : tTrace('messages.saveFailed')
      toast.error(msg)
    }
  }

  const isOpen = open === 'add' || open === 'edit'

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          reset()
          setOpen(null)
          setCurrentRow(null)
        }
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="text-start">
          <DialogTitle>{isEdit ? tTrace('dialog.editTitle') : tTrace('dialog.addTitle')}</DialogTitle>
          <DialogDescription>{isEdit ? tTrace('dialog.editDesc') : tTrace('dialog.addDesc')}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto py-1 pe-1">
          <form id="distiller-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormFieldWrapper id="ref" label={tTrace('fields.ref')} error={errors.ref?.message}>
                <Input
                  id="ref"
                  placeholder={tTrace('fields.refPlaceholder')}
                  disabled={isPending || isEdit}
                  className="h-8 font-mono text-xs"
                  {...register('ref')}
                />
              </FormFieldWrapper>

              <FormFieldWrapper id="name" label={tTrace('fields.name')} required error={errors.name?.message}>
                <Input id="name" placeholder={tTrace('fields.namePlaceholder')} disabled={isPending} className="h-8 text-xs" {...register('name')} />
              </FormFieldWrapper>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormFieldWrapper
                id="boiler_capacity_kg"
                label={`${tTrace('fields.boilerCapacity')} (Kg)`}
                required
                error={errors.boiler_capacity_kg?.message}
              >
                <Input
                  id="boiler_capacity_kg"
                  type="number"
                  placeholder={tTrace('fields.boilerCapacityPlaceholder')}
                  disabled={isPending}
                  className="h-8 font-mono text-xs"
                  {...register('boiler_capacity_kg', { valueAsNumber: true })}
                />
              </FormFieldWrapper>

              <FormFieldWrapper id="method" label={tTrace('fields.method')} required error={errors.method?.message}>
                <SelectForm
                  value={currentMethod}
                  onValueChange={(val) => setValue('method', val, { shouldValidate: true })}
                  placeholder={tTrace('fields.methodPlaceholder')}
                  disabled={isPending}
                  items={methodOptions}
                />
              </FormFieldWrapper>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormFieldWrapper id="boiler_material" label={tTrace('fields.material')}>
                <SelectForm
                  value={currentMaterial}
                  onValueChange={(val) => setValue('boiler_material', val, { shouldValidate: true })}
                  placeholder={tTrace('fields.materialPlaceholder')}
                  disabled={isPending}
                  items={materialOptions}
                />
              </FormFieldWrapper>

              <FormFieldWrapper id="ownership" label={tTrace('fields.ownership')}>
                <SelectForm
                  value={currentOwnership}
                  onValueChange={(val) => setValue('ownership', val, { shouldValidate: true })}
                  placeholder={tTrace('fields.ownershipPlaceholder')}
                  disabled={isPending}
                  items={ownershipOptions}
                />
              </FormFieldWrapper>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormFieldWrapper id="operator_name" label={tTrace('fields.operatorName')} required error={errors.operator_name?.message}>
                <Input
                  id="operator_name"
                  placeholder={tTrace('fields.operatorNamePlaceholder')}
                  disabled={isPending}
                  className="h-8 text-xs"
                  {...register('operator_name')}
                />
              </FormFieldWrapper>

              <FormFieldWrapper id="phone" label={tTrace('fields.phone')}>
                <Input
                  id="phone"
                  placeholder={tTrace('fields.phonePlaceholder')}
                  disabled={isPending}
                  className="h-8 font-mono text-xs"
                  {...register('phone')}
                />
              </FormFieldWrapper>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormFieldWrapper id="street" label={tTrace('fields.street')} required error={errors.street?.message}>
                <Input
                  id="street"
                  placeholder={tTrace('fields.streetPlaceholder')}
                  disabled={isPending}
                  className="h-8 text-xs"
                  {...register('street')}
                />
              </FormFieldWrapper>

              <FormFieldWrapper id="city" label={tTrace('fields.city')} required error={errors.city?.message}>
                <Input id="city" placeholder={tTrace('fields.cityPlaceholder')} disabled={isPending} className="h-8 text-xs" {...register('city')} />
              </FormFieldWrapper>
            </div>

            <FormFieldWrapper id="sanitation_status" label={tTrace('fields.sanitation')}>
              <SelectForm
                value={currentSanitation}
                onValueChange={(val) => setValue('sanitation_status', val, { shouldValidate: true })}
                placeholder={tTrace('fields.sanitationPlaceholder')}
                disabled={isPending}
                items={sanitationOptions}
              />
            </FormFieldWrapper>

            <FormFieldWrapper id="comment" label={tTrace('fields.comment')}>
              <Textarea
                id="comment"
                rows={2}
                placeholder={tTrace('fields.commentPlaceholder')}
                disabled={isPending}
                className="resize-none text-xs"
                {...register('comment')}
              />
            </FormFieldWrapper>
          </form>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"

            onClick={() => {
              reset()
              setOpen(null)
              setCurrentRow(null)
            }}
            disabled={isPending}
          >
            {tCommon('actions.cancel')}
          </Button>
          <Button type="submit" form="distiller-form" disabled={isPending} className="cursor-pointer font-semibold">
            {isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            {isEdit ? tCommon('actions.save') : tTrace('actions.add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
