'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Crop, FileImage, Upload, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useDropzone } from 'react-dropzone'

import { ActionButton } from '@/components/button/action-button'
import { cn } from '@/lib/utils'
import { fileToBase64 } from '@/utils/crop-image'
import { resolveImageSrc } from '@/utils/get-initials'

import { CropDialog } from './crop-dialog'
import { ImageViewer } from './image-viewer'

import type { CroppedImageResult } from '@/utils/crop-image'
import type { ReactElement } from 'react'
import type { Accept, FileError, FileRejection } from 'react-dropzone'

export interface ImageDropzoneProps {
  value: File | string | null | undefined
  onChange: (value: File | string | null) => void
  valueMode?: 'base64' | 'file'
  aspectRatio?: number
  maxImageSize?: number
  disabled?: boolean
  className?: string
  error?: string
}

function toBytes(megabytes: number): number {
  return megabytes * 1024 * 1024
}

export function ImageDropzone({
  value,
  onChange,
  valueMode = 'base64',
  aspectRatio,
  maxImageSize,
  disabled = false,
  className,
  error
}: ImageDropzoneProps): ReactElement {
  const t = useTranslations('common.dropzone')
  const envSize = Number(process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE_MB)
  const resolvedMaxSizeMb = maxImageSize ?? (!isNaN(envSize) && envSize > 0 ? envSize : 5)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState('')
  const [cropFileName, setCropFileName] = useState('image.webp')
  const [fileRejections, setFileRejections] = useState<FileRejection[]>([])

  const previewUrl = useMemo(() => {
    if (!value) return null
    if (typeof value === 'string') return resolveImageSrc(value)
    return URL.createObjectURL(value)
  }, [value])

  useEffect(
    () => () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    },
    [previewUrl]
  )

  const commitValue = useCallback(
    async (file: File) => {
      onChange(valueMode === 'base64' ? await fileToBase64(file) : file)
    },
    [onChange, valueMode]
  )

  const processFile = useCallback(
    (file: File) => {
      if (aspectRatio !== undefined) {
        const url = URL.createObjectURL(file)
        setCropImageSrc(url)
        setCropFileName(file.name.replace(/\.[^.]+$/, '.webp'))
        setCropDialogOpen(true)
        return
      }
      void commitValue(file)
    },
    [aspectRatio, commitValue]
  )

  const handleCropResult = useCallback(
    (result: CroppedImageResult) => {
      onChange(valueMode === 'base64' ? result.base64 : result.file)
    },
    [onChange, valueMode]
  )

  const validator = useCallback(
    (file: File): FileError | null => {
      if (!file.type.startsWith('image/')) return { code: 'file-invalid-type', message: t('fileTypeError') }
      return file.size > toBytes(resolvedMaxSizeMb) ? { code: 'file-too-large', message: t('fileSizeError', { max: resolvedMaxSizeMb }) } : null
    },
    [resolvedMaxSizeMb, t]
  )

  const handleDrop = useCallback(
    (acceptedFiles: File[], rejections: FileRejection[]) => {
      setFileRejections(rejections)
      if (acceptedFiles[0]) processFile(acceptedFiles[0])
    },
    [processFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/jpeg': ['.jpeg', '.jpg'], 'image/png': ['.png'], 'image/webp': ['.webp'] } satisfies Accept,
    disabled,
    maxFiles: 1,
    multiple: false,
    onDrop: handleDrop,
    validator
  })

  const sizeClass = aspectRatio === undefined ? 'w-full min-h-37.5' : aspectRatio > 1 ? 'w-56 sm:w-60' : 'w-40 sm:w-44'

  return (
    <div className={cn('space-y-2.5', className)}>
      {!value ? (
        <div
          {...getRootProps()}
          style={aspectRatio ? { aspectRatio } : undefined}
          className={cn(
            'border-border/80 bg-muted/40 hover:bg-muted/60 hover:border-primary/50 relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-3 text-center transition-all select-none',
            sizeClass,
            isDragActive && 'border-primary/70 bg-primary/5 scale-[0.99]',
            disabled && 'hover:bg-muted/40 cursor-not-allowed opacity-60',
            error && 'border-destructive/60'
          )}
        >
          <input {...getInputProps()} />
          <div className="bg-background text-muted-foreground/80 mb-2 flex size-9 items-center justify-center rounded-full border shadow-xs">
            <Upload className="size-4" />
          </div>
          <p className="text-foreground/90 text-[11px] leading-snug font-semibold">{t('dragDropHelp')}</p>
          <p className="text-muted-foreground mt-0.5 text-[10px] leading-tight">{t('imagesOnly', { size: resolvedMaxSizeMb })}</p>
        </div>
      ) : (
        <div
          style={aspectRatio ? { aspectRatio } : undefined}
          className={cn(
            'bg-card group relative flex items-center justify-center overflow-hidden rounded-xl border p-1 shadow-xs',
            sizeClass,
            !aspectRatio && 'aspect-video'
          )}
        >
          <ImageViewer src={previewUrl} alt={t('previewAlt')} fill objectFit="contain" className="h-full w-full rounded-lg" imageClassName="p-2" />
          {!disabled && (
            <div className="absolute top-2 right-2 z-20">
              <ActionButton
                variant="delete"
                icon={X}
                label={t('removeFile')}
                onClick={() => onChange(null)}
                className="size-7 rounded-full border-2 border-white! bg-red-600! text-white! shadow-lg ring-1 ring-black/40"
              />
            </div>
          )}
          {!disabled && aspectRatio !== undefined && previewUrl && (
            <div className="absolute right-2 bottom-2 z-20">
              <ActionButton
                variant="custom"
                icon={Crop}
                label={t('cropAction')}
                onClick={() => {
                  setCropImageSrc(previewUrl)
                  setCropDialogOpen(true)
                }}
                className="size-7 rounded-full border-2 border-white! bg-zinc-900/90! text-white! shadow-lg ring-1 ring-black/40"
              />
            </div>
          )}
          <div className="pointer-events-none absolute bottom-2 left-2 z-10 flex max-w-[60%] items-center gap-1 rounded-lg border border-white/20 bg-zinc-900/80 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 shadow-md backdrop-blur-md transition-opacity group-hover:opacity-100">
            <FileImage className="size-3 shrink-0" />
            <span className="truncate">{typeof value === 'string' ? t('existingFile') : value.name}</span>
          </div>
        </div>
      )}
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
      {aspectRatio !== undefined && cropDialogOpen && (
        <CropDialog
          open={cropDialogOpen}
          onOpenChange={setCropDialogOpen}
          imageSrc={cropImageSrc}
          aspectRatio={aspectRatio}
          fileName={cropFileName}
          mimeType="image/webp"
          maxOutputSizeBytes={Math.floor(1.5 * 1024 * 1024)}
          onCropCompleteResult={handleCropResult}
        />
      )}
    </div>
  )
}
