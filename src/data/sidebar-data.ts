import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Bot,
  Briefcase,
  Building,
  Building2,
  Clock,
  Coins,
  Factory,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Flame,
  FlaskConical,
  FolderTree,
  GitBranch,
  Globe,
  HeartHandshake,
  History,
  Landmark,
  LayoutDashboard,
  LayoutGrid,
  Leaf,
  LineChart,
  MapPin,
  MessageSquareCode,
  Navigation,
  Palette,
  QrCode,
  Recycle,
  RotateCcw,
  Scale,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Sparkles,
  Store,
  Tag,
  Target,
  Truck,
  UserCheck,
  UserPlus,
  Users,
  Warehouse,
  Wheat,
  Zap
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
      name: 'PT Syailendra Bumi Investama',
      plan: 'Holding Company',
      logo: 'Building2'
    }
  ],
  navGroups: {
    // Finance & Tax Management (PT SBI)
    ftm: [
      {
        titleKey: 'groups.ftm_ops',
        items: [
          { titleKey: 'items.overview', url: '/ftm', icon: LayoutDashboard },
          { titleKey: 'items.ftm_financials', url: '/ftm/financials', icon: Coins },
          { titleKey: 'items.ftm_tax', url: '/ftm/tax', icon: Scale },
          { titleKey: 'items.ftm_intercompany', url: '/ftm/intercompany', icon: Building2 },
          { titleKey: 'items.ftm_accurate', url: '/ftm/accurate', icon: Zap }
        ]
      }
    ],

    // Human Resources & Performance (PT SBI)
    hrm: [
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

    // SCM & Traceability (PT SBI)
    scm: [
      {
        titleKey: 'groups.master_scm',
        items: [
          { titleKey: 'items.overview', url: '/scm', icon: LayoutDashboard },
          { titleKey: 'items.farmers', url: '/scm/farmers', icon: Users },
          { titleKey: 'items.farms', url: '/scm/farms', icon: MapPin },
          { titleKey: 'items.commodities', url: '/scm/commodities', icon: Leaf },
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

    // Warehouse & Production (PT SPBA)
    wms: [
      {
        titleKey: 'groups.warehouse_ops',
        items: [
          { titleKey: 'items.overview', url: '/wms', icon: LayoutDashboard },
          { titleKey: 'items.stock_ledger', url: '/wms/stocks', icon: Warehouse },
          { titleKey: 'items.inbound_grn', url: '/wms/inbound', icon: ArrowDownLeft },
          { titleKey: 'items.quarantine_zone', url: '/wms/quarantine', icon: Shield },
          { titleKey: 'items.outbound_delivery', url: '/wms/outbound', icon: ArrowUpRight },
          { titleKey: 'items.bin_locations', url: '/wms/locations', icon: QrCode }
        ]
      }
    ],

    // CRM & Sales (PT SAMMEND)
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

    // Distribution Channel Management (PT SAMMEND)
    dcm: [
      {
        titleKey: 'groups.dcm_ops',
        items: [
          { titleKey: 'items.overview', url: '/dcm', icon: LayoutDashboard },
          { titleKey: 'items.dcm_marketplaces', url: '/dcm/marketplaces', icon: Store },
          { titleKey: 'items.dcm_inventory_sync', url: '/dcm/inventory-sync', icon: Warehouse },
          { titleKey: 'items.dcm_orders', url: '/dcm/orders', icon: ShoppingBag },
          { titleKey: 'items.dcm_desty', url: '/dcm/desty', icon: Zap }
        ]
      }
    ],

    // AI Agent Nona Atsirich (PT SAMMEND)
    ai: [
      {
        titleKey: 'groups.ai_ops',
        items: [
          { titleKey: 'items.overview', url: '/ai', icon: LayoutDashboard },
          { titleKey: 'items.ai_hotline', url: '/ai/hotline', icon: Bot },
          { titleKey: 'items.ai_meta_integration', url: '/ai/meta', icon: MessageSquareCode },
          { titleKey: 'items.ai_knowledge', url: '/ai/knowledge', icon: BookOpen },
          { titleKey: 'items.ai_analytics', url: '/ai/analytics', icon: BarChart3 }
        ]
      }
    ],

    // Impact Measurement Management / Sustainability (PT SG)
    imm: [
      {
        titleKey: 'groups.imm_ops',
        items: [
          { titleKey: 'items.overview', url: '/imm', icon: LayoutDashboard },
          { titleKey: 'items.imm_circular', url: '/imm/circular', icon: Recycle },
          { titleKey: 'items.imm_scholarships', url: '/imm/scholarships', icon: HeartHandshake },
          { titleKey: 'items.imm_rehabilitation', url: '/imm/rehabilitation', icon: Leaf },
          { titleKey: 'items.imm_sdgs', url: '/imm/sdgs', icon: FileCheck2 }
        ]
      }
    ],

    // Master Regional & System Governance (PT SG)
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
          { titleKey: 'items.menu_allocation', url: '/others/menus', icon: LayoutGrid },
          { titleKey: 'items.website_config', url: '/others/website', icon: Palette },
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
  return sidebarData.navGroups[tab] || sidebarData.navGroups.ftm
}
