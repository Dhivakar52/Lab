import { useMemo, useState, useEffect, useCallback } from "react";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "../../../common/DataTable";
import TableSearch from "../../../common/TableSearch";
import ColumnToggle from "../../../common/ColumnToggle";
import Pagination from "../../../common/Pagination";
import { ActionMenu } from "../../../common/ActionMenu";

type AE = {
  id: number;
  ae: string;
  subject: string;
  severity: string;
  date: string;
  status: string;
};

const Adverse = () => {
  const data = useMemo<AE[]>(() => [
    { id: 1, ae: "AE001", subject: "SUB001", severity: "Mild", date: "12-Feb", status: "Open" },
    { id: 2, ae: "AE002", subject: "SUB002", severity: "Severe", date: "15-Feb", status: "Closed" },
  ], []);

  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // ✅ position for overlay
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // ✅ close outside click
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".menu-container")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // ✅ handlers
  const handleToggleMenu = useCallback((id: number, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();

    setMenuPosition({
      top: rect.bottom + 5,
      left: rect.right - 120,
    });

    setOpenMenuId((prev) => (prev === id ? null : id));
  }, []);



  // ✅ columns
  const columns: ColumnDef<AE>[] = useMemo(() => [
    { accessorKey: "ae", header: "AE" },
    { accessorKey: "subject", header: "Subject" },
    { accessorKey: "severity", header: "Severity" },
    { accessorKey: "date", header: "Date" },
    { accessorKey: "status", header: "Status" },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
    
        return (
          <ActionMenu
            item={item}
            onView={(data) => console.log("View:", data)}
            onEdit={(data) => console.log("Edit:", data)}
               onDelete={(data) => console.log("onDelete:", data)}
          />
        );
      },
    }
  ], [openMenuId, menuPosition, handleToggleMenu]);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, columnVisibility },
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="p-6">
      <div className="bg-white shadow-md rounded-lg p-6">

        {/* HEADER */}
        <div className="flex justify-end items-center mb-4 gap-3">
          <TableSearch
            value={globalFilter}
            onChange={setGlobalFilter}
            placeholder="Search..."
          />
          <ColumnToggle table={table} />
        </div>

        {/* TABLE */}
        <DataTable table={table} columns={columns} />

        {/* PAGINATION */}
        <Pagination
          table={table}
          totalCount={table.getFilteredRowModel().rows.length}
        />

      </div>
    </div>
  );
};

export default Adverse;