"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  FolderTree,
  UserCheck,
  ShieldCheck,
  Building,
  Contact,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function AdminOverviewPage(): React.ReactElement {
  const tAdmin = useTranslations("admin.overview");

  const kpis = [
    {
      title: "Karyawan Aktif",
      value: "8 Personel",
      desc: "Odoo hr.employee",
      icon: UserCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      href: "/admin/employees",
    },
    {
      title: "Unit & Departemen",
      value: "7 Divisi",
      desc: "Kebun, Gudang & Roastery",
      icon: FolderTree,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      href: "/admin/departments",
    },
    {
      title: "Mitra & Kontak",
      value: "24 Rekanan",
      desc: "Petani, Pengepul, Roaster",
      icon: Contact,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      href: "/admin/contacts",
    },
    {
      title: "Grup Keamanan RBAC",
      value: "5 Peran",
      desc: "Odoo res.groups",
      icon: ShieldCheck,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      href: "/admin/roles",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{tAdmin("title")}</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">{tAdmin("subtitle")}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="hover:border-border shadow-xs transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-muted-foreground text-xs font-medium">
                  {kpi.title}
                </CardTitle>
                <div className={`rounded-md p-1.5 ${kpi.bg}`}>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{kpi.value}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground text-[11px]">{kpi.desc}</span>
                  <Button variant="ghost" size="sm" asChild className="h-6 px-1.5 text-[10px]">
                    <Link href={kpi.href}>
                      Buka <ArrowUpRight className="ml-0.5 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Building className="h-4 w-4 text-emerald-600" />
              Identitas Legal & Profil Usaha
            </CardTitle>
            <CardDescription className="text-xs">
              Konfigurasi holding PT Syailendra Group Mandiri di Odoo 18
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1 rounded-lg border p-3 text-xs">
              <div className="text-foreground font-semibold">PT Syailendra Group Mandiri</div>
              <div className="text-muted-foreground">
                Komoditas Specialty Kopi Sindoro-Dieng & Hasil Bumi
              </div>
              <div className="text-muted-foreground pt-1 text-[11px]">
                📍 Temanggung & Wonosobo, Jawa Tengah | 📧 official@syailendra.com
              </div>
            </div>
            <Button size="sm" variant="outline" asChild className="w-full text-xs">
              <Link href="/admin/company">Kelola Profil & Pengaturan Web</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Activity className="h-4 w-4 text-blue-600" />
              Status Sesi & Keamanan Odoo 18
            </CardTitle>
            <CardDescription className="text-xs">
              Koneksi RPC gateway backend Dahono VPS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3 text-xs">
              <div>
                <div className="font-semibold">Backend Odoo 18.0 CE</div>
                <div className="text-muted-foreground text-[11px]">
                  Database: odoo_dev (Docker Internal)
                </div>
              </div>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-600">
                Connected
              </Badge>
            </div>
            <Button size="sm" variant="outline" asChild className="w-full text-xs">
              <Link href="/admin/roles">Lihat Matriks Hak Akses (RBAC)</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
