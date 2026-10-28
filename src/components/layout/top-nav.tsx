"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Boxes, Users, Clock, ShieldCheck } from "lucide-react";
import { useNavStore, type ModuleTab } from "@/stores/nav-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TopNavProps = React.HTMLAttributes<HTMLElement>;

export function TopNav({ className, ...props }: TopNavProps): React.ReactElement {
  const tNav = useTranslations("nav");
  const { activeTab, setActiveTab } = useNavStore();

  const tabs: { id: ModuleTab; titleKey: string; icon: React.ElementType }[] = [
    { id: "inventory", titleKey: "modules.inventory", icon: Boxes },
    { id: "crm", titleKey: "modules.crm", icon: Users },
    { id: "hr", titleKey: "modules.hr", icon: Clock },
    { id: "admin", titleKey: "modules.admin", icon: ShieldCheck },
  ];

  return (
    <nav className={cn("flex items-center gap-1 sm:gap-2", className)} {...props}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <Button
            key={tab.id}
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "cursor-pointer gap-2 text-xs font-medium transition-colors",
              isActive && "bg-secondary text-foreground font-semibold shadow-xs"
            )}
          >
            <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">{tNav(tab.titleKey)}</span>
          </Button>
        );
      })}
    </nav>
  );
}
