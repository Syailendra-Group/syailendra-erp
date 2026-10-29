'use client'

import { type ReactElement } from 'react'
import {
  ArrowLeftRight,
  Boxes,
  Briefcase,
  Clock,
  FileSpreadsheet,
  FolderTree,
  Layers,
  MapPin,
  Package,
  QrCode,
  ShieldCheck,
  Tag,
  Target,
  UserCheck,
  Users
} from 'lucide-react'

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { useNavStore } from '@/stores/nav-store'

import { CompanySwitcher } from './company-switcher'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'

import type { NavGroup as NavGroupType } from './types'

export function AppSidebar(): ReactElement {
  const { activeTab } = useNavStore()

  const inventoryGroups: NavGroupType[] = [
    {
      titleKey: 'groups.overview',
      items: [
        {
          titleKey: 'items.dashboard',
          url: '/inventory',
          icon: Boxes
        }
      ]
    },
    {
      titleKey: 'groups.inventory_ops',
      items: [
        {
          titleKey: 'items.products',
          url: '/inventory/products',
          icon: Package
        },
        {
          titleKey: 'items.stock_moves',
          url: '/inventory/moves',
          icon: ArrowLeftRight
        },
        {
          titleKey: 'items.lots_batches',
          url: '/inventory/lots',
          icon: Tag
        },
        {
          titleKey: 'items.traceability_qr',
          url: '/inventory/traceability',
          icon: QrCode
        }
      ]
    }
  ]

  const crmGroups: NavGroupType[] = [
    {
      titleKey: 'groups.b2b_crm',
      items: [
        {
          titleKey: 'items.leads_pipeline',
          url: '/crm',
          icon: Target
        },
        {
          titleKey: 'items.partners',
          url: '/crm/partners',
          icon: Users
        }
      ]
    }
  ]

  const hrGroups: NavGroupType[] = [
    {
      titleKey: 'groups.hr_attendance',
      items: [
        {
          titleKey: 'items.attendance_log',
          url: '/hr',
          icon: Clock
        },
        {
          titleKey: 'items.daily_reports',
          url: '/hr/reports',
          icon: FileSpreadsheet
        }
      ]
    }
  ]

  const employeesGroups: NavGroupType[] = [
    {
      titleKey: 'groups.workforce',
      items: [
        {
          titleKey: 'items.employees_directory',
          url: '/employees',
          icon: UserCheck
        },
        {
          titleKey: 'items.departments',
          url: '/admin/departments',
          icon: FolderTree
        },
        {
          titleKey: 'items.job_positions',
          url: '/admin/jobs',
          icon: Briefcase
        },
        {
          titleKey: 'items.work_locations',
          url: '/admin/locations',
          icon: MapPin
        },
        {
          titleKey: 'items.employee_tags',
          url: '/admin/categories',
          icon: Layers
        }
      ]
    },
    {
      titleKey: 'groups.access_security',
      items: [
        {
          titleKey: 'items.access_roles',
          url: '/admin/roles',
          icon: ShieldCheck
        }
      ]
    }
  ]

  let currentGroups = inventoryGroups
  if (activeTab === 'crm') currentGroups = crmGroups
  else if (activeTab === 'hr') currentGroups = hrGroups
  else if (activeTab === 'employees') currentGroups = employeesGroups

  return (
    <Sidebar collapsible="icon" variant="floating" className="border-0 shadow-md">
      <SidebarHeader>
        <CompanySwitcher />
      </SidebarHeader>

      <SidebarContent className="gap-2">
        {currentGroups.map((group) => (
          <NavGroup key={group.titleKey} group={group} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
