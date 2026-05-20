import { useMemo, useState } from "react";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "../../common/DataTable";
import TableSearch from "../../common/TableSearch";
import ColumnToggle from "../../common/ColumnToggle";
import Pagination from "../../common/Pagination";
import { ActionMenu } from "../../common/ActionMenu";

// ✅ TYPE (based on your image)
type Visit = {
  id: number;
  visitId: string;
  subject: string;
  visitName: string;
  status: string;
};

const VisitTable = () => {
  // ✅ DATA
  const data = useMemo<Visit[]>(
    () => [
      {
        id: 1,
        visitId: "VIS001",
        subject: "SUB001",
        visitName: "Screening",
        status: "Scheduled",
      },
      {
        id: 2,
        visitId: "VIS002",
        subject: "SUB001",
        visitName: "Baseline",
        status: "Completed",
      },
    ],
    []
  );

  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});

  // ✅ COLUMNS
  const columns: ColumnDef<Visit>[] = useMemo(
    () => [
      { accessorKey: "visitId", header: "Visit ID" },
      { accessorKey: "subject", header: "Subject" },
      { accessorKey: "visitName", header: "Visit" },

      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const value = getValue<string>();

          return (
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                value === "Completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {value}
            </span>
          );
        },
      },

      // ✅ REUSABLE ACTION MENU
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
              onDelete={(data) => console.log("Delete:", data)}
            />
          );
        },
      },
    ],
    []
  );

  // ✅ TABLE
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, columnVisibility },
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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

export default VisitTable;