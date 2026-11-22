'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { LoadingButton } from '@/components/button/loading-button'
import { SectionCard } from '@/components/card/section-card'
import { NumberField } from '@/components/form/number-field'
import { TextField } from '@/components/form/text-field'
import { TextareaField } from '@/components/form/textarea-field'
import { DetailRow } from '@/components/shared/detail-row'
import { GPSCapture } from '@/features/mitra/gps-capture'
import { PhotoCapture } from '@/features/mitra/photo-capture'
import { distillerShipmentSchema } from '@/schemas/mitra/distiller-shipment'
import { submitShipment } from '@/services/odoo/mitra/distiller-submission-service'

import type { GpsCoords } from '@/features/mitra/gps-capture'
import type { DistillerShipmentInput } from '@/schemas/mitra/distiller-shipment'
import type { Resolver } from 'react-hook-form'

const DRAFT_KEY = 'mitra.shipment.draft'

type Payload = Record<string, string | number | null>

function buildPayload(values: DistillerShipmentInput): Payload {
  const payload: Payload = {} as Payload
  Object.entries(values).forEach(([key, value]) => {
    payload[key] = value === undefined || (typeof value === 'number' && Number.isNaN(value)) ? null : (value as string | number | null)
  })
  return payload
}

export default function ShipmentForm({ accessId, initial = {} }: { accessId: number; initial?: Partial<DistillerShipmentInput> }) {
  const t = useTranslations('mitra.distiller')
  const router = useRouter()
  const locale = usePathname().split('/')[1] ?? ''
  const form = useForm<DistillerShipmentInput>({
    resolver: zodResolver(distillerShipmentSchema) as Resolver<DistillerShipmentInput, void, DistillerShipmentInput>,
    defaultValues: {
      distillationId: '',
      shipmentDate: '',
      weightKg: 0,
      notes: '',
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

  const onSubmit = async (values: DistillerShipmentInput) => {
    if (gps && (gps.latitude === 0 || gps.longitude === 0)) {
      toast.error(t('errors.gpsZero'))
      return
    }
    const payload = buildPayload(values)
    const result = await submitShipment({
      kind: 'shipment',
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
    void router.push(`/${locale}/mitra/kirim/${result.id}`)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-xl font-semibold">{t('title.shipment')}</h1>
        <p className="text-muted-foreground text-sm">{t('subtitle.shipment')}</p>
      </section>

      <SectionCard title={t('section.shipmentDetail')}>
        <TextField control={form.control} name="distillationId" label={t('field.harvestLot')} />
        <TextField control={form.control} name="shipmentDate" label={t('field.shipmentDate')} />
        <NumberField control={form.control} name="weightKg" label={t('field.weightKg')} placeholder={t('helper.weightKg')} step="any" min={0} />
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
        <TextareaField control={form.control} name="notes" label={t('field.notes')} rows={3} />
      </SectionCard>

      <DetailRow label={t('field.kind')} value={t('nav.shipment')} />

      <div className="bg-background/90 sticky bottom-[70px] z-20 w-full px-4 pt-3 backdrop-blur">
        <LoadingButton type="submit" disabled={form.formState.isSubmitting} className="w-full">
          {t('button.submit')}
        </LoadingButton>
      </div>
    </form>
  )
}
