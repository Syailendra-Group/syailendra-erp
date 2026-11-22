'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { LoadingButton } from '@/components/button/loading-button'
import { MitraShell } from '@/components/mitra/mitra-shell'
import { Form } from '@/components/ui/form'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { buildSubmissionBody } from '@/lib/mitra/outbox-runner'
import { getFarmerProfileSchema } from '@/schemas/mitra/farmer-profile'
import { useDraftStore } from '@/stores/mitra-draft-store'
import { useOutboxStore } from '@/stores/mitra-outbox-store'

import { FarmerEvidenceSection } from './form/evidence-section'
import { FarmerIdentitySection } from './form/identity-section'
import { FarmerLandSection } from './form/land-section'
import { FarmerLocationSection } from './form/location-section'

import type { SubmissionPayload } from '@/lib/mitra/outbox-runner'
import type { FarmerProfileValues } from '@/schemas/mitra/farmer-profile'
import type { SubmitHandler } from 'react-hook-form'

const KIND = 'farmer_profile'
const SUBMISSION_ROUTE = '/api/mitra/submissions'

const NUMBER_FIELDS = ['land_area_m2', 'estimated_yield_kg', 'farm_area_ha', 'farm_elevation_mdpl', 'farm_latitude', 'farm_longitude']

const buildFarmerProfilePayload = (values: FarmerProfileValues): Record<string, string | number> => {
  const payload: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null) continue
    if (typeof value === 'boolean') {
      payload[key] = value ? '1' : '0'
      continue
    }
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
 * FarmerProfileForm — dedicated create form for the farmer_profile kind
 * (Profil & Lahan Petani). Syailendra Group ERP (Partner Portal, W2)
 */
export function FarmerProfileForm({ partnerName, role }: { partnerName: string; role: string }) {
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

  const form = useForm<FarmerProfileValues>({
    resolver: zodResolver(getFarmerProfileSchema(t)),
    defaultValues: {
      nik: '',
      name: '',
      land_area_m2: '',
      estimated_yield_kg: undefined,
      land_ownership: undefined,
      planted_date: '',
      farm_name: '',
      farm_farming_system: undefined,
      farm_area_ha: undefined,
      farm_elevation_mdpl: undefined,
      farm_latitude: undefined,
      farm_longitude: undefined,
      farm_google_maps_url: '',
      farm_uses_pesticide: undefined,
      farm_pesticide_types: '',
      farm_uses_herbicide: undefined,
      farm_herbicide_types: '',
      farm_fertilizer_types: '',
      farm_water_source: '',
      farm_land_history: ''
    }
  })

  const handleGpsChange = useCallback((coords: { latitude: number; longitude: number } | null) => {
    setGpsLat(coords?.latitude ?? undefined)
    setGpsLon(coords?.longitude ?? undefined)
  }, [])

  const handlePhotoChange = useCallback((file: File | null) => {
    setPhotoFile(file)
  }, [])

  const onSubmit: SubmitHandler<FarmerProfileValues> = async (values) => {
    setIsSending(true)
    try {
      const lat = typeof values.farm_latitude === 'string' ? Number(values.farm_latitude) : values.farm_latitude
      const lon = typeof values.farm_longitude === 'string' ? Number(values.farm_longitude) : values.farm_longitude
      if (lat === 0 && lon === 0) {
        toast.error(t('errors.zeroCoordinate'))
        return
      }
      const payload = buildFarmerProfilePayload(values)
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
          if (data.id) router.push(`/mitra/kebun/${data.id}`)
          form.reset({
            nik: '',
            name: '',
            land_area_m2: '',
            farm_latitude: undefined,
            farm_longitude: undefined
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
          <FarmerIdentitySection />

          <FarmerLandSection />

          <FarmerLocationSection gpsLat={gpsLat} gpsLon={gpsLon} onGpsChange={handleGpsChange} disabled={isSyncing} />

          <FarmerEvidenceSection photoFile={photoFile} onPhotoChange={handlePhotoChange} disabled={isSyncing} />

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
