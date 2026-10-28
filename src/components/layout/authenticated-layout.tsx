"use client";

import * as React from "react";
import { usePathname } from "@/i18n/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { useNavStore, type ModuleTab } from "@/stores/nav-store";
import { AppSidebar } from "./app-sidebar";
import { Header } from "./header";
import { Main } from "./main";

export interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps): React.ReactElement {
  const pathname = usePathname();
  const setActiveTab = useNavStore((state) => state.setActiveTab);

  // Synchronize Topbar macro tab & Sidebar menu with current URL pathname
  React.useEffect(() => {
    let matchedTab: ModuleTab = "inventory";
    if (pathname.startsWith("/employees") || pathname.startsWith("/admin")) {
      matchedTab = "employees";
    } else if (pathname.startsWith("/crm")) {
      matchedTab = "crm";
    } else if (pathname.startsWith("/hr")) {
      matchedTab = "hr";
    } else if (pathname.startsWith("/inventory") || pathname === "/") {
      matchedTab = "inventory";
    }
    setActiveTab(matchedTab);
  }, [pathname, setActiveTab]);

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset className="flex min-h-screen flex-col">
          <Header />
          <Main>
            <Breadcrumbs />
            {children}
          </Main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
