'use client'

import { useMemo } from 'react'
import { Download, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ActionButton } from '@/components/button/action-button'
import { ImageViewer } from '@/components/image/image-viewer'
import { Skeleton } from '@/components/ui/skeleton'
import { useDeleteEntityMedia, useEntityMedia } from '@/hooks/scm/use-media'
import { cn } from '@/lib/utils'

import type { MediaGalleryProps, MediaRecord } from '@/types/components/media'
import type { ReactElement } from 'react'

export function MediaGallery({ model, recordId, legacyImageUrl, role, readOnly = false, className }: MediaGalleryProps): ReactElement {
  const t = useTranslations('common.dropzone')
  const { data: media = [], isLoading } = useEntityMedia(model, recordId)
  const deleteMutation = useDeleteEntityMedia()
  const items = useMemo(() => {
    const savedImages = media.filter((item) => item.kind === 'image' && (!role || item.role === role))
    const hasSavedProfile = savedImages.some((item) => item.role === 'profile')
    const fallback =
      legacyImageUrl && !hasSavedProfile
        ? [
            {
              id: 0,
              kind: 'image' as const,
              name: t('legacyImage'),
              url: legacyImageUrl,
              mimetype: 'image/png',
              fileSize: 0,
              caption: '',
              altText: '',
              role: 'gallery' as const,
              sequence: -1
            } as MediaRecord
          ]
        : []
    return [...fallback, ...savedImages]
  }, [legacyImageUrl, media, role, t])

  const handleDelete = async (id: number) => {
    const result = await deleteMutation.mutateAsync(id)
    if (!result.success) toast.error(result.error || t('deleteFailed'))
    else toast.success(t('deleteSuccess'))
  }

  if (isLoading)
    return (
      <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4', className)}>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="aspect-4/3 rounded-xl" />
        ))}
      </div>
    )

  if (items.length === 0) return <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-xs">{t('noMedia')}</p>

  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4', className)}>
      {items.map((item) => (
        <div
          key={item.id || item.url}
          className="bg-card group relative overflow-hidden rounded-xl border p-1 shadow-xs"
          style={{ aspectRatio: '4 / 3' }}
        >
          <ImageViewer
            src={item.url}
            alt={item.altText || item.name}
            fallbackText={item.name}
            fill
            objectFit="cover"
            className="size-full rounded-lg"
          />
          <span className="pointer-events-none absolute right-2 bottom-2 left-2 truncate rounded bg-zinc-900/75 px-2 py-1 text-[10px] text-white">
            {item.caption || item.name}
          </span>
          {item.id > 0 && !readOnly && (
            <div className="absolute top-2 right-2 z-20 flex gap-1">
              <a
                href={item.url}
                download={item.name}
                aria-label={t('downloadFile')}
                className="bg-background/90 hover:bg-background flex size-8 items-center justify-center rounded-full border shadow-sm"
              >
                <Download className="size-4" />
              </a>
              <ActionButton
                variant="delete"
                icon={Trash2}
                label={t('removeFile')}
                disabled={deleteMutation.isPending}
                onClick={() => void handleDelete(item.id)}
                className="size-8 rounded-full border-2 !border-white !bg-red-600 !text-white shadow-lg ring-1 ring-black/40"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
