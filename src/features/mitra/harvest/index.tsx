'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { LoadingButton } from '@/components/button/loading-button'
import { SectionCard } from '@/components/card/section-card'
import { MitraNumberInput, MitraSelect, MitraTextarea, MitraTextInput } from '@/components/form/mitra-fields'
import { MitraShell } from '@/components/mitra/mitra-shell'
import { Form } from '@/components/ui/form'
import { GPSCapture } from '@/features/mitra/gps-capture'
import { PhotoCapture } from '@/features/mitra/photo-capture'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { buildSubmissionBody } from '@/lib/mitra/outbox-runner'
import { getFarmerHarvestSchema } from '@/schemas/mitra/farmer-harvest'
import { useDraftStore } from '@/stores/mitra-draft-store'
import { useOutboxStore } from '@/stores/mitra-outbox-store'

import type { SubmissionPayload } from '@/lib/mitra/outbox-runner'
import type { FarmerHarvestValues } from '@/schemas/mitra/farmer-harvest'
import type { SubmitHandler } from 'react-hook-form'

const KIND = 'harvest'
const SUBMISSION_ROUTE = '/api/mitra/submissions'

const HARVEST_CONDITION_OPTIONS = [
  { value: 'good', label: 'Good' },
  { value: 'average', label: 'Average' },
  { value: 'poor', label: 'Poor' }
]

const NUMBER_FIELDS = ['wet_weight_kg', 'initial_moisture_pct']

const buildHarvestPayload = (values: FarmerHarvestValues): Record<string, string | number> => {
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
 * FarmerHarvestForm — dedicated create form for the harvest kind
 * (Catat Panen). Syailendra Group ERP (Partner Portal, W2)
 */
export function FarmerHarvestForm({ partnerName, role }: { partnerName: string; role: string }) {
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

  const form = useForm<FarmerHarvestValues>({
    resolver: zodResolver(getFarmerHarvestSchema(t)),
    defaultValues: {
      farm_id: '',
      crop_id: '',
      harvest_date: '',
      wet_weight_kg: '',
      initial_moisture_pct: undefined,
      harvest_condition: undefined,
      quality_notes: '',
      operator_name: ''
    }
  })

  const handleGpsChange = useCallback((coords: { latitude: number; longitude: number } | null) => {
    setGpsLat(coords?.latitude ?? undefined)
    setGpsLon(coords?.longitude ?? undefined)
  }, [])

  const handlePhotoChange = useCallback((file: File | null) => {
    setPhotoFile(file)
  }, [])

  const onSubmit: SubmitHandler<FarmerHarvestValues> = async (values) => {
    setIsSending(true)
    try {
      const lat = gpsLat
      const lon = gpsLon
      if (lat === 0 && lon === 0) {
        toast.error(t('errors.zeroCoordinate'))
        return
      }
      const payload = buildHarvestPayload(values)
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
          const data = (await response.json()) as { id?: number }
          await remove(id)
          toast.success(t('toast.submitSuccess'))
          if (data.id) router.push(`/mitra/panen/${data.id}`)
          form.reset({
            farm_id: '',
            crop_id: '',
            harvest_date: '',
            wet_weight_kg: ''
          })
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
              <h2 className="text-base font-semibold">{t('harvest.title')}</h2>
              <p className="text-muted-foreground text-sm">{t('harvest.subtitle')}</p>

              <h3 className="text-sm font-semibold">{t('harvest.sectionHarvest')}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <MitraTextInput name="farm_id" label={t('harvest.labelFarmId')} placeholder={t('harvest.placeholderFarmId')} required />
                <MitraTextInput name="crop_id" label={t('harvest.labelCropId')} placeholder={t('harvest.placeholderCropId')} required />
                <MitraTextInput
                  name="harvest_date"
                  label={t('harvest.labelHarvestDate')}
                  placeholder={t('harvest.placeholderHarvestDate')}
                  type="date"
                  required
                />
                <MitraNumberInput
                  name="wet_weight_kg"
                  label={t('harvest.labelWetWeightKg')}
                  placeholder={t('harvest.placeholderWetWeightKg')}
                  required
                />
                <MitraNumberInput
                  name="initial_moisture_pct"
                  label={t('harvest.labelInitialMoisturePct')}
                  placeholder={t('harvest.placeholderInitialMoisturePct')}
                />
                <MitraSelect
                  name="harvest_condition"
                  label={t('harvest.labelHarvestCondition')}
                  placeholder={t('harvest.placeholderHarvestCondition')}
                  options={HARVEST_CONDITION_OPTIONS}
                />
                <MitraTextInput name="operator_name" label={t('harvest.labelOperatorName')} placeholder={t('harvest.placeholderOperatorName')} />
              </div>

              <MitraTextarea
                name="quality_notes"
                label={t('harvest.labelQualityNotes')}
                placeholder={t('harvest.placeholderQualityNotes')}
                rows={3}
              />
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
