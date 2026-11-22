'use client'

import { useMemo } from 'react'
import { Images } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { SectionCard } from '@/components/card/section-card'
import { DocumentDropzone } from '@/components/image/document-dropzone'
import { MediaGallery } from '@/components/image/media-gallery'
import { MultiImageDropzone } from '@/components/image/multi-image-dropzone'
import { VideoDropzone } from '@/components/image/video-dropzone'
import { useDeleteEntityMedia, useEntityMedia } from '@/hooks/scm/use-media'

import type { MediaDocumentItem, MediaImageItem, MediaRole, MediaVideoItem } from '@/types/components/media'
import type { ReactElement } from 'react'

export interface MediaSectionProps {
  model: string
  recordId: number
  role?: MediaRole
  aspectRatio?: number
  disabled?: boolean
  readOnly?: boolean
  legacyImageUrl?: string | null
}

export async function uploadMedia(file: File, model: string, id: number, role: MediaRole, caption: string): Promise<void> {
  const body = new FormData()
  body.set('model', model)
  body.set('id', String(id))
  body.set('role', role)
  body.set('caption', caption)
  body.set('altText', caption)
  body.set('name', file.name)
  body.set('file', file)
  const response = await fetch('/api/odoo/media/upload', { method: 'POST', body })
  const result: { success: boolean; error?: string } = await response.json()
  if (!response.ok || !result.success) throw new Error(result.error || 'MEDIA_UPLOAD_FAILED')
}

export function MediaSection({
  model,
  recordId,
  role = 'gallery',
  aspectRatio = 4 / 3,
  disabled = false,
  readOnly = false,
  legacyImageUrl
}: MediaSectionProps): ReactElement {
  const t = useTranslations('common.dropzone')
  const { data: media = [], refetch } = useEntityMedia(model, recordId)
  const deleteMutation = useDeleteEntityMedia()
  const images = useMemo(
    () =>
      media
        .filter((item) => item.kind === 'image')
        .map((item): MediaImageItem => ({
          id: item.id,
          src: item.url,
          name: item.name,
          caption: item.caption,
          altText: item.altText,
          sequence: item.sequence
        })),
    [media]
  )
  const documents = useMemo(
    () =>
      media
        .filter((item) => item.kind === 'document')
        .map((item): MediaDocumentItem => ({
          id: item.id,
          name: item.name,
          url: item.url,
          mimetype: item.mimetype,
          fileSize: item.fileSize
        })),
    [media]
  )
  const videos = useMemo(
    () =>
      media
        .filter((item) => item.kind === 'video')
        .map((item): MediaVideoItem => ({
          id: item.id,
          name: item.name,
          url: item.url,
          mimetype: item.mimetype,
          fileSize: item.fileSize,
          duration: item.duration
        })),
    [media]
  )

  const removeMissing = async (current: { id?: number }[], next: { id?: number }[]): Promise<boolean> => {
    for (const item of current) {
      if (item.id && !next.some((candidate) => candidate.id === item.id)) {
        const result = await deleteMutation.mutateAsync(item.id)
        if (!result.success) {
          toast.error(result.error || t('deleteFailed'))
          return false
        }
      }
    }
    return true
  }

  const changeImages = async (next: MediaImageItem[]) => {
    if (!(await removeMissing(images, next))) return
    const pending = next.filter((item) => item.file)
    if (!pending.length) return
    try {
      for (const item of pending) await uploadMedia(item.file as File, model, recordId, role, item.caption || item.name)
      await refetch()
      toast.success(t('uploadSuccess'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('uploadFailed'))
    }
  }

  const changeDocuments = async (next: MediaDocumentItem[]) => {
    if (!(await removeMissing(documents, next))) return
    const pending = next.filter((item) => item.file)
    if (!pending.length) return
    try {
      for (const item of pending) await uploadMedia(item.file as File, model, recordId, 'legal', item.name)
      await refetch()
      toast.success(t('uploadSuccess'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('uploadFailed'))
    }
  }

  const changeVideos = async (next: MediaVideoItem[]) => {
    if (!(await removeMissing(videos, next))) return
    const pending = next.filter((item) => item.file)
    if (!pending.length) return
    try {
      for (const item of pending) await uploadMedia(item.file as File, model, recordId, role, item.name)
      await refetch()
      toast.success(t('uploadSuccess'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('uploadFailed'))
    }
  }

  return (
    <SectionCard title={t('mediaSectionTitle')} description={t('mediaSectionDescription')} icon={Images} contentClassName="space-y-5">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">{t('galleryTitle')}</h3>
        <MultiImageDropzone
          value={images}
          onChange={(next) => void changeImages(next)}
          aspectRatio={aspectRatio}
          disabled={disabled}
          readOnly={readOnly}
          maxFiles={10}
          maxImageSize={5}
        />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">{t('documentsTitle')}</h3>
        <DocumentDropzone
          value={documents}
          onChange={(next) => void changeDocuments(next)}
          disabled={disabled}
          readOnly={readOnly}
          maxFiles={10}
          maxFileSize={10}
        />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">{t('videosTitle')}</h3>
        <VideoDropzone
          value={videos}
          onChange={(next) => void changeVideos(next)}
          disabled={disabled}
          readOnly={readOnly}
          maxFiles={6}
          maxFileSize={50}
        />
      </div>
      {legacyImageUrl && images.length === 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">{t('legacyMediaTitle')}</h3>
          <MediaGallery model={model} recordId={recordId} legacyImageUrl={legacyImageUrl} role={role} readOnly={readOnly} />
        </div>
      )}
    </SectionCard>
  )
}
