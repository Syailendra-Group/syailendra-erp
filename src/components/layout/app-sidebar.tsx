'use client'

import * as React from 'react'
import {
  ArrowLeftRight,
  Boxes,
  Briefcase,
  CalendarCheck,
  Clock,
  FileSpreadsheet,
  FileText,
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

export function AppSidebar(): React.ReactElement {
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
          url: '/inventory/transfers',
          icon: ArrowLeftRight,
          badge: '2'
        },
        {
          titleKey: 'items.lots_batches',
          url: '/inventory/lots',
          icon: Layers
        },
        {
          titleKey: 'items.traceability_qr',
          url: '/inventory/traceability',
          icon: QrCode
        },
        {
          titleKey: 'items.stock_reporting',
          url: '/inventory/reporting',
          icon: FileSpreadsheet
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
          url: '/crm/pipeline',
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
          url: '/hr/attendance',
          icon: Clock
        },
        {
          titleKey: 'items.daily_reports',
          url: '/hr/reports',
          icon: FileText
        },
        {
          titleKey: 'items.shifts',
          url: '/hr/shifts',
          icon: CalendarCheck
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
          url: '/employees/departments',
          icon: FolderTree
        },
        {
          titleKey: 'items.job_positions',
          url: '/employees/jobs',
          icon: Briefcase
        }
      ]
    },
    {
      titleKey: 'groups.operations_deployment',
      items: [
        {
          titleKey: 'items.work_locations',
          url: '/employees/locations',
          icon: MapPin
        },
        {
          titleKey: 'items.employee_tags',
          url: '/employees/tags',
          icon: Tag
        },
        {
          titleKey: 'items.access_roles',
          url: '/employees/roles',
          icon: ShieldCheck
        }
      ]
    }
  ]

  let currentGroups = inventoryGroups
  if (activeTab === 'crm') currentGroups = crmGroups
  if (activeTab === 'hr') currentGroups = hrGroups
  if (activeTab === 'employees') currentGroups = employeesGroups

  return (
    <Sidebar variant="floating" collapsible="icon" className="border-0 shadow-sm">
      <SidebarHeader>
        <CompanySwitcher />
      </SidebarHeader>

      <SidebarContent className="gap-0">
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
