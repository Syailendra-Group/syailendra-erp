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
    <div className="space-y-3.5">
      {/* 2-Column Grid: ID & Name */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Distiller ID */}
        <div className="space-y-1.5">
          <Label htmlFor="ref" className="text-xs font-semibold">
            {tTrace('fields.ref')}
          </Label>
          <Input
            id="ref"
            placeholder={tTrace('fields.refPlaceholder')}
            disabled={isPending || isEdit}
            className="h-8 font-mono text-xs"
            {...register('ref')}
          />
          {errors.ref && <p className="text-destructive text-[11px] font-medium">{errors.ref.message}</p>}
        </div>

        {/* Facility Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-semibold">
            {tTrace('fields.name')}
          </Label>
          <Input id="name" placeholder={tTrace('fields.namePlaceholder')} disabled={isPending} className="h-8 text-xs" {...register('name')} />
          {errors.name && <p className="text-destructive text-[11px] font-medium">{errors.name.message}</p>}
        </div>
      </div>

      {/* 2-Column Grid: Capacity & Method */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="boiler_capacity_kg" className="text-xs font-semibold">
            {tTrace('fields.boilerCapacity')}
          </Label>
          <Input
            id="boiler_capacity_kg"
            type="number"
            placeholder={tTrace('fields.boilerCapacityPlaceholder')}
            disabled={isPending}
            className="h-8 font-mono text-xs"
            {...register('boiler_capacity_kg', { valueAsNumber: true })}
          />
          {errors.boiler_capacity_kg && <p className="text-destructive text-[11px] font-medium">{errors.boiler_capacity_kg.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="method" className="text-xs font-semibold">
            {tTrace('fields.method')}
          </Label>
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
          {errors.method && <p className="text-destructive text-[11px] font-medium">{errors.method.message}</p>}
        </div>
      </div>

      {/* 2-Column Grid: Material & Ownership */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="boiler_material" className="text-xs font-semibold">
            {tTrace('fields.material')}
          </Label>
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
          {errors.boiler_material && <p className="text-destructive text-[11px] font-medium">{errors.boiler_material.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ownership" className="text-xs font-semibold">
            {tTrace('fields.ownership')}
          </Label>
          <Select value={watch('ownership')} onValueChange={(val) => setValue('ownership', val, { shouldValidate: true })} disabled={isPending}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder={tTrace('fields.ownershipPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="internal">{tTrace('ownership.internal')}</SelectItem>
              <SelectItem value="partner">{tTrace('ownership.partner')}</SelectItem>
            </SelectContent>
          </Select>
          {errors.ownership && <p className="text-destructive text-[11px] font-medium">{errors.ownership.message}</p>}
        </div>
      </div>

      {/* 2-Column Grid: Operator & Phone */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="operator_name" className="text-xs font-semibold">
            {tTrace('fields.operatorName')}
          </Label>
          <Input
            id="operator_name"
            placeholder={tTrace('fields.operatorNamePlaceholder')}
            disabled={isPending}
            className="h-8 text-xs"
            {...register('operator_name')}
          />
          {errors.operator_name && <p className="text-destructive text-[11px] font-medium">{errors.operator_name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-semibold">
            {tTrace('fields.phone')}
          </Label>
          <Input
            id="phone"
            placeholder={tTrace('fields.phonePlaceholder')}
            disabled={isPending}
            className="h-8 font-mono text-xs"
            {...register('phone')}
          />
          {errors.phone && <p className="text-destructive text-[11px] font-medium">{errors.phone.message}</p>}
        </div>
      </div>

      {/* 2-Column Grid: Street & City */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="street" className="text-xs font-semibold">
            {tTrace('fields.street')}
          </Label>
          <Input id="street" placeholder={tTrace('fields.streetPlaceholder')} disabled={isPending} className="h-8 text-xs" {...register('street')} />
          {errors.street && <p className="text-destructive text-[11px] font-medium">{errors.street.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="city" className="text-xs font-semibold">
            {tTrace('fields.city')}
          </Label>
          <Input id="city" placeholder={tTrace('fields.cityPlaceholder')} disabled={isPending} className="h-8 text-xs" {...register('city')} />
          {errors.city && <p className="text-destructive text-[11px] font-medium">{errors.city.message}</p>}
        </div>
      </div>

      {/* Sanitation Status */}
      <div className="space-y-1.5">
        <Label htmlFor="sanitation_status" className="text-xs font-semibold">
          {tTrace('fields.sanitation')}
        </Label>
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
        {errors.sanitation_status && <p className="text-destructive text-[11px] font-medium">{errors.sanitation_status.message}</p>}
      </div>

      {/* Technical Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="comment" className="text-xs font-semibold">
          {tTrace('fields.comment')}
        </Label>
        <Textarea
          id="comment"
          rows={2}
          placeholder={tTrace('fields.commentPlaceholder')}
          disabled={isPending}
          className="resize-none text-xs"
          {...register('comment')}
        />
        {errors.comment && <p className="text-destructive text-[11px] font-medium">{errors.comment.message}</p>}
      </div>
    </div>
  )
}
