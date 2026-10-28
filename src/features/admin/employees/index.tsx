"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { EmployeesProvider } from "@/contexts/employees-context";
import { EmployeesTable } from "./table";
import { EmployeesDialogs } from "./dialogs";
import { columns } from "./columns";
import { getEmployeesAction, type DepartmentOption, type EmployeeRecord } from "./actions";

export function EmployeesFeature(): React.ReactElement {
  const tAdmin = useTranslations("admin.employees");
  const [employees, setEmployees] = React.useState<EmployeeRecord[]>([]);
  const [departments, setDepartments] = React.useState<DepartmentOption[]>([]);
  const [, startTransition] = React.useTransition();

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

  return (
    <EmployeesProvider refreshData={refreshData} initialDepartments={departments}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{tAdmin("title")}</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">{tAdmin("subtitle")}</p>
        </div>

        <EmployeesTable columns={columns} data={employees} />
        <EmployeesDialogs />
      </div>
    </EmployeesProvider>
  );
}
