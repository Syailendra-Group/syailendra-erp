"use client";

import * as React from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "./app-sidebar";
import { Header } from "./header";
import { Main } from "./main";

export interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps): React.ReactElement {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset className="flex min-h-screen flex-col">
          <Header />
          <Main>{children}</Main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
