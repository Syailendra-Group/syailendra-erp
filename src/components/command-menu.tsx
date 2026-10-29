'use client'

import { useCallback } from 'react'
import { ArrowRight, Boxes, Clock, Laptop, Moon, Sun, UserCheck, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'

import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSearch } from '@/contexts/search-context'
import { useRouter } from '@/i18n/navigation'
import { useNavStore } from '@/stores/nav-store'

import type { ModuleTab } from '@/stores/nav-store'
import type { ReactElement } from 'react'

export function CommandMenu(): ReactElement {
  const router = useRouter()
  const { setTheme } = useTheme()
  const { open, setOpen } = useSearch()
  const { setActiveTab } = useNavStore()
  const tNav = useTranslations('nav')
  const tCommon = useTranslations('common.commandMenu')

  const runCommand = useCallback(
    (command: () => void) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  const modules: { title: string; url: string; tab: ModuleTab; icon: typeof Boxes }[] = [
    { title: tNav('modules.inventory'), url: '/inventory', tab: 'inventory', icon: Boxes },
    { title: tNav('modules.crm'), url: '/crm', tab: 'crm', icon: Users },
    { title: tNav('modules.hr'), url: '/hr', tab: 'hr', icon: Clock },
    { title: tNav('modules.employees'), url: '/employees', tab: 'employees', icon: UserCheck }
  ]

  const items: { title: string; url: string; tab: ModuleTab }[] = [
    { title: tNav('items.products'), url: '/inventory/products', tab: 'inventory' },
    { title: tNav('items.stock_moves'), url: '/inventory/moves', tab: 'inventory' },
    { title: tNav('items.lots_batches'), url: '/inventory/lots', tab: 'inventory' },
    { title: tNav('items.traceability_qr'), url: '/inventory/traceability', tab: 'inventory' },
    { title: tNav('items.leads_pipeline'), url: '/crm', tab: 'crm' },
    { title: tNav('items.partners'), url: '/crm/partners', tab: 'crm' },
    { title: tNav('items.attendance_log'), url: '/hr', tab: 'hr' },
    { title: tNav('items.daily_reports'), url: '/hr/reports', tab: 'hr' },
    { title: tNav('items.employees_directory'), url: '/employees', tab: 'employees' },
    { title: tNav('items.departments'), url: '/admin/departments', tab: 'employees' },
    { title: tNav('items.job_positions'), url: '/admin/jobs', tab: 'employees' },
    { title: tNav('items.work_locations'), url: '/admin/locations', tab: 'employees' },
    { title: tNav('items.employee_tags'), url: '/admin/categories', tab: 'employees' },
    { title: tNav('items.access_roles'), url: '/admin/roles', tab: 'employees' }
  ]

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={tCommon('placeholder')} />
      <CommandList>
        <ScrollArea className="h-72 pe-1">
          <CommandEmpty>{tCommon('noResults')}</CommandEmpty>

          <CommandGroup heading={tCommon('navigation')}>
            {modules.map((m) => {
              const Icon = m.icon
              return (
                <CommandItem
                  key={m.url}
                  value={m.title}
                  onSelect={() => {
                    runCommand(() => {
                      setActiveTab(m.tab)
                      router.push(m.url)
                    })
                  }}
                  className="cursor-pointer gap-2"
                >
                  <Icon className="text-primary h-4 w-4" />
                  <span>{m.title}</span>
                </CommandItem>
              )
            })}
            {items.map((it) => (
              <CommandItem
                key={it.url}
                value={it.title}
                onSelect={() => {
                  runCommand(() => {
                    setActiveTab(it.tab)
                    router.push(it.url)
                  })
                }}
                className="cursor-pointer gap-2"
              >
                <ArrowRight className="text-muted-foreground h-3.5 w-3.5" />
                <span>{it.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading={tCommon('theme')}>
            <CommandItem onSelect={() => runCommand(() => setTheme('light'))} className="cursor-pointer gap-2">
              <Sun className="h-4 w-4" />
              <span>{tCommon('light')}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('dark'))} className="cursor-pointer gap-2">
              <Moon className="h-4 w-4" />
              <span>{tCommon('dark')}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('system'))} className="cursor-pointer gap-2">
              <Laptop className="h-4 w-4" />
              <span>{tCommon('system')}</span>
            </CommandItem>
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  )
}
