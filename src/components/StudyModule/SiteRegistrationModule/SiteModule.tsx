import { useMemo, useState, useEffect, useCallback, useRef } from "react";


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
const siteRegistrationData: SiteRegistration[] = useMemo(
  () => [
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
      city: "Coimbatore",
      investigatorType: "Dr",
      investigatorName: "Raj",
      status: "Draft",
    },
    {
      id: 3,
      site: "SITE003",
      code: "ST003",
      study: "Fortis",
      city: "Madurai",
      investigatorType: "Dr",
      investigatorName: "Anitha",
      status: "Active",
    },
    {
      id: 4,
      site: "SITE004",
      code: "ST004",
      study: "MIOT",
      city: "Chennai",
      investigatorType: "Dr",
      investigatorName: "Suresh",
      status: "Inactive",
    },
    {
      id: 5,
      site: "SITE005",
      code: "ST005",
      study: "Vijaya",
      city: "Salem",
      investigatorType: "Dr",
      investigatorName: "Priya",
      status: "Active",
    },
    {
      id: 6,
      site: "SITE006",
      code: "ST006",
      study: "Apollo",
      city: "Trichy",
      investigatorType: "Dr",
      investigatorName: "Mohan",
      status: "Draft",
    },
    {
      id: 7,
      site: "SITE007",
      code: "ST007",
      study: "SRM",
      city: "Vellore",
      investigatorType: "Dr",
      investigatorName: "Divya",
      status: "Active",
    },
    {
      id: 8,
      site: "SITE008",
      code: "ST008",
      study: "Fortis",
      city: "Erode",
      investigatorType: "Dr",
      investigatorName: "Karthik",
      status: "Inactive",
    },
    {
      id: 9,
      site: "SITE009",
      code: "ST009",
      study: "MIOT",
      city: "Chennai",
      investigatorType: "Dr",
      investigatorName: "Lakshmi",
      status: "Active",
    },
    {
      id: 10,
      site: "SITE010",
      code: "ST010",
      study: "Vijaya",
      city: "Madurai",
      investigatorType: "Dr",
      investigatorName: "Arun",
      status: "Draft",
    },
  ],
  []
);

  // ✅ STATES
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [loading, _setLoading] = useState(false); // Add loading state
  const tableWrapperRef = useRef<HTMLDivElement>(null); // Add ref for table wrapper

  // ✅ CLOSE MENU (optimized)
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

  // ✅ ACTIONS (memoized to prevent unnecessary re-renders)
  const handleView = useCallback((row: SiteRegistration) => {
    console.log("View:", row);
    setOpenMenuId(null);
  }, []);

  const handleEdit = useCallback((row: SiteRegistration) => {
    console.log("Edit:", row);
    setOpenMenuId(null);
  }, []);

  const handleDelete = useCallback((row: SiteRegistration) => {
    console.log("Delete:", row);
    setOpenMenuId(null);
  }, []);

  const handleToggleMenu = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId((prev) => (prev === id ? null : id));
  }, []);

  // ✅ COLUMNS (memoized with all dependencies)
  const siteRegistrationColumns: ColumnDef<SiteRegistration>[] = useMemo(
    () => [
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
    [openMenuId, handleToggleMenu, handleView, handleEdit, handleDelete] // ✅ Added all dependencies
  );

  // ✅ PAGINATION
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // ✅ TABLE INSTANCE
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
            <NavigateButton
  label="Add Site"
  path="/study/site/new-add"
  icon={<Plus size={18} />}
  />

        </div>

     
        <DataTable
          table={table}
          columns={siteRegistrationColumns}
          loading={loading} 
          tableWrapperRef={tableWrapperRef} 
        />

        {/* PAGINATION */}
        <Pagination
          table={table}
          totalCount={table.getFilteredRowModel().rows.length}
        />
      </div>
    </div>
  );
};

export default SiteModule;