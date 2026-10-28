"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { UserPlus, Edit2, Archive, RotateCcw, Building, Mail, Phone, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  getEmployeesAction,
  toggleEmployeeStatusAction,
  type DepartmentOption,
  type EmployeeRecord,
} from "@/features/admin/employees/actions";
import { EmployeeForm } from "@/features/admin/employees/form";

export default function EmployeesPage(): React.ReactElement {
  const tAdmin = useTranslations("admin.employees");
  const tCommon = useTranslations("common");

  const [employees, setEmployees] = React.useState<EmployeeRecord[]>([]);
  const [departments, setDepartments] = React.useState<DepartmentOption[]>([]);
  const [search, setSearch] = React.useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [selectedEmp, setSelectedEmp] = React.useState<EmployeeRecord | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const refreshData = React.useCallback(() => {
    startTransition(async () => {
      const data = await getEmployeesAction();
      setEmployees(data.employees);
      setDepartments(data.departments);
    });
  }, []);

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleToggleStatus = async (emp: EmployeeRecord) => {
    const res = await toggleEmployeeStatusAction(emp.id, !emp.active);
    if (res.success) {
      toast.success(emp.active ? tAdmin("messages.archived") : tAdmin("messages.updated"));
      refreshData();
    } else {
      toast.error(res.error || "Failed to update status");
    }
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.job_title?.toLowerCase().includes(search.toLowerCase()) ||
      (e.work_email && e.work_email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{tAdmin("title")}</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">{tAdmin("subtitle")}</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setSelectedEmp(null);
            setIsDialogOpen(true);
          }}
          className="cursor-pointer gap-2 text-xs font-semibold"
        >
          <UserPlus className="h-4 w-4" />
          <span>{tAdmin("actions.add")}</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={tCommon("actions.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        <Badge variant="outline" className="text-xs">
          Total: {filteredEmployees.length} Karyawan
        </Badge>
      </div>

      {/* Employees Table Card */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">
            Database Karyawan Odoo 18 (hr.employee)
          </CardTitle>
          <CardDescription className="text-xs">
            Sinkronisasi instan dua arah dengan database VPS Dahono
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground text-[11px] tracking-wider uppercase">
                <tr>
                  <th className="px-3 py-2.5">Nama Karyawan</th>
                  <th className="px-3 py-2.5">Jabatan</th>
                  <th className="px-3 py-2.5">Departemen</th>
                  <th className="px-3 py-2.5">Kontak</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                  <th className="px-3 py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-border/60 divide-y">
                {isPending && employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-muted-foreground py-8 text-center text-xs">
                      {tCommon("status.loading")}
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-muted-foreground py-8 text-center text-xs">
                      {tCommon("status.empty")}
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                      <td className="text-foreground px-3 py-3 font-semibold">{emp.name}</td>
                      <td className="text-muted-foreground px-3 py-3 font-medium">
                        {emp.job_title || "-"}
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Building className="h-3 w-3 text-emerald-500" />
                          {emp.department_id ? emp.department_id[1] : "Pusat"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="space-y-0.5 text-[11px]">
                          {emp.work_email && (
                            <div className="text-muted-foreground flex items-center gap-1">
                              <Mail className="h-2.5 w-2.5" />
                              <span>{emp.work_email}</span>
                            </div>
                          )}
                          {emp.work_phone && (
                            <div className="text-muted-foreground flex items-center gap-1">
                              <Phone className="h-2.5 w-2.5" />
                              <span>{emp.work_phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <Badge
                          variant={emp.active ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {emp.active ? "Aktif" : "Diarsipkan"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 cursor-pointer"
                            onClick={() => {
                              setSelectedEmp(emp);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit2 className="text-muted-foreground h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 h-7 w-7 cursor-pointer"
                            onClick={() => handleToggleStatus(emp)}
                          >
                            {emp.active ? (
                              <Archive className="h-3.5 w-3.5" />
                            ) : (
                              <RotateCcw className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Modal Form Employee */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {selectedEmp ? tAdmin("actions.edit") : tAdmin("actions.add")}
            </DialogTitle>
          </DialogHeader>
          <EmployeeForm
            initialData={selectedEmp}
            departments={departments}
            onSuccess={() => {
              setIsDialogOpen(false);
              refreshData();
            }}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
