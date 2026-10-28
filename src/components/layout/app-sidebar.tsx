"use client";

import * as React from "react";
import {
  Boxes,
  Package,
  Layers,
  ArrowLeftRight,
  QrCode,
  FileSpreadsheet,
  Users,
  Target,
  Clock,
  CalendarCheck,
  FileText,
  Sliders,
  Building,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useNavStore } from "@/stores/nav-store";
import { CompanySwitcher } from "./company-switcher";
import { NavGroup } from "./nav-group";
import { NavUser } from "./nav-user";
import type { NavGroup as NavGroupType } from "./types";

export function AppSidebar(): React.ReactElement {
  const { activeTab } = useNavStore();

  const inventoryGroups: NavGroupType[] = [
    {
      titleKey: "groups.overview",
      items: [
        {
          titleKey: "items.dashboard",
          url: "/inventory",
          icon: Boxes,
        },
      ],
    },
    {
      titleKey: "groups.inventory_ops",
      items: [
        {
          titleKey: "items.products",
          url: "/inventory/products",
          icon: Package,
        },
        {
          titleKey: "items.stock_moves",
          url: "/inventory/transfers",
          icon: ArrowLeftRight,
          badge: "2",
        },
        {
          titleKey: "items.lots_batches",
          url: "/inventory/lots",
          icon: Layers,
        },
        {
          titleKey: "items.traceability_qr",
          url: "/inventory/traceability",
          icon: QrCode,
        },
        {
          titleKey: "items.stock_reporting",
          url: "/inventory/reporting",
          icon: FileSpreadsheet,
        },
      ],
    },
  ];

  const crmGroups: NavGroupType[] = [
    {
      titleKey: "groups.b2b_crm",
      items: [
        {
          titleKey: "items.leads_pipeline",
          url: "/crm/pipeline",
          icon: Target,
        },
        {
          titleKey: "items.partners",
          url: "/crm/partners",
          icon: Users,
        },
      ],
    },
  ];

  const hrGroups: NavGroupType[] = [
    {
      titleKey: "groups.hr_attendance",
      items: [
        {
          titleKey: "items.attendance_log",
          url: "/hr/attendance",
          icon: Clock,
        },
        {
          titleKey: "items.daily_reports",
          url: "/hr/reports",
          icon: FileText,
        },
        {
          titleKey: "items.shifts",
          url: "/hr/shifts",
          icon: CalendarCheck,
        },
      ],
    },
  ];

  const settingsGroups: NavGroupType[] = [
    {
      titleKey: "groups.system_settings",
      items: [
        {
          titleKey: "items.company_profile",
          url: "/settings/company",
          icon: Building,
        },
        {
          titleKey: "items.rbac",
          url: "/settings/roles",
          icon: Sliders,
        },
      ],
    },
  ];

  let currentGroups = inventoryGroups;
  if (activeTab === "crm") currentGroups = crmGroups;
  if (activeTab === "hr") currentGroups = hrGroups;
  if (activeTab === "settings") currentGroups = settingsGroups;

  return (
    <Sidebar collapsible="icon" className="border-border/80 border-r">
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
  );
}
