import { useMemo, useState, useEffect } from "react";
import { Menu } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "../../../common/DataTable";
import Pagination from "../../../common/Pagination";
import TableSearch from "../../../common/TableSearch";
import ColumnToggle from "../../../common/ColumnToggle";

// ✅ TYPE
type StudyVersion = {
  id: number;
  study: string;
  code: string;
  oldVersion: string;
  versionDate: string;
  newStatus: string;
  actionType: string;
};

const StudyVersionTable = () => {

  // ✅ DATA (memoized)
  const data: StudyVersion[] = useMemo(
    () => [
      {
        id: 1,
        study: "ST001",
        code: "v1.0",
        oldVersion: "v2.0",
        versionDate: "12-Feb-26",
        newStatus: "Active",
        actionType: "View",
      },
      {
        id: 2,
        study: "ST002",
        code: "v2.0",
        oldVersion: "v2.1",
        versionDate: "15-Feb-26",
        newStatus: "Draft",
        actionType: "View/Edit",
      },
    ],
    []
  );

  // ✅ STATES
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // ✅ FIXED CLOSE HANDLER (no lag)
  useEffect(() => {
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (!target.closest(".menu-container")) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // ✅ COLUMNS (memoized)
  const columns: ColumnDef<StudyVersion>[] = useMemo(
    () => [
      { accessorKey: "study", header: "Study" },
      { accessorKey: "code", header: "Code" },
      { accessorKey: "oldVersion", header: "Old Version" },
      { accessorKey: "versionDate", header: "Version Date" },

      {
        accessorKey: "newStatus",
        header: "Status",
        cell: ({ getValue }) => {
          const value = getValue<string>();

          return (
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                value === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {value}
            </span>
          );
        },
      },

      { accessorKey: "actionType", header: "Action Type" },

      // ✅ ACTION MENU
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,

        cell: ({ row }) => {
          const item = row.original;
          const isOpen = openMenuId === item.id;

          return (
            <div
              className="relative menu-container"
              onClick={(e) => e.stopPropagation()}
            >
              {/* BUTTON */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId((prev) =>
                    prev === item.id ? null : item.id
                  );
                }}
                className="p-2 rounded hover:bg-gray-100"
              >
                <Menu size={18} />
              </button>

              {/* DROPDOWN */}
              {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-[9999] transition-all duration-150">

                  <button
                    onClick={() => {
                      console.log("View:", item);
                      setOpenMenuId(null);
                    }}
                    className="block w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                  >
                    View
                  </button>

                  <button
                    onClick={() => {
                      console.log("Edit:", item);
                      setOpenMenuId(null);
                    }}
                    className="block w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                  >
                    Edit
                  </button>

                </div>
              )}
            </div>
          );
        },
      },
    ],
    [openMenuId]
  );

  // ✅ PAGINATION
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // ✅ TABLE INSTANCE
  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      globalFilter,
      columnVisibility,
    },

    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),

    globalFilterFn: "includesString",
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

export default StudyVersionTable;