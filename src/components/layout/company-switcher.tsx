'use client'

import { Building2, Check, ChevronsUpDown } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { ImageViewer } from '@/components/image/image-viewer'
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
import { useEntityStore } from '@/stores/entity-store'
import { useNavStore } from '@/stores/nav-store'

import type { SyailendraEntity } from '@/stores/entity-store'
import type { ReactElement } from 'react'

export function CompanySwitcher(): ReactElement {
  const tCommon = useTranslations('common.company')
  const router = useRouter()
  const activeEntityId = useEntityStore((s) => s.activeEntityId)
  const entities = useEntityStore((s) => s.entities)
  const setActiveEntityId = useEntityStore((s) => s.setActiveEntityId)
  const setActiveTab = useNavStore((s) => s.setActiveTab)

  const activeEntity = entities.find((e) => e.id === activeEntityId) || entities[0]
  const activeLogo = activeEntity?.logoBase64 || null

  const handleSelectEntity = (entity: SyailendraEntity) => {
    setActiveEntityId(entity.id)
    if (entity.pillars.length > 0 && entity.pillars[0]) {
      setActiveTab(entity.pillars[0])
    }
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
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/25 shadow-xs">
                <ImageViewer
                  src={activeLogo}
                  alt={activeEntity?.code || 'Company'}
                  fallbackText={activeEntity?.code}
                  disabled
                  objectFit="contain"
                  className="size-full text-[11px]"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-white">{activeEntity?.name}</span>
                <span className="truncate text-xs text-white/75">{tCommon(activeEntity.roleKey)}</span>
              </div>
              <ChevronsUpDown className="ml-auto text-white/70" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-auto max-w-xl min-w-[380px] rounded-lg shadow-lg sm:min-w-[420px]"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground flex items-center gap-1.5 text-xs tracking-wider uppercase">
              <Building2 className="size-3.5" />
              <span>{tCommon('multiUnit')}</span>
            </DropdownMenuLabel>

            {entities.map((entity) => {
              const isSelected = entity.id === activeEntityId
              const entityLogo = entity.logoBase64 || null

              return (
                <DropdownMenuItem key={entity.id} onClick={() => handleSelectEntity(entity)} className="cursor-pointer gap-2.5 p-2">
                  <div className="border-border/50 flex aspect-square size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border shadow-xs">
                    <ImageViewer
                      src={entityLogo}
                      alt={entity.code}
                      fallbackText={entity.code}
                      disabled
                      objectFit="contain"
                      className="size-full text-[10px]"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-xs font-semibold whitespace-nowrap">
                      {entity.code} - {entity.name}
                    </span>
                    <span className="text-muted-foreground text-[11px] leading-snug">{tCommon(entity.roleKey)}</span>
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
