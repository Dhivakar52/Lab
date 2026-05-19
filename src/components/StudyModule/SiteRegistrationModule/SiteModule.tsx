import { useState, useEffect } from "react";
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
type SiteRegistration = {
  id: number;
  site: string;
  code: string;
  study: string;
  city: string;
  investigatorType: string;
  investigatorName: string;
  status: string;
};

// ✅ COMPONENT
const SiteModule = () => {

  // ✅ DATA
  const siteRegistrationData: SiteRegistration[] = [
    {
      id: 1,
      site: "SITE001",
      code: "ST001",
      study: "Apollo",
      city: "Chennai",
      investigatorType: "Dr",
      investigatorName: "Kumar",
      status: "Active",
    },
    {
      id: 2,
      site: "SITE002",
      code: "ST002",
      study: "SRM",
      city: "Hospital",
      investigatorType: "Dr",
      investigatorName: "Raj",
      status: "Draft",
    },
  ];

  // ✅ STATES
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // ✅ CLOSE MENU
  useEffect(() => {
    const close = () => setOpenMenuId(null);

    window.addEventListener("click", close);

    return () => window.removeEventListener("click", close);
  }, []);

  // ✅ ACTIONS
  const handleToggleMenu = (
    id: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    setOpenMenuId((prev) =>
      prev === id ? null : id
    );
  };

  const handleView = (row: SiteRegistration) => {
    console.log("View:", row);

    setOpenMenuId(null);
  };

  const handleEdit = (row: SiteRegistration) => {
    console.log("Edit:", row);

    setOpenMenuId(null);
  };

  const handleDelete = (row: SiteRegistration) => {
    console.log("Delete:", row);

    setOpenMenuId(null);
  };

  // ✅ COLUMNS
  const siteRegistrationColumns: ColumnDef<SiteRegistration>[] = [
    {
      accessorKey: "site",
      header: "Site",
    },
    {
      accessorKey: "code",
      header: "Code",
    },
    {
      accessorKey: "study",
      header: "Study",
    },
    {
      accessorKey: "city",
      header: "City",
    },
    {
      accessorKey: "investigatorType",
      header: "Type",
    },
    {
      accessorKey: "investigatorName",
      header: "Name",
    },

    {
      accessorKey: "status",
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

    // ✅ HAMBURGER MENU
    {
      id: "actions",
      header: "Actions",

      cell: ({ row }) => {
        const item = row.original;
        const isOpen = openMenuId === item.id;

        return (
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MENU BUTTON */}
            <button
              onClick={(e) =>
                handleToggleMenu(item.id, e)
              }
              className="p-2 rounded hover:bg-gray-100"
            >
              <Menu size={18} />
            </button>

            {/* DROPDOWN */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-[9999]">

                <button
                  onClick={() => handleView(item)}
                  className="block w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                >
                  View
                </button>

                <button
                  onClick={() => handleEdit(item)}
                  className="block w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(item)}
                  className="block w-full px-3 py-2 text-left hover:bg-red-50 text-red-600 text-sm"
                >
                  Delete
                </button>

              </div>
            )}
          </div>
        );
      },
    },
  ];

  // ✅ PAGINATION
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // ✅ TABLE
  const table = useReactTable({
    data: siteRegistrationData,
    columns: siteRegistrationColumns,

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
            placeholder="Search Site..."
          />

          <ColumnToggle table={table} />
        </div>

        {/* TABLE */}
        <DataTable
          table={table}
          columns={siteRegistrationColumns}
        />

        {/* PAGINATION */}
        <Pagination
          table={table}
          totalCount={
            table.getFilteredRowModel().rows.length
          }
        />
      </div>
    </div>
  );
};

export default SiteModule;