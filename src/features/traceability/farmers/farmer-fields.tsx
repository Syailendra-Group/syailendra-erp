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
    <div className="space-y-3.5">
      {/* 2-Column Responsive Form Fields */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Farmer ID */}
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

        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-semibold">
            {tTrace('fields.name')}
          </Label>
          <Input id="name" placeholder={tTrace('fields.namePlaceholder')} disabled={isPending} className="h-8 text-xs" {...register('name')} />
          {errors.name && <p className="text-destructive text-[11px] font-medium">{errors.name.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* NIK */}
        <div className="space-y-1.5">
          <Label htmlFor="vat" className="text-xs font-semibold">
            {tTrace('fields.vat')}
          </Label>
          <Input
            id="vat"
            maxLength={16}
            placeholder={tTrace('fields.vatPlaceholder')}
            disabled={isPending}
            className="h-8 font-mono text-xs"
            {...register('vat')}
          />
          {errors.vat && <p className="text-destructive text-[11px] font-medium">{errors.vat.message}</p>}
        </div>

        {/* Phone */}
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

      {/* Village & Regency */}
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

      {/* GPS Coordinates */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="partner_latitude" className="text-xs font-semibold">
            Latitude (-7.xxxx)
          </Label>
          <Input
            id="partner_latitude"
            type="number"
            step="0.0001"
            placeholder="-7.2145"
            disabled={isPending}
            className="h-8 font-mono text-xs"
            {...register('partner_latitude')}
          />
          {errors.partner_latitude && <p className="text-destructive text-[11px] font-medium">{errors.partner_latitude.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="partner_longitude" className="text-xs font-semibold">
            Longitude (109.xxxx)
          </Label>
          <Input
            id="partner_longitude"
            type="number"
            step="0.0001"
            placeholder="109.9124"
            disabled={isPending}
            className="h-8 font-mono text-xs"
            {...register('partner_longitude')}
          />
          {errors.partner_longitude && <p className="text-destructive text-[11px] font-medium">{errors.partner_longitude.message}</p>}
        </div>
      </div>

      {/* Commodity & Farming Method */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="commodity" className="text-xs font-semibold">
            {tTrace('fields.commodity')}
          </Label>
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
          {errors.commodity && <p className="text-destructive text-[11px] font-medium">{errors.commodity.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="farming_method" className="text-xs font-semibold">
            {tTrace('fields.farmingMethod')}
          </Label>
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
          {errors.farming_method && <p className="text-destructive text-[11px] font-medium">{errors.farming_method.message}</p>}
        </div>
      </div>

      {/* Land Area */}
      <div className="space-y-1.5">
        <Label htmlFor="land_area_m2" className="text-xs font-semibold">
          {tTrace('fields.landArea')}
        </Label>
        <Input
          id="land_area_m2"
          type="number"
          placeholder={tTrace('fields.landAreaPlaceholder')}
          disabled={isPending}
          className="h-8 font-mono text-xs"
          {...register('land_area_m2')}
        />
        {errors.land_area_m2 && <p className="text-destructive text-[11px] font-medium">{errors.land_area_m2.message}</p>}
      </div>

      {/* Agronomist Notes */}
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
