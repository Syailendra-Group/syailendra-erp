'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Crop, ImageIcon, Upload, X } from 'lucide-react'
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

export interface FileDropzoneProps {
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

export function FileDropzone({
  value,
  onChange,
  valueMode = 'base64',
  aspectRatio,
  maxImageSize,
  disabled = false,
  className,
  error
}: FileDropzoneProps): ReactElement {
  const t = useTranslations('common.dropzone')

  // Resolve max image size from env or prop (fallback: 2MB)
  const envSize = Number(process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE_MB)
  const resolvedMaxSizeMb = maxImageSize ?? (!isNaN(envSize) && envSize > 0 ? envSize : 2)

  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState('')
  const [cropFileName, setCropFileName] = useState('image.png')
  const [fileRejections, setFileRejections] = useState<FileRejection[]>([])

  const previewUrl = useMemo(() => {
    if (!value) return null
    if (typeof value === 'string') return resolveImageSrc(value)
    return URL.createObjectURL(value)
  }, [value])

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const commitValue = useCallback(
    async (file: File) => {
      if (valueMode === 'base64') {
        const base64 = await fileToBase64(file)
        onChange(base64)
      } else {
        onChange(file)
      }
    },
    [onChange, valueMode]
  )

  const processFile = useCallback(
    (file: File) => {
      if (aspectRatio !== undefined && file.type.startsWith('image/')) {
        setCropImageSrc(URL.createObjectURL(file))
        setCropFileName(file.name)
        setCropDialogOpen(true)
        return
      }
      void commitValue(file)
    },
    [aspectRatio, commitValue]
  )

  const handleCropResult = useCallback(
    (result: CroppedImageResult) => {
      if (valueMode === 'base64') {
        onChange(result.base64)
      } else {
        onChange(result.file)
      }
    },
    [onChange, valueMode]
  )

  const validator = useCallback(
    (file: File): FileError | null => {
      const maxSize = toBytes(resolvedMaxSizeMb)
      return file.size > maxSize ? { code: 'file-too-large', message: t('fileSizeError', { max: resolvedMaxSizeMb }) } : null
    },
    [resolvedMaxSizeMb, t]
  )

  const handleDrop = useCallback(
    (acceptedFiles: File[], rejections: FileRejection[]) => {
      setFileRejections(rejections)
      if (acceptedFiles.length === 0) return
      const file = acceptedFiles[0]
      if (file) {
        processFile(file)
      }
    },
    [processFile]
  )

  const acceptConfig: Accept = {
    'image/jpeg': ['.jpeg', '.jpg'],
    'image/png': ['.png'],
    'image/webp': ['.webp']
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptConfig,
    disabled,
    maxFiles: 1,
    multiple: false,
    onDrop: handleDrop,
    validator
  })

  const handleRemove = () => {
    onChange(null)
  }

  // Explicit pixel/rem width so absolute-fill ImageViewer never collapses to 0px inside items-start flex parents
  const sizeClass = aspectRatio === undefined ? 'w-full min-h-[150px]' : aspectRatio > 1 ? 'w-56 sm:w-60' : 'w-40 sm:w-44'

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
          <ImageViewer src={previewUrl} alt="Uploaded Preview" fill objectFit="contain" className="h-full w-full rounded-lg" imageClassName="p-2" />

          {/* File name badge on bottom-left (shown on hover) */}
          <div className="pointer-events-none absolute bottom-2 left-2 z-10 flex max-w-[60%] items-center gap-1 rounded-lg border border-white/20 bg-zinc-900/80 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 shadow-md backdrop-blur-md transition-opacity group-hover:opacity-100">
            <ImageIcon className="size-3 shrink-0" />
            <span className="truncate">{typeof value === 'string' ? 'Asset' : value.name}</span>
          </div>

          {/* High-Visibility Floating Remove ActionButton on Top-Right (Dual-Contrast Ring for Light & Dark Images) */}
          {!disabled && (
            <div className="absolute top-2 right-2 z-20">
              <ActionButton
                variant="delete"
                icon={X}
                label={t('removeFile')}
                onClick={handleRemove}
                className="size-7 rounded-full border-2 !border-white !bg-red-600 !text-white shadow-lg ring-1 ring-black/40 transition-transform hover:scale-105 hover:!bg-red-700 hover:!text-white dark:!border-white dark:!bg-red-600 dark:hover:!bg-red-700"
              />
            </div>
          )}

          {/* High-Visibility Floating Crop ActionButton on Bottom-Right (Dual-Contrast Ring for Light & Dark Images) */}
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
                className="size-7 rounded-full border-2 !border-white !bg-zinc-900/90 !text-white shadow-lg ring-1 ring-black/40 backdrop-blur-md transition-transform hover:scale-105 hover:!bg-zinc-950 hover:!text-white dark:!border-white dark:!bg-zinc-900/90 dark:hover:!bg-zinc-950"
              />
            </div>
          )}
        </div>
      )}

      {fileRejections.length > 0 && (
        <div className="border-destructive/20 bg-destructive/5 text-destructive flex items-start gap-2 rounded-lg border px-3 py-2 text-xs">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <div className="space-y-1">
            {fileRejections.slice(0, 3).map(({ errors, file }) => (
              <p key={`${file.name}-${file.size}`}>{errors[0]?.message || t('fileTypeError')}</p>
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
          onCropCompleteResult={handleCropResult}
        />
      )}
    </div>
  )
}
