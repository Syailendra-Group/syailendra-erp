'use client'

import Image from 'next/image'
import { Building2, Check, ChevronsUpDown, Factory, Leaf, ShieldCheck, Target } from 'lucide-react'
import { useTranslations } from 'next-intl'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { useRouter } from '@/i18n/navigation'
import { SYAILENDRA_ENTITIES, useEntityStore } from '@/stores/entity-store'
import { useNavStore } from '@/stores/nav-store'

import type { SyailendraEntity, SyailendraEntityId } from '@/stores/entity-store'
import type { ElementType, ReactElement } from 'react'

const ENTITY_ICONS: Record<SyailendraEntityId, ElementType> = {
  sbi: ShieldCheck,
  spba: Factory,
  sammend: Target,
  sg: Leaf
}

export function CompanySwitcher(): ReactElement {
  const tCommon = useTranslations('common.company')
  const router = useRouter()
  const activeEntityId = useEntityStore((s) => s.activeEntityId)
  const setActiveEntityId = useEntityStore((s) => s.setActiveEntityId)
  const setActiveTab = useNavStore((s) => s.setActiveTab)

  const activeEntity = SYAILENDRA_ENTITIES.find((e) => e.id === activeEntityId) || SYAILENDRA_ENTITIES[0]

  const handleSelectEntity = (entity: SyailendraEntity) => {
    setActiveEntityId(entity.id)
    setActiveTab(entity.pillars[0])
    router.push(entity.defaultRoute)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="cursor-pointer text-white hover:bg-white/10 hover:text-white data-[state=open]:bg-white/15 data-[state=open]:text-white"
            >
              <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg border border-white/25 bg-white/95 shadow-xs">
                <Image
                  src="/images/branding/syailendra_logo_monogram_only.png"
                  alt={tCommon('name')}
                  width={24}
                  height={24}
                  className="size-6 object-contain"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-white">{activeEntity.code}</span>
                <span className="truncate text-xs text-white/75">{activeEntity.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto text-white/70" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-68 rounded-lg" align="start" side="bottom" sideOffset={4}>
            <DropdownMenuLabel className="text-muted-foreground flex items-center gap-1.5 text-xs tracking-wider uppercase">
              <Building2 className="size-3.5" />
              <span>{tCommon('multiUnit')}</span>
            </DropdownMenuLabel>

            {SYAILENDRA_ENTITIES.map((entity) => {
              const Icon = ENTITY_ICONS[entity.id]
              const isSelected = entity.id === activeEntityId

              return (
                <DropdownMenuItem key={entity.id} onClick={() => handleSelectEntity(entity)} className="cursor-pointer gap-2.5 p-2">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md border">
                    <Icon className="text-primary size-4" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-xs font-semibold">{entity.name}</span>
                    <span className="text-muted-foreground truncate text-[11px]">{tCommon(entity.roleKey)}</span>
                  </div>
                  {isSelected && <Check className="text-primary ml-auto size-4 shrink-0" />}
                </DropdownMenuItem>
              )
            })}

            <DropdownMenuSeparator />

            <div className="text-muted-foreground p-2 text-[11px] leading-relaxed">{tCommon('connectionNotice')}</div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
