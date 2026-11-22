'use client'

import { useCallback } from 'react'
import { Film, Upload, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useDropzone } from 'react-dropzone'

import { ActionButton } from '@/components/button/action-button'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { MediaVideoItem, VideoDropzoneProps } from '@/types/components/media'
import type { ReactElement } from 'react'
import type { FileError } from 'react-dropzone'

const VIDEO_TYPES = ['video/mp4', 'video/webm']

function toBytes(megabytes: number): number {
  return megabytes * 1024 * 1024
}

/** Gallery video picker. Mirrors `DocumentDropzone`: the route does the real validation. */
export function VideoDropzone({
  value,
  onChange,
  disabled = false,
  readOnly = false,
  maxFiles = 6,
  maxFileSize = 50,
  className,
  error
}: VideoDropzoneProps): ReactElement {
  const t = useTranslations('common.dropzone')
  const validator = useCallback(
    (file: File): FileError | null => {
      if (file.size > toBytes(maxFileSize)) return { code: 'file-too-large', message: t('fileSizeError', { max: maxFileSize }) }
      const name = file.name.toLowerCase()
      const accepted = VIDEO_TYPES.includes(file.type) || name.endsWith('.mp4') || name.endsWith('.webm')
      if (!accepted) return { code: 'file-invalid-type', message: t('videoOnly') }
      return null
    },
    [maxFileSize, t]
  )

  const onDrop = useCallback(
    (accepted: File[]) => {
      const additions = accepted.map((file): MediaVideoItem => ({
        file,
        name: file.name,
        mimetype: file.type || 'video/mp4',
        fileSize: file.size
      }))
      onChange([...value, ...additions].slice(0, maxFiles))
    },
    [maxFiles, onChange, value]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'video/mp4': ['.mp4'], 'video/webm': ['.webm'] },
    disabled: disabled || readOnly || value.length >= maxFiles,
    maxFiles: Math.max(1, maxFiles - value.length),
    maxSize: toBytes(maxFileSize),
    multiple: true,
    onDrop,
    validator
  })

  return (
    <div className={cn('space-y-3', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-border/80 bg-muted/40 hover:bg-muted/60 hover:border-primary/50 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-colors',
          isDragActive && 'border-primary bg-primary/5',
          (disabled || readOnly || value.length >= maxFiles) && 'cursor-not-allowed opacity-60'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="text-muted-foreground mb-2 size-5" />
        <p className="text-foreground/90 text-xs font-semibold">{t('videoDragDropHelp')}</p>
        <p className="text-muted-foreground mt-1 text-[11px]">{t('videoOnlyWithLimits', { size: maxFileSize, count: maxFiles })}</p>
      </div>
      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((item, index) => (
            <li
              key={item.id ?? `${item.name}-${item.file?.lastModified ?? index}`}
              className="bg-muted/30 flex items-center gap-3 rounded-lg border px-3 py-2.5"
            >
              <Film className="text-primary size-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-xs font-medium">{item.name}</span>
              <span className="text-muted-foreground text-[10px]">{((item.fileSize ?? item.file?.size ?? 0) / 1024 / 1024).toFixed(2)} MB</span>
              {!disabled && !readOnly && (
                <ActionButton
                  variant="delete"
                  icon={X}
                  label={t('removeFile')}
                  onClick={() => onChange(value.filter((_current, i) => i !== index))}
                />
              )}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-destructive text-xs font-medium">{error}</p>}
      {!disabled && !readOnly && value.length > 0 && (
        <Button type="button" variant="outline" onClick={() => onChange(value.filter((item) => item.id !== undefined))}>
          {t('clearPending')}
        </Button>
      )}
    </div>
  )
}
