'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { ReactElement, ReactNode } from 'react'

export interface CopyableTextProps {
  text: string
  displayText?: string
  children?: ReactNode
  mono?: boolean
  variant?: 'inline' | 'badge' | 'button'
  className?: string
  toastMessage?: string
  title?: string
}

export function CopyableText({
  text,
  displayText,
  children,
  mono = true,
  variant = 'inline',
  className,
  toastMessage,
  title
}: CopyableTextProps): ReactElement {
  const tCommon = useTranslations('common')
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(toastMessage || tCommon('messages.copied'))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(tCommon('messages.copyFailed'))
    }
  }

  const label = children ?? displayText ?? text
  const actionTitle = title || tCommon('actions.copy')

  if (variant === 'button') {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={handleCopy}
        title={actionTitle}
        className={cn('cursor-pointer gap-1 px-2 text-[11px]', mono && 'font-mono', className)}
      >
        {copied ? <Check className="size-3 shrink-0 text-emerald-600" /> : <Copy className="text-muted-foreground size-3 shrink-0" />}
        <span>{label}</span>
      </Button>
    )
  }

  if (variant === 'badge') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        title={actionTitle}
        className={cn(
          'hover:bg-primary/10 hover:text-primary border-border/60 bg-muted/40 inline-flex cursor-pointer items-center gap-1 rounded border px-1.5 py-0.5 text-xs transition-colors',
          mono && 'font-mono',
          className
        )}
      >
        <span>{label}</span>
        {copied ? <Check className="size-2.5 shrink-0 text-emerald-600" /> : <Copy className="text-muted-foreground size-2.5 shrink-0" />}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={actionTitle}
      className={cn(
        'group hover:text-primary inline-flex cursor-pointer items-center gap-1 text-xs transition-colors',
        mono && 'font-mono',
        className
      )}
    >
      <span>{label}</span>
      {copied ? (
        <Check className="size-3 shrink-0 text-emerald-600" />
      ) : (
        <Copy className="text-muted-foreground size-3 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  )
}
