/**
 * switch-field.ts — Types for the reusable SwitchField form component
 * Syailendra Group ERP
 */

import type { ComponentType } from 'react'

export type SwitchFieldVariant = 'card' | 'inline'

export interface SwitchFieldProps {
  label: string
  hint?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  variant?: SwitchFieldVariant
  icon?: ComponentType<{ className?: string }>
  className?: string
  id?: string
  ariaLabel?: string
}
