'use client'

import { Fragment, useMemo } from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { useEntityStore } from '@/stores/entity-store'

import type { ReactElement } from 'react'

export interface BreadcrumbItemType {
  label: string
  href?: string
}

export interface BreadcrumbsProps {
  items?: BreadcrumbItemType[]
  homeLabel?: string
}

export function Breadcrumbs({ items, homeLabel }: BreadcrumbsProps): ReactElement | null {
  const pathname = usePathname()
  const tNav = useTranslations('nav')
  const getActiveEntity = useEntityStore((s) => s.getActiveEntity)
  const defaultRoute = getActiveEntity()?.defaultRoute || '/ftm'

  const segments = useMemo(() => {
    if (items) return null
    return pathname.split('/').filter(Boolean)
  }, [items, pathname])

  const defaultHomeLabel = homeLabel || tNav('breadcrumbs.home')

  if (!items && (!segments || segments.length === 0)) return null

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList className="text-muted-foreground text-xs">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={defaultRoute} className="hover:text-foreground flex items-center gap-1 font-medium transition-colors">
              <Home className="h-3.5 w-3.5" />
              <span>{defaultHomeLabel}</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {items
          ? items.map((item, index) => {
              const isLast = index === items.length - 1
              return (
                <Fragment key={`${item.label}-${index}`}>
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-3 w-3" />
                  </BreadcrumbSeparator>

                  <BreadcrumbItem>
                    {isLast || !item.href ? (
                      <BreadcrumbPage className="text-foreground font-semibold">{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={item.href} className="hover:text-foreground transition-colors">
                          {item.label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              )
            })
          : segments!.map((segment, index) => {
              const href = `/${segments!.slice(0, index + 1).join('/')}`
              const isLast = index === segments!.length - 1
              const labelKey = `breadcrumbs.${segment}`

              let label = segment
              const isNumeric = /^[0-9]+$/.test(segment)
              const isCode = /^[A-Z]{2,4}-[A-Z0-9-]+$/i.test(segment)

              if (isNumeric) {
                label = `#${segment}`
              } else if (isCode) {
                label = segment.toUpperCase()
              } else {
                try {
                  label = tNav(labelKey)
                } catch {
                  label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
                }
              }

              return (
                <Fragment key={href}>
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-3 w-3" />
                  </BreadcrumbSeparator>

                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className={cn('text-foreground font-semibold', !isCode && 'capitalize')}>{label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={href} className={cn('hover:text-foreground transition-colors', !isCode && 'capitalize')}>
                          {label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              )
            })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
