'use client'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

import type { LucideIcon } from 'lucide-react'
import type { ReactElement } from 'react'

interface BasePrimaryActionProps {
  label: string
  icon?: LucideIcon
  className?: string
  disabled?: boolean
}

export type PrimaryActionProps =
  | (BasePrimaryActionProps & {
      href: string
      onClick?: never
    })
  | (BasePrimaryActionProps & {
      onClick: () => void
      href?: never
    })

export function PrimaryAction({ label, icon: Icon = Plus, href, onClick, className, disabled }: PrimaryActionProps): ReactElement {
  if (href) {
    return (
      <Button asChild disabled={disabled} className={className || 'gap-2 font-semibold'}>
        <Link href={href}>
          <Icon className="size-4" />
          <span>{label}</span>
        </Link>
      </Button>
    )
  }

  return (
    <Button type="button" onClick={onClick} disabled={disabled} className={className || 'gap-2 font-semibold'}>
      <Icon className="size-4" />
      <span>{label}</span>
    </Button>
  )
}
