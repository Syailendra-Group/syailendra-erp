"use client";

import * as React from "react";
import { ChevronRight, Home } from "lucide-react";
import { usePathname, Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function Breadcrumbs(): React.ReactElement | null {
  const pathname = usePathname();
  const tNav = useTranslations("nav");

  // Split pathname into segments (e.g. /employees/departments -> ["employees", "departments"])
  const segments = React.useMemo(() => {
    return pathname.split("/").filter(Boolean);
  }, [pathname]);

  if (segments.length === 0) return null;

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList className="text-muted-foreground text-xs">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/inventory" className="hover:text-foreground flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />
              <span>{tNav("breadcrumbs.home")}</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;
          const labelKey = `breadcrumbs.${segment}`;
          let label = segment;
          try {
            label = tNav(labelKey);
          } catch {
            label = segment.charAt(0).toUpperCase() + segment.slice(1);
          }

          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator>
                <ChevronRight className="h-3 w-3" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="text-foreground font-semibold capitalize">
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href} className="hover:text-foreground capitalize">
                      {label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
