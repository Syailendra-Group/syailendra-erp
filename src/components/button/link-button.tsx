import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

import type { LucideIcon } from 'lucide-react'
import type { ComponentProps, ReactElement, ReactNode } from 'react'

export interface LinkButtonProps extends ComponentProps<typeof Button> {
  href: string
  icon?: LucideIcon
  label?: string
  children?: ReactNode
}

export function LinkButton({ href, icon: Icon, label, children, className, ...props }: LinkButtonProps): ReactElement {
  return (
    <Button asChild className={cn('gap-1.5 text-xs font-semibold', className)} {...props}>
      <Link href={href}>
        {Icon && <Icon className="size-3.5" />}
        {children ? children : label ? <span>{label}</span> : null}
      </Link>
    </Button>
  )
}
