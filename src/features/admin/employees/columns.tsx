"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Building, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { DataTableRowActions } from "./row-actions";
import type { EmployeeRecord } from "./actions";

export const columns: ColumnDef<EmployeeRecord>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
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
          <Building className="text-primary h-3.5 w-3.5" />
          <span>{dept ? dept[1] : "Pusat"}</span>
        </span>
      );
    },
    filterFn: (row, id, value) => {
      const dept = row.getValue(id) as [number, string] | false;
      const deptName = dept ? dept[1] : "Pusat";
      return value.includes(deptName);
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
    filterFn: (row, id, value) => {
      const activeStr = row.getValue(id) ? "true" : "false";
      return value.includes(activeStr);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row.original} />,
  },
];
