'use client'

import { useTranslations } from 'next-intl'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import type { DistillerFormValues } from '@/schemas/distiller'
import type { ReactElement } from 'react'
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'

export interface DistillerFieldsProps {
  register: UseFormRegister<DistillerFormValues>
  errors: FieldErrors<DistillerFormValues>
  watch: UseFormWatch<DistillerFormValues>
  setValue: UseFormSetValue<DistillerFormValues>
  isPending: boolean
  isEdit: boolean
}

export function DistillerFields({ register, errors, watch, setValue, isPending, isEdit }: DistillerFieldsProps): ReactElement {
  const tTrace = useTranslations('traceability.distillers')

  return (
    <div className="grid grid-cols-6 items-center gap-x-3 gap-y-2.5">
      {/* Distiller ID */}
      <Label htmlFor="ref" className="col-span-2 text-end text-xs font-semibold">
        {tTrace('fields.ref')}
      </Label>
      <div className="col-span-4">
        <Input
          id="ref"
          placeholder={tTrace('fields.refPlaceholder')}
          disabled={isPending || isEdit}
          className="h-8 font-mono text-xs"
          {...register('ref')}
        />
      </div>
      {errors.ref && <span className="text-destructive col-span-4 col-start-3 text-[11px]">{errors.ref.message}</span>}

      {/* Facility Name */}
      <Label htmlFor="name" className="col-span-2 text-end text-xs font-semibold">
        {tTrace('fields.name')}
      </Label>
      <div className="col-span-4">
        <Input id="name" placeholder={tTrace('fields.namePlaceholder')} disabled={isPending} className="h-8 text-xs" {...register('name')} />
      </div>
      {errors.name && <span className="text-destructive col-span-4 col-start-3 text-[11px]">{errors.name.message}</span>}

      {/* Boiler Capacity & Method */}
      <Label htmlFor="boiler_capacity_kg" className="col-span-2 text-end text-xs font-semibold">
        {tTrace('fields.boilerCapacity')}
      </Label>
      <div className="col-span-4 grid grid-cols-2 gap-2">
        <Input
          id="boiler_capacity_kg"
          type="number"
          placeholder={tTrace('fields.boilerCapacityPlaceholder')}
          disabled={isPending}
          className="h-8 font-mono text-xs"
          {...register('boiler_capacity_kg', { valueAsNumber: true })}
        />
        <Select value={watch('method')} onValueChange={(val) => setValue('method', val, { shouldValidate: true })} disabled={isPending}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={tTrace('fields.methodPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="steam">{tTrace('methods.steam')}</SelectItem>
            <SelectItem value="hydro">{tTrace('methods.hydro')}</SelectItem>
            <SelectItem value="water_steam">{tTrace('methods.water_steam')}</SelectItem>
            <SelectItem value="cold_pressed">{tTrace('methods.cold_pressed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {errors.boiler_capacity_kg && <span className="text-destructive col-span-4 col-start-3 text-[11px]">{errors.boiler_capacity_kg.message}</span>}

      {/* Material & Ownership */}
      <Label htmlFor="boiler_material" className="col-span-2 text-end text-xs font-semibold">
        {tTrace('fields.material')}
      </Label>
      <div className="col-span-4 grid grid-cols-2 gap-2">
        <Select
          value={watch('boiler_material')}
          onValueChange={(val) => setValue('boiler_material', val, { shouldValidate: true })}
          disabled={isPending}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={tTrace('fields.materialPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sus316">{tTrace('materials.sus316')}</SelectItem>
            <SelectItem value="sus304">{tTrace('materials.sus304')}</SelectItem>
            <SelectItem value="copper">{tTrace('materials.copper')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={watch('ownership')} onValueChange={(val) => setValue('ownership', val, { shouldValidate: true })} disabled={isPending}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={tTrace('fields.ownershipPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="internal">{tTrace('ownership.internal')}</SelectItem>
            <SelectItem value="partner">{tTrace('ownership.partner')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Operator Name & Phone */}
      <Label htmlFor="operator_name" className="col-span-2 text-end text-xs font-semibold">
        {tTrace('fields.operatorName')}
      </Label>
      <div className="col-span-4 grid grid-cols-2 gap-2">
        <Input
          id="operator_name"
          placeholder={tTrace('fields.operatorNamePlaceholder')}
          disabled={isPending}
          className="h-8 text-xs"
          {...register('operator_name')}
        />
        <Input
          id="phone"
          placeholder={tTrace('fields.phonePlaceholder')}
          disabled={isPending}
          className="h-8 font-mono text-xs"
          {...register('phone')}
        />
      </div>
      {errors.operator_name && <span className="text-destructive col-span-4 col-start-3 text-[11px]">{errors.operator_name.message}</span>}

      {/* Facility Address (City & Street) */}
      <Label htmlFor="street" className="col-span-2 text-end text-xs font-semibold">
        {tTrace('fields.street')}
      </Label>
      <div className="col-span-4 grid grid-cols-2 gap-2">
        <Input id="street" placeholder={tTrace('fields.streetPlaceholder')} disabled={isPending} className="h-8 text-xs" {...register('street')} />
        <Input id="city" placeholder={tTrace('fields.cityPlaceholder')} disabled={isPending} className="h-8 text-xs" {...register('city')} />
      </div>
      {(errors.street || errors.city) && (
        <span className="text-destructive col-span-4 col-start-3 text-[11px]">{errors.street?.message || errors.city?.message}</span>
      )}

      {/* Sanitation Status */}
      <Label htmlFor="sanitation_status" className="col-span-2 text-end text-xs font-semibold">
        {tTrace('fields.sanitation')}
      </Label>
      <div className="col-span-4">
        <Select
          value={watch('sanitation_status')}
          onValueChange={(val) => setValue('sanitation_status', val, { shouldValidate: true })}
          disabled={isPending}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={tTrace('fields.sanitationPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="passed">{tTrace('sanitation.passed')}</SelectItem>
            <SelectItem value="pending">{tTrace('sanitation.pending')}</SelectItem>
            <SelectItem value="cleaning">{tTrace('sanitation.cleaning')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Technical Notes */}
      <Label htmlFor="comment" className="col-span-2 text-end text-xs font-semibold">
        {tTrace('fields.comment')}
      </Label>
      <div className="col-span-4">
        <Textarea
          id="comment"
          rows={2}
          placeholder={tTrace('fields.commentPlaceholder')}
          disabled={isPending}
          className="resize-none text-xs"
          {...register('comment')}
        />
      </div>
    </div>
  )
}
