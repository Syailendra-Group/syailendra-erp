'use client'

import { useCallback } from 'react'
import { ArrowRight, Bot, Calculator, Clock, Laptop, Layers, Leaf, Moon, Sliders, Store, Sun, Target, Warehouse } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'

import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSearch } from '@/contexts/shared/search.context'
import { useRouter } from '@/i18n/navigation'
import { useEntityStore } from '@/stores/entity-store'
import { useNavStore } from '@/stores/nav-store'

import type { ModuleTab } from '@/stores/nav-store'
import type { ElementType, ReactElement } from 'react'

export function CommandMenu(): ReactElement {
  const router = useRouter()
  const { setTheme } = useTheme()
  const { open, setOpen } = useSearch()
  const setActiveTab = useNavStore((s) => s.setActiveTab)
  const activeEntityId = useEntityStore((s) => s.activeEntityId)
  const entities = useEntityStore((s) => s.entities)
  const tNav = useTranslations('nav')
  const tCommon = useTranslations('common.commandMenu')

  const activeEntity = entities.find((e) => e.id === activeEntityId) || entities[0]

  const runCommand = useCallback(
    (command: () => void) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  const allModules: { title: string; url: string; tab: ModuleTab; icon: ElementType }[] = [
    { title: tNav('modules.ftm'), url: '/ftm', tab: 'ftm', icon: Calculator },
    { title: tNav('modules.hrm'), url: '/hris', tab: 'hrm', icon: Clock },
    { title: tNav('modules.scm'), url: '/scm', tab: 'scm', icon: Layers },
    { title: tNav('modules.wms'), url: '/wms', tab: 'wms', icon: Warehouse },
    { title: tNav('modules.crm'), url: '/crm', tab: 'crm', icon: Target },
    { title: tNav('modules.dcm'), url: '/dcm', tab: 'dcm', icon: Store },
    { title: tNav('modules.ai'), url: '/ai', tab: 'ai', icon: Bot },
    { title: tNav('modules.imm'), url: '/imm', tab: 'imm', icon: Leaf },
    { title: tNav('modules.others'), url: '/others', tab: 'others', icon: Sliders }
  ]

  const allItems: { title: string; url: string; tab: ModuleTab }[] = [
    { title: tNav('items.lots_batches'), url: '/scm/lots', tab: 'scm' },
    { title: tNav('items.genealogy_graph'), url: '/scm/genealogy', tab: 'scm' },
    { title: tNav('items.qr_printer'), url: '/scm/qr-printer', tab: 'scm' },
    { title: tNav('items.stock_ledger'), url: '/wms/stocks', tab: 'wms' },
    { title: tNav('items.inbound_grn'), url: '/wms/inbound', tab: 'wms' },
    { title: tNav('items.b2b_leads'), url: '/crm/leads', tab: 'crm' },
    { title: tNav('items.global_orders'), url: '/crm/orders', tab: 'crm' },
    { title: tNav('items.attendance_log'), url: '/hris/attendance', tab: 'hrm' },
    { title: tNav('items.employees_directory'), url: '/admin/employees', tab: 'hrm' },
    { title: tNav('items.company_profile'), url: '/others/company', tab: 'others' }
  ]

  const activePillars = activeEntity?.pillars || []
  const visibleModules = allModules.filter((m) => activePillars.includes(m.tab))
  const visibleItems = allItems.filter((it) => activePillars.includes(it.tab))

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={tCommon('placeholder')} />
      <CommandList>
        <ScrollArea className="h-72 pe-1">
          <CommandEmpty>{tCommon('noResults')}</CommandEmpty>

          <CommandGroup heading={`${tCommon('navigation')} (${activeEntity?.code || 'PT'})`}>
            {visibleModules.map((m) => {
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
            {visibleItems.map((it) => (
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
