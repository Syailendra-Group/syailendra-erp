'use client'

import { useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ExternalLink, Loader2, MapPin, Save, ShieldCheck, Sprout, User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Link, useRouter } from '@/i18n/navigation'
import { farmerFormSchema } from '@/schemas/farmer'

import { saveFarmerAction } from './actions'
import { getCommodityOptions, getFarmingMethodOptions } from './options'

import type { FarmerFormValues } from '@/schemas/farmer'
import type { ReactElement } from 'react'
import type { FarmerRecord } from './actions'

export interface FarmerFormProps {
  initialData?: FarmerRecord | null
}

export function FarmerForm({ initialData }: FarmerFormProps): ReactElement {
  const isEdit = !!initialData
  const router = useRouter()
  const tTrace = useTranslations('traceability.farmers')
  const tCommon = useTranslations('common')
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FarmerFormValues>({
    resolver: zodResolver(farmerFormSchema),
    defaultValues: {
      id: initialData?.id,
      ref: initialData?.ref || `FMR-JTG-${Math.floor(100 + Math.random() * 900)}`,
      name: initialData?.name || '',
      vat: (initialData?.vat as string) || '',
      phone: (initialData?.phone as string) || '',
      email: (initialData?.email as string) || '',
      street: initialData?.street || '',
      city: initialData?.city || 'Wonosobo',
      partner_latitude: initialData?.partner_latitude ?? -7.2145,
      partner_longitude: initialData?.partner_longitude ?? 109.9124,
      commodity: initialData?.commodity || 'gaharu',
      farming_method: initialData?.farming_method || 'organic',
      land_area_m2: initialData?.land_area_m2 ?? 2500,
      comment: (initialData?.comment as string) || ''
    }
  })

  const currentLat = watch('partner_latitude')
  const currentLng = watch('partner_longitude')
  const currentCommodity = watch('commodity')
  const currentMethod = watch('farming_method')

  const commodityOptions = getCommodityOptions(tTrace)
  const methodOptions = getFarmingMethodOptions(tTrace)

  const onSubmit = (values: FarmerFormValues) => {
    startTransition(async () => {
      const res = await saveFarmerAction(values)
      if (res.success) {
        toast.success(tTrace('messages.saved'))
        router.push('/traceability/farmers')
        router.refresh()
      } else {
        toast.error(res.error || tTrace('messages.saveFailed'))
      }
    })
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/traceability/farmers"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>{tTrace('detail.back')}</span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{isEdit ? tTrace('dialog.editTitle') : tTrace('dialog.addTitle')}</h1>
          <p className="text-muted-foreground text-xs">{isEdit ? tTrace('dialog.editDesc') : tTrace('dialog.addDesc')}</p>
        </div>
      </div>

      <form id="farmer-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Section 1: Identity & Partnership */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-semibold">
              <User className="text-primary size-4" />
              <span>{tTrace('sections.identity')}</span>
            </CardTitle>
            <CardDescription className="text-sm">{tTrace('sections.identityDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <FormFieldWrapper id="ref" label={tTrace('fields.ref')}>
              <Input id="ref" disabled={true} className="h-8 font-mono text-xs" {...register('ref')} />
            </FormFieldWrapper>

            <FormFieldWrapper id="name" label={tTrace('fields.name')} required error={errors.name?.message}>
              <Input id="name" placeholder={tTrace('fields.namePlaceholder')} disabled={isPending} className="h-8 text-xs" {...register('name')} />
            </FormFieldWrapper>

            <FormFieldWrapper id="vat" label={tTrace('fields.vat')} error={errors.vat?.message}>
              <Input
                id="vat"
                maxLength={16}
                placeholder={tTrace('fields.vatPlaceholder')}
                disabled={isPending}
                className="h-8 font-mono text-xs"
                {...register('vat')}
              />
            </FormFieldWrapper>

            <FormFieldWrapper id="phone" label={tTrace('fields.phone')} error={errors.phone?.message}>
              <Input
                id="phone"
                placeholder={tTrace('fields.phonePlaceholder')}
                disabled={isPending}
                className="h-8 font-mono text-xs"
                {...register('phone')}
              />
            </FormFieldWrapper>
          </CardContent>
        </Card>

        {/* Section 2: Domicile & Region */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-semibold">
              <MapPin className="text-primary size-4" />
              <span>{tTrace('sections.location')}</span>
            </CardTitle>
            <CardDescription className="text-sm">{tTrace('sections.locationDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
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
          </CardContent>
        </Card>

        {/* Section 3: Commodity & Cultivation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-semibold">
              <Sprout className="text-primary size-4" />
              <span>{tTrace('sections.commodity')}</span>
            </CardTitle>
            <CardDescription className="text-sm">{tTrace('sections.commodityDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <FormFieldWrapper id="commodity" label={tTrace('fields.commodity')} required error={errors.commodity?.message}>
              <SelectForm
                value={currentCommodity}
                onValueChange={(val) => setValue('commodity', val, { shouldValidate: true })}
                disabled={isPending}
                addNewAction={true}
                addNewHref="/inventory"
                addNewLabel={tTrace('actions.addCommodity')}
                items={commodityOptions}
              />
            </FormFieldWrapper>

            <FormFieldWrapper id="farming_method" label={tTrace('fields.farmingMethod')}>
              <SelectForm
                value={currentMethod}
                onValueChange={(val) => setValue('farming_method', val, { shouldValidate: true })}
                disabled={isPending}
                items={methodOptions}
              />
            </FormFieldWrapper>

            <FormFieldWrapper id="land_area_m2" label={`${tTrace('fields.landArea')} (m²)`} error={errors.land_area_m2?.message}>
              <Input
                id="land_area_m2"
                type="number"
                placeholder={tTrace('fields.landAreaPlaceholder')}
                disabled={isPending}
                className="h-8 font-mono text-xs"
                {...register('land_area_m2', { valueAsNumber: true })}
              />
            </FormFieldWrapper>
          </CardContent>
        </Card>

        {/* Section 4: Terroir & Geotagging GPS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="text-primary size-4" />
              <span>{tTrace('sections.terroir')}</span>
            </CardTitle>
            <CardDescription className="text-sm">{tTrace('sections.terroirDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <FormFieldWrapper id="partner_latitude" label="Latitude (-7.xxxx)" required error={errors.partner_latitude?.message}>
                <Input
                  id="partner_latitude"
                  type="number"
                  step="0.0001"
                  placeholder="-7.2145"
                  disabled={isPending}
                  className="h-8 font-mono text-xs"
                  {...register('partner_latitude', { valueAsNumber: true })}
                />
              </FormFieldWrapper>

              <FormFieldWrapper id="partner_longitude" label="Longitude (109.xxxx)" required error={errors.partner_longitude?.message}>
                <Input
                  id="partner_longitude"
                  type="number"
                  step="0.0001"
                  placeholder="109.9124"
                  disabled={isPending}
                  className="h-8 font-mono text-xs"
                  {...register('partner_longitude', { valueAsNumber: true })}
                />
              </FormFieldWrapper>
            </div>

            {currentLat && currentLng ? (
              <a
                href={`https://maps.google.com/?q=${currentLat},${currentLng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
              >
                <ExternalLink className="size-3.5" />
                <span>{tTrace('detail.openGmaps')}</span>
              </a>
            ) : null}
          </CardContent>
        </Card>

        {/* Section 5: Agronomy Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="font-semibold">{tTrace('sections.notes')}</CardTitle>
            <CardDescription className="text-sm">{tTrace('sections.notesDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <FormFieldWrapper id="comment" label={tTrace('fields.comment')}>
              <Textarea
                id="comment"
                rows={3}
                placeholder={tTrace('fields.commentPlaceholder')}
                disabled={isPending}
                className="resize-none text-xs"
                {...register('comment')}
              />
            </FormFieldWrapper>
          </CardContent>
        </Card>

        {/* Sticky Action Footer */}
        <div className="border-border/60 bg-background/90 sticky bottom-4 z-20 flex items-center justify-between rounded-xl border p-3 shadow-md backdrop-blur-md">
          <Button variant="outline" size="sm" asChild>
            <Link href="/traceability/farmers">{tCommon('actions.cancel')}</Link>
          </Button>
          <Button type="submit" form="farmer-form" size="sm" disabled={isPending} className="cursor-pointer gap-2 font-semibold">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span>{isPending ? tCommon('actions.loading') : isEdit ? tCommon('actions.save') : tTrace('primaryAction')}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
