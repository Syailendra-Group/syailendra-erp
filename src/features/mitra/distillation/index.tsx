'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { LoadingButton } from '@/components/button/loading-button'
import { SectionCard } from '@/components/card/section-card'
import { NumberField } from '@/components/form/number-field'
import { SelectForm } from '@/components/form/select-form'
import { TextField } from '@/components/form/text-field'
import { TextareaField } from '@/components/form/textarea-field'
import { DetailRow } from '@/components/shared/detail-row'
import { Label } from '@/components/ui/label'
import { GPSCapture } from '@/features/mitra/gps-capture'
import { PhotoCapture } from '@/features/mitra/photo-capture'
import { distillerDistillationSchema } from '@/schemas/mitra/distiller-distillation'
import { submitDistillation } from '@/services/odoo/mitra/distiller-submission-service'

import type { GpsCoords } from '@/features/mitra/gps-capture'
import type { DistillerDistillationInput } from '@/schemas/mitra/distiller-distillation'
import type { Resolver } from 'react-hook-form'

const DRAFT_KEY = 'mitra.distillation.draft'

const METHODS = [
  { value: 'water', labelKey: 'methodWater' },
  { value: 'steam', labelKey: 'methodSteam' }
] as const

type Payload = Record<string, string | number | null>

function buildPayload(values: DistillerDistillationInput): Payload {
  const payload: Payload = {} as Payload
  Object.entries(values).forEach(([key, value]) => {
    payload[key] = value === undefined || (typeof value === 'number' && Number.isNaN(value)) ? null : (value as string | number | null)
  })
  return payload
}

export default function DistillationForm({ accessId, initial = {} }: { accessId: number; initial?: Partial<DistillerDistillationInput> }) {
  const t = useTranslations('mitra.distiller')
  const router = useRouter()
  const locale = usePathname().split('/')[1] ?? ''
  const form = useForm<DistillerDistillationInput>({
    resolver: zodResolver(distillerDistillationSchema) as Resolver<DistillerDistillationInput, void, DistillerDistillationInput>,
    defaultValues: {
      partnerId: '',
      farmId: '',
      harvestId: '',
      productId: '',
      distillationDate: '',
      biomassInputKg: 0,
      durationHours: undefined,
      peakTempC: undefined,
      steamPressureBar: undefined,
      operatorName: '',
      method: undefined,
      steamWaterTempC: undefined,
      cyclesCount: undefined,
      steamSource: '',
      biomassCondition: '',
      crudeOilOutputKg: undefined,
      hydrosolOutputLiter: undefined,
      yieldPercent: undefined,
      oilVolumeLiter: undefined,
      filteredOilKg: undefined,
      packedOilKg: undefined,
      packingVarianceKg: undefined,
      productionNotes: '',
      lat: undefined,
      lon: undefined,
      ...initial
    }
  })

  const [gps, setGps] = useState<GpsCoords | null>(null)
  const [photo, setPhoto] = useState<File | null>(null)

  useEffect(() => {
    const sub = form.subscribe({
      callback: () => {
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(form.getValues()))
        } catch {}
      }
    })
    return sub
  }, [form])

  const onSubmit = async (values: DistillerDistillationInput) => {
    if (gps && (gps.latitude === 0 || gps.longitude === 0)) {
      toast.error(t('errors.gpsZero'))
      return
    }
    const payload = buildPayload(values)
    const result = await submitDistillation({
      kind: 'distillation',
      payload,
      accessId: String(accessId),
      lat: typeof payload.lat === 'number' ? payload.lat : null,
      lon: typeof payload.lon === 'number' ? payload.lon : null,
      photoFile: photo
    })
    if (!result.ok || !result.id) {
      toast.error(result.error?.message ?? t('errors.submitFailed'))
      return
    }
    toast.success(t('success.submitted'))
    void router.push(`/${locale}/mitra/distilasi/${result.id}`)
  }

  const methodItems = METHODS.map((m) => ({ value: m.value, label: t(m.labelKey) }))

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-xl font-semibold">{t('title.distillation')}</h1>
        <p className="text-muted-foreground text-sm">{t('subtitle.distillation')}</p>
      </section>

      <SectionCard title={t('section.identity')} description={t('label.prefill')}>
        <TextField control={form.control} name="partnerId" label={t('field.partner')} readOnly placeholder="" />
        <TextField control={form.control} name="farmId" label={t('field.farm')} readOnly placeholder="" />
      </SectionCard>

      <SectionCard title={t('section.rawMaterial')}>
        <TextField control={form.control} name="harvestId" label={t('field.harvestLot')} />
        <TextField control={form.control} name="productId" label={t('field.product')} />
        <NumberField
          control={form.control}
          name="biomassInputKg"
          label={t('field.biomassInputKg')}
          placeholder={t('helper.biomassInputKg')}
          step="any"
          min={0}
        />
      </SectionCard>

      <SectionCard title={t('section.process')}>
        <TextField control={form.control} name="distillationDate" label={t('field.distillationDate')} />
        <NumberField control={form.control} name="durationHours" label={t('field.durationHours')} step="any" min={0} />
        <NumberField control={form.control} name="peakTempC" label={t('field.peakTempC')} step="any" />
        <NumberField control={form.control} name="steamPressureBar" label={t('field.steamPressureBar')} step="any" />
        <TextField control={form.control} name="operatorName" label={t('field.operatorName')} />
        <Controller
          control={form.control}
          name="method"
          render={({ field, fieldState }) => {
            const error = fieldState.error?.message
            return (
              <div className="space-y-1">
                <Label htmlFor="method" className="text-xs font-semibold">
                  {t('field.method')}
                </Label>
                <SelectForm
                  id="method"
                  name="method"
                  items={methodItems}
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                  placeholder={t('field.method')}
                  disabled={false}
                  clearable={false}
                />
                {error && <p className="text-destructive text-[11px] font-medium">{error}</p>}
              </div>
            )
          }}
        />
      </SectionCard>

      <SectionCard title={t('section.yield')}>
        <NumberField control={form.control} name="crudeOilOutputKg" label={t('field.crudeOilOutputKg')} step="any" min={0} />
        <NumberField control={form.control} name="hydrosolOutputLiter" label={t('field.hydrosolOutputLiter')} step="any" min={0} />
        <NumberField control={form.control} name="yieldPercent" label={t('field.yieldPercent')} step="any" min={0} />
        <NumberField control={form.control} name="oilVolumeLiter" label={t('field.oilVolumeLiter')} step="any" min={0} />
        <NumberField control={form.control} name="filteredOilKg" label={t('field.filteredOilKg')} step="any" min={0} />
        <NumberField control={form.control} name="packedOilKg" label={t('field.packedOilKg')} step="any" min={0} />
        <NumberField control={form.control} name="packingVarianceKg" label={t('field.packingVarianceKg')} step="any" min={0} />
        <TextareaField control={form.control} name="productionNotes" label={t('field.productionNotes')} rows={3} />
      </SectionCard>

      <SectionCard title={t('section.evidence')}>
        <GPSCapture
          onChange={(coords) => {
            if (coords) {
              setGps(coords)
            }
          }}
        />
        <PhotoCapture onChange={setPhoto} />
      </SectionCard>

      <DetailRow label={t('field.state')} value="Draft" />
      <DetailRow label={t('field.kind')} value={t('nav.distillation')} />

      <div className="bg-background/90 sticky bottom-[70px] z-20 w-full px-4 pt-3 backdrop-blur">
        <LoadingButton type="submit" disabled={form.formState.isSubmitting} className="w-full">
          {t('button.submit')}
        </LoadingButton>
      </div>
    </form>
  )
}
