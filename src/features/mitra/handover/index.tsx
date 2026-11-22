'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { LoadingButton } from '@/components/button/loading-button'
import { SectionCard } from '@/components/card/section-card'
import { MitraNumberInput, MitraTextarea, MitraTextInput } from '@/components/form/mitra-fields'
import { MitraShell } from '@/components/mitra/mitra-shell'
import { Form } from '@/components/ui/form'
import { GPSCapture } from '@/features/mitra/gps-capture'
import { PhotoCapture } from '@/features/mitra/photo-capture'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { buildSubmissionBody } from '@/lib/mitra/outbox-runner'
import { getFarmerHandoverSchema } from '@/schemas/mitra/farmer-handover'
import { useDraftStore } from '@/stores/mitra-draft-store'
import { useOutboxStore } from '@/stores/mitra-outbox-store'

import type { SubmissionPayload } from '@/lib/mitra/outbox-runner'
import type { FarmerHandoverValues } from '@/schemas/mitra/farmer-handover'
import type { SubmitHandler } from 'react-hook-form'

const KIND = 'handover'
const SUBMISSION_ROUTE = '/api/mitra/submissions'

// No serah-terima/[id] detail route exists in W2, so handover submits redirect to the
// harvest list (the natural next step after recording a handover).
const HANDOVER_SUCCESS_ROUTE = '/mitra/panen'

const NUMBER_FIELDS = ['quantity']

const buildHandoverPayload = (values: FarmerHandoverValues): Record<string, string | number> => {
  const payload: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null) continue
    if (NUMBER_FIELDS.includes(key) && typeof value === 'string') {
      if (value === '') continue
      payload[key] = Number(value)
    } else {
      payload[key] = value
    }
  }
  return payload
}

/**
 * FarmerHandoverForm — dedicated create form for the handover kind
 * (Serah Terima ke Penyuling). Syailendra Group ERP (Partner Portal, W2)
 */
export function FarmerHandoverForm({ partnerName, role }: { partnerName: string; role: string }) {
  const t = useTranslations('mitra.farmer')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const [isSending, setIsSending] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [gpsLat, setGpsLat] = useState<number | undefined>(undefined)
  const [gpsLon, setGpsLon] = useState<number | undefined>(undefined)
  const { isOnline } = useOnlineStatus()
  const { items, enqueue, remove, isSyncing } = useOutboxStore()
  const { saveDraft } = useDraftStore()

  const form = useForm<FarmerHandoverValues>({
    resolver: zodResolver(getFarmerHandoverSchema(t)),
    defaultValues: {
      harvest_id: '',
      receiver: '',
      quantity: undefined,
      note: ''
    }
  })

  const handleGpsChange = useCallback((coords: { latitude: number; longitude: number } | null) => {
    setGpsLat(coords?.latitude ?? undefined)
    setGpsLon(coords?.longitude ?? undefined)
  }, [])

  const handlePhotoChange = useCallback((file: File | null) => {
    setPhotoFile(file)
  }, [])

  const onSubmit: SubmitHandler<FarmerHandoverValues> = async (values) => {
    setIsSending(true)
    try {
      const lat = gpsLat
      const lon = gpsLon
      if (lat === 0 && lon === 0) {
        toast.error(t('errors.zeroCoordinate'))
        return
      }
      const payload = buildHandoverPayload(values)
      await saveDraft(KIND, payload)

      const submission: SubmissionPayload = { kind: KIND, payload, lat, lon, photoFile }
      const id = await enqueue({
        route: SUBMISSION_ROUTE,
        payload: submission,
        createdAt: Date.now(),
        attempts: 0,
        lastError: null
      })

      if (isOnline) {
        try {
          const response = await fetch(SUBMISSION_ROUTE, {
            method: 'POST',
            body: buildSubmissionBody(submission),
            headers: { Accept: 'application/json' }
          })
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          void (await response.json())
          await remove(id)
          toast.success(t('toast.submitSuccess'))
          router.push(HANDOVER_SUCCESS_ROUTE)
          form.reset({ harvest_id: '', receiver: '', quantity: undefined, note: '' })
          setPhotoFile(null)
          setGpsLat(undefined)
          setGpsLon(undefined)
        } catch (error) {
          toast.error(`${t('toast.submitError')} — ${error instanceof Error ? error.message : String(error)}`)
        }
      } else {
        toast.info(tCommon('status.pending', { count: items.length }))
      }
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Form {...form}>
      <MitraShell name={partnerName} role={role} activeTab="submissions">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <SectionCard>
            <div className="space-y-4">
              <h2 className="text-base font-semibold">{t('handover.title')}</h2>
              <p className="text-muted-foreground text-sm">{t('handover.subtitle')}</p>

              <h3 className="text-sm font-semibold">{t('handover.sectionHandover')}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <MitraTextInput name="harvest_id" label={t('handover.labelHarvestId')} placeholder={t('handover.placeholderHarvestId')} required />
                <MitraTextInput name="receiver" label={t('handover.labelReceiver')} placeholder={t('handover.placeholderReceiver')} />
                <MitraNumberInput name="quantity" label={t('handover.labelQuantity')} placeholder={t('handover.placeholderQuantity')} />
              </div>

              <MitraTextarea name="note" label={t('handover.labelNote')} placeholder={t('handover.placeholderNote')} rows={3} />
            </div>
          </SectionCard>

          <SectionCard>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{t('gps.capture')}</h3>
              <GPSCapture onChange={handleGpsChange} disabled={isSyncing} />
              {gpsLat != null && gpsLon != null && (
                <p className="text-muted-foreground text-[11px]">
                  {gpsLat.toFixed(5)}, {gpsLon.toFixed(5)}
                </p>
              )}
            </div>
          </SectionCard>

          <SectionCard>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{t('farmerProfile.labelFarmPhoto')}</h3>
              <PhotoCapture onChange={handlePhotoChange} value={photoFile ?? null} disabled={isSyncing} />
            </div>
          </SectionCard>

          <div className="bg-background/90 sticky bottom-[70px] z-20 w-full px-4 pt-3 backdrop-blur">
            <LoadingButton disabled={isSending || !form.formState.isValid || isSyncing} loadingText={t('actions.saving')} className="w-full">
              {t('actions.submit')}
            </LoadingButton>
          </div>
        </form>
      </MitraShell>
    </Form>
  )
}
