'use client'

import { type ReactElement } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building,
  Calendar,
  Clock,
  Factory,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Flame,
  FlaskConical,
  FolderTree,
  GitBranch,
  History,
  Layers,
  LayoutDashboard,
  LineChart,
  MapPin,
  QrCode,
  RotateCcw,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Tag,
  Target,
  Truck,
  UserCheck,
  UserPlus,
  Users,
  Warehouse,
  Wheat
} from 'lucide-react'

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { useNavStore } from '@/stores/nav-store'

import { CompanySwitcher } from './company-switcher'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'

import type { NavGroup as NavGroupType } from './types'

export function AppSidebar(): ReactElement {
  const { activeTab } = useNavStore()

  // 1. MAIN PILLAR
  const mainGroups: NavGroupType[] = [
    {
      titleKey: 'groups.main_ops',
      items: [
        { titleKey: 'items.overview', url: '/overview', icon: LayoutDashboard },
        { titleKey: 'items.announcements', url: '/overview/announcements', icon: Bell },
        { titleKey: 'items.calendar', url: '/overview/calendar', icon: Calendar }
      ]
    }
  ]

  // 2. TRACEABILITY PILLAR (Approved Structure)
  const traceabilityGroups: NavGroupType[] = [
    {
      titleKey: 'groups.traceability_overview',
      items: [{ titleKey: 'items.overview', url: '/traceability', icon: Layers }]
    },
    {
      titleKey: 'groups.master_scm',
      items: [
        { titleKey: 'items.farmers', url: '/traceability/farmers', icon: Users },
        { titleKey: 'items.distillers', url: '/traceability/distillers', icon: Factory },
        { titleKey: 'items.harvest', url: '/traceability/harvest', icon: Wheat },
        { titleKey: 'items.lots_batches', url: '/traceability/lots', icon: Tag }
      ]
    },
    {
      titleKey: 'groups.traceability_ops',
      items: [
        { titleKey: 'items.distillation', url: '/traceability/distillation', icon: Flame },
        { titleKey: 'items.qc_lab', url: '/traceability/qc', icon: FlaskConical },
        { titleKey: 'items.genealogy_graph', url: '/traceability/genealogy', icon: GitBranch },
        { titleKey: 'items.qr_printer', url: '/traceability/qr-printer', icon: QrCode },
        { titleKey: 'items.mock_recall', url: '/traceability/recall', icon: RotateCcw }
      ]
    },
    {
      titleKey: 'groups.traceability_reports',
      items: [
        { titleKey: 'items.report_genealogy', url: '/traceability/reports/genealogy', icon: FileCheck2 },
        { titleKey: 'items.report_yield', url: '/traceability/reports/yield', icon: LineChart },
        { titleKey: 'items.report_qc', url: '/traceability/reports/qc', icon: BarChart3 }
      ]
    }
  ]

  // 3. WMS PILLAR
  const wmsGroups: NavGroupType[] = [
    {
      titleKey: 'groups.warehouse_ops',
      items: [
        { titleKey: 'items.overview', url: '/wms', icon: Warehouse },
        { titleKey: 'items.stock_ledger', url: '/wms/stocks', icon: FileSpreadsheet },
        { titleKey: 'items.inbound_grn', url: '/wms/inbound', icon: ArrowDownLeft },
        { titleKey: 'items.quarantine_zone', url: '/wms/quarantine', icon: ShieldCheck },
        { titleKey: 'items.outbound_delivery', url: '/wms/outbound', icon: ArrowUpRight },
        { titleKey: 'items.bin_locations', url: '/wms/locations', icon: MapPin }
      ]
    }
  ]

  // 4. CRM PILLAR
  const crmGroups: NavGroupType[] = [
    {
      titleKey: 'groups.commercial_ops',
      items: [
        { titleKey: 'items.overview', url: '/crm', icon: Target },
        { titleKey: 'items.b2b_leads', url: '/crm/leads', icon: Users },
        { titleKey: 'items.global_orders', url: '/crm/orders', icon: ShoppingBag },
        { titleKey: 'items.sample_desk', url: '/crm/samples', icon: FlaskConical },
        { titleKey: 'items.fedex_tracker', url: '/crm/fedex', icon: Truck }
      ]
    }
  ]

  // 5. HRIS PILLAR
  const hrisGroups: NavGroupType[] = [
    {
      titleKey: 'groups.workforce_ops',
      items: [
        { titleKey: 'items.overview', url: '/hris', icon: Clock },
        { titleKey: 'items.attendance_log', url: '/hris/attendance', icon: UserCheck },
        { titleKey: 'items.employees_directory', url: '/employees', icon: Briefcase },
        { titleKey: 'items.departments', url: '/admin/departments', icon: FolderTree },
        { titleKey: 'items.field_reports', url: '/hris/reports', icon: FileText }
      ]
    }
  ]

  // 6. OTHERS PILLAR
  const othersGroups: NavGroupType[] = [
    {
      titleKey: 'groups.system_ops',
      items: [
        { titleKey: 'items.overview', url: '/settings', icon: Sliders },
        { titleKey: 'items.company_profile', url: '/settings/company', icon: Building },
        { titleKey: 'items.access_roles', url: '/admin/roles', icon: Shield },
        { titleKey: 'items.partners_registry', url: '/settings/partners', icon: UserPlus },
        { titleKey: 'items.audit_trail', url: '/settings/audit', icon: History },
        { titleKey: 'items.sop_docs', url: '/settings/docs', icon: BookOpen }
      ]
    }
  ]

  let currentGroups = mainGroups
  if (activeTab === 'traceability') currentGroups = traceabilityGroups
  else if (activeTab === 'wms') currentGroups = wmsGroups
  else if (activeTab === 'crm') currentGroups = crmGroups
  else if (activeTab === 'hris') currentGroups = hrisGroups
  else if (activeTab === 'others') currentGroups = othersGroups

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
