import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  BookOpen,
  Briefcase,
  Building,
  Building2,
  Calendar,
  Clock,
  Factory,
  FileSpreadsheet,
  FileText,
  Flame,
  FlaskConical,
  FolderTree,
  GitBranch,
  Globe,
  History,
  Landmark,
  LayoutDashboard,
  LineChart,
  MapPin,
  Navigation,
  QrCode,
  RotateCcw,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Sparkles,
  Tag,
  Target,
  Truck,
  UserCheck,
  UserPlus,
  Users,
  Warehouse,
  Wheat
} from 'lucide-react'

import type { ModuleTab } from '@/stores/nav-store'
import type { CompanyProfile, NavGroup, UserProfile } from '@/types/layout/navigation'

export interface SidebarData {
  user: UserProfile
  teams: CompanyProfile[]
  navGroups: Record<ModuleTab, NavGroup[]>
}

export const sidebarData: SidebarData = {
  user: {
    name: 'Demo Syailendra',
    email: 'demo@syailendra.group',
    role: 'Demo User',
    avatar: '/avatars/avatar.png'
  },
  teams: [
    {
      name: 'PT. Syailendra Bumi Investama',
      plan: 'Production Odoo 18',
      logo: 'Building2'
    }
  ],
  navGroups: {
    // 1. MAIN PILLAR
    main: [
      {
        titleKey: 'groups.main_ops',
        items: [
          { titleKey: 'items.overview', url: '/overview', icon: LayoutDashboard },
          { titleKey: 'items.announcements', url: '/announcements', icon: Bell },
          { titleKey: 'items.calendar', url: '/calendar', icon: Calendar }
        ]
      }
    ],

    // 2. TRACEABILITY PILLAR
    scm: [
      {
        titleKey: 'groups.master_scm',
        items: [
          { titleKey: 'items.overview', url: '/scm', icon: LayoutDashboard },
          { titleKey: 'items.farmers', url: '/scm/farmers', icon: Users },
          { titleKey: 'items.distillers', url: '/scm/distillers', icon: Factory },
          { titleKey: 'items.materials', url: '/scm/materials', icon: Sparkles },
          { titleKey: 'items.supplierCategories', url: '/scm/supplier-categories', icon: FolderTree },
          { titleKey: 'items.suppliers', url: '/scm/suppliers', icon: Truck }
        ]
      },
      {
        titleKey: 'groups.scm_ops',
        items: [
          { titleKey: 'items.harvest', url: '/scm/harvest', icon: Wheat },
          { titleKey: 'items.lots_batches', url: '/scm/lots', icon: Tag },
          { titleKey: 'items.distillation', url: '/scm/distillation', icon: Flame },
          { titleKey: 'items.qc_lab', url: '/scm/qc', icon: FlaskConical },
          { titleKey: 'items.genealogy_graph', url: '/scm/genealogy', icon: GitBranch },
          { titleKey: 'items.qr_printer', url: '/scm/qr-printer', icon: QrCode },
          { titleKey: 'items.mock_recall', url: '/scm/recall', icon: RotateCcw }
        ]
      },
      {
        titleKey: 'groups.scm_reports',
        items: [
          { titleKey: 'items.report_genealogy', url: '/scm/reports/genealogy', icon: FileText },
          { titleKey: 'items.report_yield', url: '/scm/reports/yield', icon: LineChart },
          { titleKey: 'items.report_qc', url: '/scm/reports/qc', icon: ShieldCheck }
        ]
      }
    ],

    // 3. WMS PILLAR
    wms: [
      {
        titleKey: 'groups.warehouse_ops',
        items: [
          { titleKey: 'items.overview', url: '/wms', icon: LayoutDashboard },
          { titleKey: 'items.stock_ledger', url: '/wms/stocks', icon: Warehouse },
          { titleKey: 'items.inbound_grn', url: '/wms/inbound', icon: ArrowDownLeft },
          { titleKey: 'items.quarantine_zone', url: '/wms/quarantine', icon: Shield },
          { titleKey: 'items.outbound_delivery', url: '/wms/outbound', icon: ArrowUpRight },
          { titleKey: 'items.bin_locations', url: '/wms/locations', icon: FolderTree }
        ]
      }
    ],

    // 4. CRM PILLAR
    crm: [
      {
        titleKey: 'groups.commercial_ops',
        items: [
          { titleKey: 'items.overview', url: '/crm', icon: LayoutDashboard },
          { titleKey: 'items.b2b_leads', url: '/crm/leads', icon: Target },
          { titleKey: 'items.global_orders', url: '/crm/orders', icon: ShoppingBag },
          { titleKey: 'items.sample_desk', url: '/crm/samples', icon: FlaskConical },
          { titleKey: 'items.fedex_tracker', url: '/crm/logistics', icon: Truck },
          { titleKey: 'items.partners', url: '/crm/partners', icon: Users }
        ]
      }
    ],

    // 5. HRIS PILLAR
    hris: [
      {
        titleKey: 'groups.workforce_ops',
        items: [
          { titleKey: 'items.overview', url: '/hris', icon: LayoutDashboard },
          { titleKey: 'items.attendance_log', url: '/hris/attendance', icon: Clock },
          { titleKey: 'items.employees_directory', url: '/admin/employees', icon: UserCheck },
          { titleKey: 'items.departments', url: '/admin/departments', icon: Briefcase },
          { titleKey: 'items.field_reports', url: '/hris/reports', icon: FileSpreadsheet }
        ]
      }
    ],

    // 6. OTHERS PILLAR
    others: [
      {
        titleKey: 'groups.overview',
        items: [{ titleKey: 'items.overview', url: '/others', icon: Sliders }]
      },
      {
        titleKey: 'groups.regional_data',
        items: [
          { titleKey: 'items.countries', url: '/others/countries', icon: Globe },
          { titleKey: 'items.provinces', url: '/others/provinces', icon: Landmark },
          { titleKey: 'items.regencies', url: '/others/regencies', icon: Building2 },
          { titleKey: 'items.districts', url: '/others/districts', icon: MapPin },
          { titleKey: 'items.villages', url: '/others/villages', icon: Navigation }
        ]
      },
      {
        titleKey: 'groups.system_ops',
        items: [
          { titleKey: 'items.company_profile', url: '/others/company', icon: Building },
          { titleKey: 'items.access_roles', url: '/others/roles', icon: Shield },
          { titleKey: 'items.partners_registry', url: '/others/partners', icon: UserPlus }
        ]
      },
      {
        titleKey: 'groups.compliance',
        items: [
          { titleKey: 'items.audit_trail', url: '/others/audit', icon: History },
          { titleKey: 'items.sop_docs', url: '/others/docs', icon: BookOpen }
        ]
      }
    ]
  }
}

export function getNavGroups(tab: ModuleTab): NavGroup[] {
  return sidebarData.navGroups[tab] || sidebarData.navGroups.main
}
