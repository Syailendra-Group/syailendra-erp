"use client";

import * as React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { TopNav } from "./top-nav";
import { cn } from "@/lib/utils";

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean;
}

export function Header({
  className,
  fixed = true,
  children,
  ...props
}: HeaderProps): React.ReactElement {
  return (
    <header
      className={cn(
        "bg-background/95 supports-backdrop-filter:bg-background/60 border-border/80 z-30 h-16 border-b backdrop-blur-md",
        fixed && "sticky top-0 w-full",
        className
      )}
      {...props}
    >
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger variant="outline" className="cursor-pointer" />
          <Separator orientation="vertical" className="h-5" />
          <TopNav />
        </div>

        <div className="flex items-center gap-2">
          {children}
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
