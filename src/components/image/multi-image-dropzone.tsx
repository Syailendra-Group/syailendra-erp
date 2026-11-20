'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, ArrowDown, ArrowUp, Crop, Images, Upload, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useDropzone } from 'react-dropzone'

import { ActionButton } from '@/components/button/action-button'
import { cn } from '@/lib/utils'

import { CropDialog } from './crop-dialog'
import { ImageViewer } from './image-viewer'

import type { MediaImageItem, MultiImageDropzoneProps } from '@/types/components/media'
import type { CroppedImageResult } from '@/utils/crop-image'
import type { ReactElement } from 'react'
import type { FileError, FileRejection } from 'react-dropzone'

function toBytes(megabytes: number): number {
  return megabytes * 1024 * 1024
}

export function MultiImageDropzone({
  value,
  onChange,
  aspectRatio = 4 / 3,
  maxFiles = 10,
  maxImageSize = 5,
  disabled = false,
  readOnly = false,
  className,
  error
}: MultiImageDropzoneProps): ReactElement {
  const t = useTranslations('common.dropzone')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [cropRequest, setCropRequest] = useState<{ source: string; name: string; index: number | null } | null>(null)
  const [fileRejections, setFileRejections] = useState<FileRejection[]>([])
  const cropSavedRef = useRef(false)

  const pendingFile = pendingFiles[0]
  const pendingPreview = useMemo(() => (pendingFile ? URL.createObjectURL(pendingFile) : null), [pendingFile])
  useEffect(
    () => () => {
      if (pendingPreview) URL.revokeObjectURL(pendingPreview)
    },
    [pendingPreview]
  )

  const cropSource = cropRequest?.source ?? pendingPreview
  const cropFileName = cropRequest?.name ?? pendingFile?.name ?? 'image.webp'
  const cropOpen = Boolean(cropSource)

  const validator = useCallback(
    (file: File): FileError | null => {
      if (!file.type.startsWith('image/')) return { code: 'file-invalid-type', message: t('fileTypeError') }
      return file.size > toBytes(maxImageSize) ? { code: 'file-too-large', message: t('fileSizeError', { max: maxImageSize }) } : null
    },
    [maxImageSize, t]
  )

  const handleDrop = useCallback((acceptedFiles: File[], rejections: FileRejection[]) => {
    setFileRejections(rejections)
    if (acceptedFiles.length) setPendingFiles((current) => [...current, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/jpeg': ['.jpeg', '.jpg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
    disabled: disabled || readOnly || value.length + pendingFiles.length >= maxFiles,
    maxFiles: Math.max(1, maxFiles - value.length - pendingFiles.length),
    multiple: true,
    onDrop: handleDrop,
    validator
  })

  const handleCropResult = useCallback(
    (result: CroppedImageResult) => {
      const item: MediaImageItem = {
        ...(cropRequest?.index !== null && cropRequest?.index !== undefined ? value[cropRequest.index] : undefined),
        file: result.file,
        preview: result.objectUrl,
        base64: result.base64,
        name: cropFileName.replace(/\.[^.]+$/, '.webp')
      }
      if (cropRequest?.index !== null && cropRequest?.index !== undefined) {
        const existing = value[cropRequest.index]
        if (existing?.preview && !existing.id) URL.revokeObjectURL(existing.preview)
        onChange(value.map((current, index) => (index === cropRequest.index ? item : current)))
      } else {
        onChange([...value, item])
        setPendingFiles((current) => current.slice(1))
      }
      cropSavedRef.current = true
      setCropRequest(null)
    },
    [cropFileName, cropRequest, onChange, value]
  )

  const closeCrop = useCallback(
    (open: boolean) => {
      if (open) return
      if (!cropSavedRef.current) {
        if (cropRequest?.index !== null && cropRequest?.index !== undefined) setCropRequest(null)
        else setPendingFiles((current) => current.slice(1))
      }
      cropSavedRef.current = false
    },
    [cropRequest]
  )

  const remove = (index: number) => {
    const removed = value[index]
    if (removed?.preview && !removed.id) URL.revokeObjectURL(removed.preview)
    onChange(value.filter((_item, currentIndex) => currentIndex !== index))
  }
  const openCrop = (source: string, name: string, index: number) => {
    setCropRequest({ source, name, index })
  }
  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= value.length) return
    const next = [...value]
    const [item] = next.splice(index, 1)
    if (item) next.splice(nextIndex, 0, item)
    onChange(next.map((entry, order) => ({ ...entry, sequence: order * 10 })))
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {value.map((item, index) => {
          const src = item.preview ?? item.src ?? null
          return (
            <div
              key={item.id ?? item.clientId ?? `${item.name}-${index}`}
              style={{ aspectRatio }}
              className="bg-card group relative overflow-hidden rounded-xl border p-1 shadow-xs"
            >
              <ImageViewer
                src={src}
                alt={item.altText || item.name}
                fallbackText={item.name}
                fill
                objectFit="cover"
                className="size-full rounded-lg"
              />
              {!disabled && !readOnly && (
                <>
                  <div className="absolute top-2 right-2 z-20 flex gap-1">
                    <ActionButton
                      variant="custom"
                      icon={ArrowUp}
                      label={t('moveUp')}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      className="size-7 rounded-full border-2 !border-white !bg-zinc-900/90 !text-white shadow-lg ring-1 ring-black/40"
                    />
                    <ActionButton
                      variant="custom"
                      icon={ArrowDown}
                      label={t('moveDown')}
                      disabled={index === value.length - 1}
                      onClick={() => move(index, 1)}
                      className="size-7 rounded-full border-2 !border-white !bg-zinc-900/90 !text-white shadow-lg ring-1 ring-black/40"
                    />
                  </div>
                  <div className="absolute right-2 bottom-2 z-20 flex gap-1">
                    <ActionButton
                      variant="custom"
                      icon={Crop}
                      label={t('cropAction')}
                      onClick={() => src && openCrop(src, item.name, index)}
                      className="size-7 rounded-full border-2 !border-white !bg-zinc-900/90 !text-white shadow-lg ring-1 ring-black/40"
                    />
                    <ActionButton
                      variant="delete"
                      icon={X}
                      label={t('removeFile')}
                      onClick={() => remove(index)}
                      className="size-7 rounded-full border-2 !border-white !bg-red-600 !text-white shadow-lg ring-1 ring-black/40"
                    />
                  </div>
                </>
              )}
              <span className="pointer-events-none absolute bottom-2 left-2 max-w-[55%] truncate rounded bg-zinc-900/80 px-1.5 py-0.5 text-[10px] text-white">
                {item.name}
              </span>
            </div>
          )
        })}
        <div
          {...getRootProps()}
          style={{ aspectRatio }}
          className={cn(
            'border-border/80 bg-muted/40 hover:bg-muted/60 hover:border-primary/50 relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-3 text-center transition-all',
            isDragActive && 'border-primary/70 bg-primary/5',
            disabled || readOnly || value.length + pendingFiles.length >= maxFiles ? 'cursor-not-allowed opacity-60' : ''
          )}
        >
          <input {...getInputProps()} />
          <Images className="text-muted-foreground mb-2 size-6" />
          <p className="text-foreground/90 text-[11px] font-semibold">{t('multiDragDropHelp')}</p>
          <p className="text-muted-foreground mt-1 text-[10px]">{t('multiImagesOnly', { size: maxImageSize, count: maxFiles })}</p>
          <Upload className="text-muted-foreground mt-2 size-4" />
        </div>
      </div>
      <p className="text-muted-foreground text-xs">{t('imageCount', { count: value.length + pendingFiles.length, max: maxFiles })}</p>
      {fileRejections.length > 0 && (
        <div className="border-destructive/20 bg-destructive/5 text-destructive flex items-start gap-2 rounded-lg border px-3 py-2 text-xs">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <div className="space-y-1">
            {fileRejections.slice(0, 3).map(({ errors: rejectionErrors, file }) => (
              <p key={`${file.name}-${file.size}`}>{rejectionErrors[0]?.message || t('fileTypeError')}</p>
            ))}
          </div>
        </div>
      )}
      {error && <p className="text-destructive text-xs font-medium">{error}</p>}
      {cropOpen && cropSource && (
        <CropDialog
          open={cropOpen}
          onOpenChange={closeCrop}
          imageSrc={cropSource}
          aspectRatio={aspectRatio}
          fileName={cropFileName.replace(/\.[^.]+$/, '.webp')}
          mimeType="image/webp"
          onCropCompleteResult={handleCropResult}
          maxOutputSizeBytes={Math.floor(1.5 * 1024 * 1024)}
        />
      )}
    </div>
  )
}
