"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle(): React.ReactElement {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (nextLocale: string) => {
    // If switching to en from default (id)
    if (nextLocale === "en" && !pathname.startsWith("/en")) {
      router.push(`/en${pathname}`);
    } else if (nextLocale === "id" && pathname.startsWith("/en")) {
      const unprefixed = pathname.replace(/^\/en/, "") || "/";
      router.push(unprefixed);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer gap-2 text-xs font-semibold">
          <Languages className="h-4 w-4 text-emerald-500" />
          <span className="uppercase">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleLanguageChange("id")}
          className={`cursor-pointer ${locale === "id" ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}`}
        >
          🇮🇩 Bahasa Indonesia (Default)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange("en")}
          className={`cursor-pointer ${locale === "en" ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}`}
        >
          🇬🇧 English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
