'use client'

import { useTranslations } from 'next-intl'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import type { FarmerFormValues } from '@/schemas/farmer'
import type { ReactElement } from 'react'
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'

export interface FarmerFieldsProps {
  register: UseFormRegister<FarmerFormValues>
  errors: FieldErrors<FarmerFormValues>
  watch: UseFormWatch<FarmerFormValues>
  setValue: UseFormSetValue<FarmerFormValues>
  isPending: boolean
  isEdit: boolean
}

export function FarmerFields({ register, errors, watch, setValue, isPending, isEdit }: FarmerFieldsProps): ReactElement {
  const tTrace = useTranslations('traceability.farmers')

  return (
    <div className="grid grid-cols-6 items-center gap-x-3 gap-y-2.5">
      {/* Farmer ID */}
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

      {/* Full Name */}
      <Label htmlFor="name" className="col-span-2 text-end text-xs font-semibold">
        {tTrace('fields.name')}
      </Label>
      <div className="col-span-4">
        <Input id="name" placeholder={tTrace('fields.namePlaceholder')} disabled={isPending} className="h-8 text-xs" {...register('name')} />
      </div>
      {errors.name && <span className="text-destructive col-span-4 col-start-3 text-[11px]">{errors.name.message}</span>}

      {/* NIK */}
      <Label htmlFor="vat" className="col-span-2 text-end text-xs font-semibold">
        {tTrace('fields.vat')}
      </Label>
      <div className="col-span-4">
        <Input
          id="vat"
          maxLength={16}
          placeholder={tTrace('fields.vatPlaceholder')}
          disabled={isPending}
          className="h-8 font-mono text-xs"
          {...register('vat')}
        />
      </div>
      {errors.vat && <span className="text-destructive col-span-4 col-start-3 text-[11px]">{errors.vat.message}</span>}

      {/* Village & Regency */}
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

      {/* GPS Latitude & Longitude */}
      <Label htmlFor="partner_latitude" className="col-span-2 text-end text-xs font-semibold">
        {tTrace('table.coordinates')}
      </Label>
      <div className="col-span-4 grid grid-cols-2 gap-2">
        <Input
          id="partner_latitude"
          type="number"
          step="0.0001"
          placeholder="Latitude (-7.xxxx)"
          disabled={isPending}
          className="h-8 font-mono text-xs"
          {...register('partner_latitude')}
        />
        <Input
          id="partner_longitude"
          type="number"
          step="0.0001"
          placeholder="Longitude (109.xxxx)"
          disabled={isPending}
          className="h-8 font-mono text-xs"
          {...register('partner_longitude')}
        />
      </div>

      {/* Commodity & Farming Method */}
      <Label htmlFor="commodity" className="col-span-2 text-end text-xs font-semibold">
        {tTrace('fields.commodity')}
      </Label>
      <div className="col-span-4 grid grid-cols-2 gap-2">
        <Select value={watch('commodity')} onValueChange={(val) => setValue('commodity', val, { shouldValidate: true })} disabled={isPending}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={tTrace('fields.commodityPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gaharu">{tTrace('commodities.gaharu')}</SelectItem>
            <SelectItem value="nilam">{tTrace('commodities.nilam')}</SelectItem>
            <SelectItem value="serai">{tTrace('commodities.serai')}</SelectItem>
            <SelectItem value="kopi">{tTrace('commodities.kopi')}</SelectItem>
            <SelectItem value="cengkeh">{tTrace('commodities.cengkeh')}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={watch('farming_method')}
          onValueChange={(val) => setValue('farming_method', val, { shouldValidate: true })}
          disabled={isPending}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={tTrace('fields.farmingMethodPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="organic">{tTrace('methods.organic')}</SelectItem>
            <SelectItem value="conventional">{tTrace('methods.conventional')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Phone & Land Area */}
      <Label htmlFor="phone" className="col-span-2 text-end text-xs font-semibold">
        {tTrace('fields.phone')}
      </Label>
      <div className="col-span-4 grid grid-cols-2 gap-2">
        <Input
          id="phone"
          placeholder={tTrace('fields.phonePlaceholder')}
          disabled={isPending}
          className="h-8 font-mono text-xs"
          {...register('phone')}
        />
        <Input
          id="land_area_m2"
          type="number"
          placeholder={tTrace('fields.landAreaPlaceholder')}
          disabled={isPending}
          className="h-8 font-mono text-xs"
          {...register('land_area_m2')}
        />
      </div>

      {/* Agronomist Notes */}
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
