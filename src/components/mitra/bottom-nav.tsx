'use client'

import { Home, Upload, User } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'

import type { ComponentType } from 'react'

type MitraTab = 'home' | 'submissions' | 'profile'

interface MitraBottomNavProps {
  activeTab: MitraTab
  onTabChange: (tab: MitraTab) => void
}

const TABS: Record<MitraTab, { key: MitraTab; labelKey: string; icon: ComponentType }> = {
  home: { key: 'home', labelKey: 'tabs.home', icon: Home },
  submissions: { key: 'submissions', labelKey: 'tabs.submissions', icon: Upload },
  profile: { key: 'profile', labelKey: 'tabs.profile', icon: User }
} satisfies Record<MitraTab, { key: MitraTab; labelKey: string; icon: ComponentType }>

export function MitraBottomNav({ activeTab, onTabChange }: MitraBottomNavProps) {
  const t = useTranslations('mitra.shell')

  return (
    <nav className="border-border/60 bg-background border-t px-4 py-3">
      <div className="flex items-center justify-around">
        {Object.values(TABS).map((tab) => {
          const active = activeTab === tab.key
          const Icon: ComponentType<{ className?: string }> = tab.icon as ComponentType<{ className?: string }>
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                'flex shrink-0 flex-col items-center gap-0.5 text-xs transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
              aria-pressed={active}
            >
              <Icon className={cn('size-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground')} />
              <span>{t(tab.labelKey)}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
