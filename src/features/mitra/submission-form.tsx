'use client'

import { useCallback, useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { LoadingButton } from '@/components/button/loading-button'
import { NumberField } from '@/components/form/number-field'
import { TextField } from '@/components/form/text-field'
import { TextareaField } from '@/components/form/textarea-field'
import { MitraShell } from '@/components/mitra/mitra-shell'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { buildSubmissionBody } from '@/lib/mitra/outbox-runner'
import { useDraftStore } from '@/stores/mitra-draft-store'
import { useOutboxStore } from '@/stores/mitra-outbox-store'

import { GPSCapture } from './gps-capture'
import { PhotoCapture } from './photo-capture'

import type { SubmissionPayload } from '@/lib/mitra/outbox-runner'
import type { Control, FieldValues, SubmitHandler } from 'react-hook-form'

export type SubmissionKind = 'farmer_profile' | 'harvest' | 'handover' | 'distillation' | 'shipment'

export interface SubmissionValues {
  kind: SubmissionKind
  payload: Record<string, string | number>
  lat?: number
  lon?: number
  photoFile?: File
}

const SUBMISSION_ROUTE = '/api/mitra/submissions'

const KINDS: { key: SubmissionKind; labelKey: string }[] = [
  { key: 'farmer_profile', labelKey: 'farmerProfile.title' },
  { key: 'harvest', labelKey: 'harvest.title' },
  { key: 'handover', labelKey: 'handover.title' },
  { key: 'distillation', labelKey: 'title.distillation' },
  { key: 'shipment', labelKey: 'title.shipment' }
]

type PayloadFieldDef = {
  name: string
  labelKey: string
  type: 'text' | 'number' | 'textarea'
  placeholderKey?: string
}

const PAYLOAD_FIELDS: Record<SubmissionKind, PayloadFieldDef[]> = {
  farmer_profile: [
    { name: 'nik', labelKey: 'farmerProfile.labelNik', type: 'text', placeholderKey: 'farmerProfile.placeholderNik' },
    { name: 'name', labelKey: 'farmerProfile.labelName', type: 'text', placeholderKey: 'farmerProfile.placeholderName' },
    { name: 'land_area_m2', labelKey: 'farmerProfile.labelLandAreaM2', type: 'number', placeholderKey: 'farmerProfile.placeholderLandAreaM2' },
    {
      name: 'estimated_yield_kg',
      labelKey: 'farmerProfile.labelEstimatedYieldKg',
      type: 'number',
      placeholderKey: 'farmerProfile.placeholderEstimatedYieldKg'
    }
  ],
  harvest: [
    { name: 'farm_id', labelKey: 'harvest.labelFarmId', type: 'text', placeholderKey: 'harvest.placeholderFarmId' },
    { name: 'crop_id', labelKey: 'harvest.labelCropId', type: 'text', placeholderKey: 'harvest.placeholderCropId' },
    { name: 'harvest_date', labelKey: 'harvest.labelHarvestDate', type: 'text', placeholderKey: 'harvest.placeholderHarvestDate' },
    { name: 'wet_weight_kg', labelKey: 'harvest.labelWetWeightKg', type: 'number', placeholderKey: 'harvest.placeholderWetWeightKg' }
  ],
  handover: [
    { name: 'harvest_id', labelKey: 'handover.labelHarvestId', type: 'text', placeholderKey: 'handover.placeholderHarvestId' },
    { name: 'receiver', labelKey: 'handover.labelReceiver', type: 'text', placeholderKey: 'handover.placeholderReceiver' },
    { name: 'quantity', labelKey: 'handover.labelQuantity', type: 'number', placeholderKey: 'handover.placeholderQuantity' },
    { name: 'note', labelKey: 'handover.labelNote', type: 'textarea', placeholderKey: 'handover.placeholderNote' }
  ],
  distillation: [
    { name: 'harvest_id', labelKey: 'field.harvestLot', type: 'text', placeholderKey: 'harvest.placeholderHarvestId' },
    { name: 'product_id', labelKey: 'field.product', type: 'text', placeholderKey: 'field.product' },
    { name: 'distillation_date', labelKey: 'field.distillationDate', type: 'text', placeholderKey: 'helper.distillationDate' },
    { name: 'biomass_input_kg', labelKey: 'field.biomassInputKg', type: 'number', placeholderKey: 'helper.biomassInputKg' }
  ],
  shipment: [
    { name: 'distillation_id', labelKey: 'field.harvestLot', type: 'text', placeholderKey: 'detail.kinds.distillation' },
    { name: 'shipment_date', labelKey: 'field.shipmentDate', type: 'text', placeholderKey: 'helper.distillationDate' },
    { name: 'weight_kg', labelKey: 'field.weightKg', type: 'number', placeholderKey: 'helper.weightKg' },
    { name: 'notes', labelKey: 'field.notes', type: 'textarea', placeholderKey: 'helper.notes' }
  ]
}

const submissionSchema = z.object({
  kind: z.enum(['farmer_profile', 'harvest', 'handover', 'distillation', 'shipment']),
  payload: z.record(z.string(), z.union([z.string(), z.number()])),
  lat: z.number().optional(),
  lon: z.number().optional(),
  photoFile: z.instanceof(File).optional()
})

interface SubmissionFormProps {
  partnerName: string
  role: string
}

export function SubmissionForm({ partnerName, role }: SubmissionFormProps) {
  const t = useTranslations('mitra.shell')
  const tFarmer = useTranslations('mitra.farmer')
  const tDistiller = useTranslations('mitra.distiller')

  const [isSending, setIsSending] = useState(false)
  const { isOnline } = useOnlineStatus()
  const { items, enqueue, remove, sync, isSyncing } = useOutboxStore()
  const { saveDraft, getDraft } = useDraftStore()

  const form = useForm<SubmissionValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      kind: 'farmer_profile',
      payload: {},
      lat: undefined,
      lon: undefined,
      photoFile: undefined
    }
  })
  const formControl = form.control as unknown as Control<FieldValues>

  const errors = form.formState.errors as Record<string, { message?: string }>
  const kind = form.watch('kind') as SubmissionKind | undefined
  const fields = kind ? PAYLOAD_FIELDS[kind] : []

  const fieldLabel = useCallback(
    (key: string) => {
      if (key.startsWith('farmerProfile.') || key.startsWith('harvest.') || key.startsWith('handover.')) {
        return tFarmer(key)
      }
      return tDistiller(key)
    },
    [tFarmer, tDistiller]
  )

  const fieldPlaceholder = useCallback(
    (key: string) => {
      if (!key) return undefined
      if (key.startsWith('farmerProfile.') || key.startsWith('harvest.') || key.startsWith('handover.')) {
        return tFarmer(key)
      }
      return tDistiller(key)
    },
    [tFarmer, tDistiller]
  )

  useEffect(() => {
    if (!kind) return
    const draft = getDraft(kind)
    if (draft) {
      form.reset({
        kind,
        payload: (draft.payload as Record<string, string | number>) ?? {},
        lat: undefined,
        lon: undefined,
        photoFile: undefined
      })
    }
  }, [kind, form, getDraft])

  useEffect(() => {
    if (isOnline) {
      void sync()
    }
  }, [isOnline, sync])

  const handleGpsChange = useCallback(
    (coords: { latitude: number; longitude: number } | null) => {
      form.setValue('lat', coords?.latitude ?? undefined)
      form.setValue('lon', coords?.longitude ?? undefined)
    },
    [form]
  )

  const handlePhotoChange = useCallback(
    (file: File | null) => {
      form.setValue('photoFile', file ?? undefined)
    },
    [form]
  )

  const onSubmit: SubmitHandler<SubmissionValues> = async (values) => {
    setIsSending(true)
    try {
      await saveDraft(values.kind, values.payload)
      const id = await enqueue({ route: SUBMISSION_ROUTE, payload: values, createdAt: Date.now(), attempts: 0, lastError: null })
      if (isOnline) {
        try {
          const response = await fetch(SUBMISSION_ROUTE, {
            method: 'POST',
            body: buildSubmissionBody(values as SubmissionPayload)
          })
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }
          await remove(id)
          toast.success(t('submission.sent'))
          form.reset({
            kind: values.kind,
            payload: {},
            lat: undefined,
            lon: undefined,
            photoFile: undefined
          })
        } catch {
          // Record stays in the outbox; outbox-runner retries with exponential backoff.
          toast.error(`${t('errors.submitFailed')} — ${t('status.pending', { count: items.length })}`)
        }
      } else {
        toast.info(t('status.pending', { count: items.length }))
      }
    } finally {
      setIsSending(false)
    }
  }

  return (
    <MitraShell name={partnerName} role={role} activeTab="submissions">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-md border p-3">
          <label className="mb-2 block text-xs font-semibold">{t('submission.kindLabel')}</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {KINDS.map((kindItem) => {
              const active = form.getValues().kind === kindItem.key
              return (
                <button
                  key={kindItem.key}
                  type="button"
                  onClick={() => form.setValue('kind', kindItem.key)}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border/60 bg-background text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {t(kindItem.labelKey)}
                </button>
              )
            })}
          </div>
          {errors.kind && <p className="text-destructive mt-2 text-[11px] font-medium">{errors.kind.message}</p>}
        </div>

        {fields.map((field) => (
          <div key={field.name} className="space-y-1">
            {field.type === 'textarea' ? (
              <TextareaField
                control={formControl}
                name={field.name}
                label={fieldLabel(field.labelKey)}
                placeholder={fieldPlaceholder(field.placeholderKey ?? '') ?? ''}
                rows={2}
              />
            ) : field.type === 'number' ? (
              <NumberField
                control={formControl}
                name={field.name}
                label={fieldLabel(field.labelKey)}
                placeholder={fieldPlaceholder(field.placeholderKey ?? '') ?? ''}
                step="any"
                min={0}
              />
            ) : (
              <TextField
                control={formControl}
                name={field.name}
                label={fieldLabel(field.labelKey)}
                placeholder={fieldPlaceholder(field.placeholderKey ?? '') ?? ''}
              />
            )}
          </div>
        ))}

        <div className="rounded-md border p-3">
          <label className="mb-2 block text-xs font-semibold">{t('submission.gps')}</label>
          <GPSCapture onChange={handleGpsChange} disabled={isSyncing} />
        </div>

        <div className="rounded-md border p-3">
          <label className="mb-2 block text-xs font-semibold">{t('submission.photo')}</label>
          <PhotoCapture onChange={handlePhotoChange} value={form.getValues().photoFile ?? null} disabled={isSyncing} />
          <p className="text-muted-foreground text-[10px]">{t('submission.photoLimit')}</p>
        </div>

        <div className="bg-background/90 sticky bottom-[70px] z-20 w-full px-4 pt-3 backdrop-blur">
          <LoadingButton disabled={isSending || !form.formState.isValid || isSyncing} loadingText={t('actions.sending')} className="w-full">
            {t('actions.submit')}
          </LoadingButton>
        </div>
      </form>
    </MitraShell>
  )
}
