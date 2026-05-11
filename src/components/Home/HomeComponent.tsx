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

import { DataTable } from "../../common/DataTable";
import Pagination from "../../common/Pagination";
import CustomPanel from "../../common/CustomPanel";
import TableSearch from "../../common/TableSearch";
import ColumnToggle from "../../common/ColumnToggle";

type User = {
  id: number;
  name: string;
  email: string;
};

const HomeComponent = () => {

  // ✅ DATA
  const data: User[] = useMemo(
    () =>
      Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@gmail.com`,
      })),
    []
  );

  // ✅ STATES
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // ✅ CLOSE DROPDOWN
  useEffect(() => {
    const close = () => setOpenMenuId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // ✅ PANEL
  const handleOpenPanel = (user: User) => {
    setSelectedUser(user);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedUser(null);
  };

  const handleSave = () => {
    console.log("Saved:", selectedUser);
    setIsPanelOpen(false);
  };

  // ✅ DROPDOWN
  const handleToggleMenu = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const handleView = (user: User) => {
    handleOpenPanel(user);
    setOpenMenuId(null);
  };

  const handleEdit = (user: User) => {
    handleOpenPanel(user);
    setOpenMenuId(null);
  };

  const handleDelete = (user: User) => {
    console.log("Delete:", user);
    setOpenMenuId(null);
  };

  // ✅ COLUMNS
  const columns: ColumnDef<User>[] = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },

      {
        id: "action",
        header: "Action",
        enableHiding: false,
        cell: ({ row }) => {
          const user = row.original;
          const isOpen = openMenuId === user.id;

          return (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => handleToggleMenu(user.id, e)}
                className="p-2 rounded hover:bg-gray-100"
              >
                <Menu size={18} />
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => handleView(user)}
                    className="block w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(user)}
                    className="block w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
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
    ],
    [openMenuId]
  );

  // ✅ PAGINATION
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // ✅ TABLE
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
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),

    globalFilterFn: "includesString",
  });

  return (
    <div className="p-6">
      <div className="bg-white shadow-md rounded-lg p-6">

        {/* 🔥 HEADER */}
        <div className="flex justify-end items-center mb-4 gap-3">

          <TableSearch
            value={globalFilter}
            onChange={setGlobalFilter}
            placeholder="Search users..."
          />

          <ColumnToggle table={table} />

        </div>

        {/* TABLE */}
        <DataTable table={table} columns={columns} />

        {/* PAGINATION (🔥 FIXED FILTER COUNT) */}
        <Pagination
          table={table}
          totalCount={table.getFilteredRowModel().rows.length}
        />

      </div>

      {/* PANEL */}
      <CustomPanel
        isOpen={isPanelOpen}
        title="User Details"
        onClose={handleClosePanel}
        onSave={handleSave}
      >
        {selectedUser && (
          <div className="space-y-3">
            <div><b>ID:</b> {selectedUser.id}</div>
            <div><b>Name:</b> {selectedUser.name}</div>
            <div><b>Email:</b> {selectedUser.email}</div>
          </div>
        )}
      </CustomPanel>
    </div>
  );
};

export default HomeComponent;