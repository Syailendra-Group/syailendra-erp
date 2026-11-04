'use client'

import { useCallback } from 'react'
import { ArrowRight, Clock, Laptop, Layers, LayoutDashboard, Moon, Sliders, Sun, Target, Warehouse } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'

import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSearch } from '@/contexts/main/search.context'
import { useRouter } from '@/i18n/navigation'
import { useNavStore } from '@/stores/nav-store'

import type { ModuleTab } from '@/stores/nav-store'
import type { ElementType, ReactElement } from 'react'

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

  const modules: { title: string; url: string; tab: ModuleTab; icon: ElementType }[] = [
    { title: tNav('modules.main'), url: '/overview', tab: 'main', icon: LayoutDashboard },
    { title: tNav('modules.traceability'), url: '/scm', tab: 'scm', icon: Layers },
    { title: tNav('modules.wms'), url: '/wms', tab: 'wms', icon: Warehouse },
    { title: tNav('modules.crm'), url: '/crm', tab: 'crm', icon: Target },
    { title: tNav('modules.hris'), url: '/hris', tab: 'hris', icon: Clock },
    { title: tNav('modules.others'), url: '/settings', tab: 'others', icon: Sliders }
  ]

  const items: { title: string; url: string; tab: ModuleTab }[] = [
    { title: tNav('items.lots_batches'), url: '/scm', tab: 'scm' },
    { title: tNav('items.genealogy_graph'), url: '/scm', tab: 'scm' },
    { title: tNav('items.qr_printer'), url: '/scm', tab: 'scm' },
    { title: tNav('items.stock_ledger'), url: '/wms', tab: 'wms' },
    { title: tNav('items.inbound_grn'), url: '/wms', tab: 'wms' },
    { title: tNav('items.quarantine_zone'), url: '/wms', tab: 'wms' },
    { title: tNav('items.b2b_leads'), url: '/crm', tab: 'crm' },
    { title: tNav('items.global_orders'), url: '/crm', tab: 'crm' },
    { title: tNav('items.sample_desk'), url: '/crm', tab: 'crm' },
    { title: tNav('items.attendance_log'), url: '/hris', tab: 'hris' },
    { title: tNav('items.employees_directory'), url: '/employees', tab: 'hris' },
    { title: tNav('items.departments'), url: '/admin/departments', tab: 'hris' },
    { title: tNav('items.access_roles'), url: '/admin/roles', tab: 'others' },
    { title: tNav('items.company_profile'), url: '/settings', tab: 'others' }
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
