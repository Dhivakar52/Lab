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
import { Plus } from "lucide-react";
// ✅ TYPE
type StudyVersion = {
  id: number;
  study: string;
  code: string;
  oldVersion: string;
  versionDate: string;
  newStatus: string;
  
};

const StudyVersionTable = () => {

const data: StudyVersion[] = useMemo(
  () => [
    {
      id: 1,
      study: "ST001",
      code: "v1.0",
      oldVersion: "v0.9",
      versionDate: "01-Jan-26",
      newStatus: "Active",
    },
    {
      id: 2,
      study: "ST002",
      code: "v1.1",
      oldVersion: "v1.0",
      versionDate: "03-Jan-26",
      newStatus: "Draft",
    },
    {
      id: 3,
      study: "ST003",
      code: "v2.0",
      oldVersion: "v1.5",
      versionDate: "05-Jan-26",
      newStatus: "Active",
    },
    {
      id: 4,
      study: "ST004",
      code: "v2.1",
      oldVersion: "v2.0",
      versionDate: "07-Jan-26",
      newStatus: "Inactive",
    },
    {
      id: 5,
      study: "ST005",
      code: "v3.0",
      oldVersion: "v2.5",
      versionDate: "09-Jan-26",
      newStatus: "Draft",
    },
    {
      id: 6,
      study: "ST006",
      code: "v3.1",
      oldVersion: "v3.0",
      versionDate: "11-Jan-26",
      newStatus: "Active",
    },
    {
      id: 7,
      study: "ST007",
      code: "v4.0",
      oldVersion: "v3.5",
      versionDate: "13-Jan-26",
      newStatus: "Draft",
    },
    {
      id: 8,
      study: "ST008",
      code: "v4.1",
      oldVersion: "v4.0",
      versionDate: "15-Jan-26",
      newStatus: "Active",
    },
    {
      id: 9,
      study: "ST009",
      code: "v5.0",
      oldVersion: "v4.5",
      versionDate: "17-Jan-26",
      newStatus: "Inactive",
    },
    {
      id: 10,
      study: "ST010",
      code: "v5.1",
      oldVersion: "v5.0",
      versionDate: "19-Jan-26",
      newStatus: "Active",
    },
    {
      id: 11,
      study: "ST011",
      code: "v6.0",
      oldVersion: "v5.5",
      versionDate: "21-Jan-26",
      newStatus: "Draft",
    },
    {
      id: 12,
      study: "ST012",
      code: "v6.1",
      oldVersion: "v6.0",
      versionDate: "23-Jan-26",
      newStatus: "Active",
    },
    {
      id: 13,
      study: "ST013",
      code: "v7.0",
      oldVersion: "v6.5",
      versionDate: "25-Jan-26",
      newStatus: "Inactive",
    },
    {
      id: 14,
      study: "ST014",
      code: "v7.1",
      oldVersion: "v7.0",
      versionDate: "27-Jan-26",
      newStatus: "Draft",
    },
    {
      id: 15,
      study: "ST015",
      code: "v8.0",
      oldVersion: "v7.5",
      versionDate: "29-Jan-26",
      newStatus: "Active",
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
         <NavigateButton
  label="Add Study"
  path="/study/master/new-add"
  icon={<Plus size={18} />}
/>

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