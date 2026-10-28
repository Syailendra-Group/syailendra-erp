"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Users, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RolesPage(): React.ReactElement {
  const tAdmin = useTranslations("admin.roles");

  const roles = [
    {
      name: "Administrator Sistem (Root)",
      desc: "Akses penuh konfigurasi holding, seluruh modul, audit trail, dan database Odoo 18.",
      usersCount: 1,
      badge: "Super Admin",
      modules: {
        inventory: true,
        crm: true,
        hr: true,
        admin: true,
      },
    },
    {
      name: "Kepala Gudang & Mutasi Stok",
      desc: "Validasi surat jalan penerimaan panen petani (Receipts), lot tracking, dan surat jalan pengiriman (Deliveries).",
      usersCount: 2,
      badge: "Inventory Head",
      modules: {
        inventory: true,
        crm: false,
        hr: false,
        admin: false,
      },
    },
    {
      name: "Manajer Penjualan & Ekspor B2B",
      desc: "Pengelolaan prospek buyer roastery, kontrak perdagangan komoditas, dan direktori rekanan.",
      usersCount: 3,
      badge: "Commercial",
      modules: {
        inventory: false,
        crm: true,
        hr: false,
        admin: false,
      },
    },
    {
      name: "Supervisor SDM & Lapangan",
      desc: "Pemantauan presensi kerja kebun, rekap laporan harian petani mitra, dan jam kerja shift.",
      usersCount: 2,
      badge: "Operations HR",
      modules: {
        inventory: false,
        crm: false,
        hr: true,
        admin: false,
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{tAdmin("title")}</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">{tAdmin("subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {roles.map((r) => (
          <Card key={r.name} className="shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {r.badge}
                </Badge>
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Users className="h-3.5 w-3.5" />
                  {r.usersCount} Pengguna
                </span>
              </div>
              <CardTitle className="pt-2 text-sm font-bold">{r.name}</CardTitle>
              <CardDescription className="text-xs">{r.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-t pt-3">
                <div className="text-muted-foreground pb-2 text-[11px] font-semibold uppercase">
                  Hak Akses Modul Utama:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    {r.modules.inventory ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="text-muted-foreground/40 h-3.5 w-3.5" />
                    )}
                    <span>Gudang & Inventaris</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {r.modules.crm ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="text-muted-foreground/40 h-3.5 w-3.5" />
                    )}
                    <span>Pipeline CRM B2B</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {r.modules.hr ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="text-muted-foreground/40 h-3.5 w-3.5" />
                    )}
                    <span>Presensi & HR</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {r.modules.admin ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="text-muted-foreground/40 h-3.5 w-3.5" />
                    )}
                    <span>Tata Kelola Admin</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
