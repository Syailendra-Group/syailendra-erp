"use client";

import * as React from "react";
import { type Table } from "@tanstack/react-table";
import { Trash2, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DataTableBulkActionsProps<TData> {
  table: Table<TData>;
  onBulkDelete?: (selectedRows: TData[]) => void;
  onBulkExport?: (selectedRows: TData[]) => void;
}

export function DataTableBulkActions<TData>({
  table,
  onBulkDelete,
  onBulkExport,
}: DataTableBulkActionsProps<TData>): React.ReactElement | null {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const count = selectedRows.length;

  if (count === 0) return null;

  return (
    <div className="bg-primary text-primary-foreground animate-in fade-in slide-in-from-bottom-2 fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl px-4 py-2 shadow-lg duration-200">
      <span className="text-xs font-semibold">{count} selected</span>
      <div className="bg-primary-foreground/20 mx-1 h-4 w-px" />

      {onBulkExport && (
        <Button
          variant="ghost"
          size="sm"
          className="text-primary-foreground hover:bg-primary-foreground/10 h-7 cursor-pointer gap-1 px-2 text-xs"
          onClick={() => onBulkExport(selectedRows.map((r) => r.original))}
        >
          <Download className="h-3 w-3" />
          <span>Export</span>
        </Button>
      )}

      {onBulkDelete && (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive-foreground hover:bg-destructive/20 h-7 cursor-pointer gap-1 px-2 text-xs"
          onClick={() => onBulkDelete(selectedRows.map((r) => r.original))}
        >
          <Trash2 className="h-3 w-3 text-red-300" />
          <span>Archive</span>
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 h-6 w-6 cursor-pointer"
        onClick={() => table.toggleAllRowsSelected(false)}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
