import { useMemo, useState, useEffect, useCallback } from "react";
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
import { ActionMenu } from "../../../common/ActionMenu";
import NavigateButton from "../../../common/NavigateButton";

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

  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // ✅ ACTION HANDLERS
  const handleToggleMenu = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId((prev) => (prev === id ? null : id));
  }, []);

  const handleView = useCallback((item: StudyVersion) => {
    console.log("View:", item);
    setOpenMenuId(null);
  }, []);

  const handleEdit = useCallback((item: StudyVersion) => {
    console.log("Edit:", item);
    setOpenMenuId(null);
  }, []);

  const handleDelete = useCallback((item: StudyVersion) => {
    console.log("Delete:", item);
    setOpenMenuId(null);
  }, []);

  // ✅ CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".menu-container")) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
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
    ],
    [openMenuId, handleToggleMenu, handleView, handleEdit, handleDelete]
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
          <NavigateButton label="New Add" path="/new-add" />

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