'use client'

import { useCallback, useRef, useState } from 'react'
import NextImage from 'next/image'
import { Image as ImageIcon, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'

import type { ChangeEvent, MouseEvent } from 'react'

interface PhotoCaptureProps {
  onChange: (file: File | null) => void
  accept?: string
  maxSizeMB?: number
  disabled?: boolean
  value?: File | null
}

export function PhotoCapture({ onChange, accept = 'image/*', maxSizeMB = 2, disabled = false, value = null }: PhotoCaptureProps) {
  const t = useTranslations('mitra.shell')
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(value ? URL.createObjectURL(value) : null)
  const previewRef = useRef<string | null>(preview)

  const revoke = useCallback(() => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current)
      previewRef.current = null
    }
  }, [])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0] ?? null
    if (!file) {
      setPreview(null)
      onChange(null)
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error(t('errors.photoType'))
      return
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(t('errors.photoTooLarge', { size: maxSizeMB }))
      return
    }
    revoke()
    const url = URL.createObjectURL(file)
    previewRef.current = url
    setPreview(url)
    onChange(file)
  }

  const remove = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    revoke()
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    setPreview(null)
    onChange(null)
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture="environment"
        disabled={disabled}
        onChange={handleChange}
        className="sr-only"
        id="mitra-photo-capture"
      />
      <label
        htmlFor="mitra-photo-capture"
        className={cn(
          'border-border/60 bg-background text-muted-foreground hover:border-primary flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-3 py-2 text-[11px] font-medium disabled:cursor-not-allowed disabled:opacity-50',
          disabled && 'opacity-50'
        )}
      >
        <ImageIcon className="size-3.5 shrink-0" />
        {value ? t('photo.change') : t('photo.take')}
      </label>
      {preview && (
        <div className="relative inline-block">
          <NextImage src={preview} alt={t('dropzone.previewAlt')} width={64} height={64} unoptimized className="size-16 rounded-md object-cover" />
          <button
            onClick={remove}
            className="border-border/60 bg-background absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border text-[10px]"
            aria-label={t('dropzone.removeFile')}
          >
            <X className="size-3" />
          </button>
        </div>
      )}
      <p className="text-muted-foreground text-[10px]">{t('photo.limit', { size: maxSizeMB })}</p>
    </div>
  )
}
