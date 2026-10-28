"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Building, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { DataTableRowActions } from "./row-actions";
import type { EmployeeRecord } from "./actions";

export const columns: ColumnDef<EmployeeRecord>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Karyawan" />,
    cell: ({ row }) => {
      const emp = row.original;
      return <div className="text-foreground font-semibold">{emp.name}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: "job_title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Jabatan Operasional" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs font-medium">
        {row.original.job_title || "-"}
      </span>
    ),
  },
  {
    accessorKey: "department_id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Departemen" />,
    cell: ({ row }) => {
      const dept = row.original.department_id;
      return (
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Building className="h-3.5 w-3.5 text-emerald-500" />
          <span>{dept ? dept[1] : "Pusat"}</span>
        </span>
      );
    },
  },
  {
    accessorKey: "work_email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Kontak Kerja" />,
    cell: ({ row }) => {
      const emp = row.original;
      return (
        <div className="space-y-0.5 text-[11px]">
          {emp.work_email && (
            <div className="text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span>{emp.work_email}</span>
            </div>
          )}
          {emp.work_phone && (
            <div className="text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{emp.work_phone}</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "active",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" className="justify-center" />
    ),
    cell: ({ row }) => {
      const active = row.original.active;
      return (
        <div className="flex justify-center">
          <Badge variant={active ? "default" : "secondary"} className="text-[10px]">
            {active ? "Aktif" : "Diarsipkan"}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row.original} />,
  },
];
