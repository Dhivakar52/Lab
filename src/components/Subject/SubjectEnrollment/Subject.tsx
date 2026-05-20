import { useMemo, useState, useEffect, useCallback } from "react";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "../../../common/DataTable";
import Pagination from "../../../common/Pagination";
import TableSearch from "../../../common/TableSearch";
import ColumnToggle from "../../../common/ColumnToggle";
import { ActionMenu } from "../../../common/ActionMenu";

type Subject = {
  id: number;
  subject: string;
  studyId: string;
  study: string;
  code: string;
  gender: string;
  arm: string;
  enrollment: string;
  status: string;
};

const Subject = () => {
  const data = useMemo<Subject[]>(() => [
    {
      id: 1,
      subject: "SUB001",
      studyId: "ST001",
      study: "Female",
      code: "Arm",
      gender: "A",
      arm: "Enrolled",
      enrollment: "View/Edit",
      status: "",
    },
    {
      id: 2,
      subject: "SUB002",
      studyId: "ST002",
      study: "Male",
      code: "Arm",
      gender: "B",
      arm: "Screening",
      enrollment: "Failed",
      status: "View/Edit",
    },
  ], []);

  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // ✅ overlay position
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // ✅ close outside
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".menu-container")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // ✅ toggle menu
  const handleToggleMenu = useCallback(
    (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      const rect = e.currentTarget.getBoundingClientRect();

      setMenuPosition({
        top: rect.bottom + 5,
        left: rect.right - 130,
      });

      setOpenMenuId((prev) => (prev === id ? null : id));
    },
    []
  );

//   const handleView = (item: Subject) => {
//     console.log("View:", item);
//     setOpenMenuId(null);
//   };

//   const handleEdit = (item: Subject) => {
//     console.log("Edit:", item);
//     setOpenMenuId(null);
//   };

  const columns: ColumnDef<Subject>[] = useMemo(
    () => [
      { accessorKey: "subject", header: "Subject" },
      { accessorKey: "studyId", header: "ID" },
      { accessorKey: "study", header: "Study" },
      { accessorKey: "code", header: "Code" },
      { accessorKey: "gender", header: "Gender" },
      { accessorKey: "arm", header: "Arm/Cohort" },
      { accessorKey: "enrollment", header: "Enrollment" },
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
    ],
    [openMenuId, menuPosition, handleToggleMenu]
  );

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

export default Subject;