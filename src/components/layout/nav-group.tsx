"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import type { NavGroup as NavGroupType } from "./types";

export interface NavGroupProps {
  group: NavGroupType;
}

export function NavGroup({ group }: NavGroupProps): React.ReactElement {
  const tNav = useTranslations("nav");
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
        {tNav(group.titleKey)}
      </SidebarGroupLabel>
      <SidebarMenu>
        {group.items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.url;

          return (
            <SidebarMenuItem key={item.titleKey}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={tNav(item.titleKey)}
                className="cursor-pointer text-xs font-medium"
              >
                <Link href={item.url || "#"}>
                  <Icon className="h-4 w-4" />
                  <span>{tNav(item.titleKey)}</span>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="ml-auto px-1.5 py-0 text-[10px] font-bold"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
