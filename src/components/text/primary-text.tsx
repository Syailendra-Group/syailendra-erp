/**
 * primary-text.tsx — Standardized reusable primary identifier & code text
 * Syailendra Group ERP
 * Complies with octadev-coding-rules-v83 (Rule 2, 6, 105)
 */

import { type ReactElement, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface PrimaryTextProps {
  children?: ReactNode
  mono?: boolean
  bold?: boolean
  className?: string
  fallback?: string
}

export function PrimaryText({ children, mono = true, bold = true, className, fallback = '-' }: PrimaryTextProps): ReactElement {
  const content = children ?? fallback
  return (
    <span className={cn('text-primary text-xs tracking-tight', mono && 'font-mono', bold ? 'font-bold' : 'font-semibold', className)}>{content}</span>
  )
}
