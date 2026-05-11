import { useMemo, useState, useCallback, useEffect } from "react";
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

import { Menu } from "lucide-react";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

const Dashboard = () => {
  const roles = ["Admin", "User", "Manager"];

  // ✅ DATA
  const data: User[] = useMemo(
    () =>
      Array.from({ length: 500 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@gmail.com`,
        role: roles[i % 3],
      })),
    []
  );

  // ✅ STATES
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [formData, setFormData] = useState<User | null>(null);

  // ✅ CLOSE DROPDOWN
  useEffect(() => {
    const close = () => setOpenMenuId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // ✅ PANEL
  const handleOpenPanel = useCallback((user: User) => {
    setFormData(user);
    setIsPanelOpen(true);
  }, []);

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setFormData(null);
  };

  const handleSave = () => {
    console.log("Updated:", formData);
    setIsPanelOpen(false);
  };

  const handleChange = (key: keyof User, value: string) => {
    setFormData((prev) =>
      prev ? { ...prev, [key]: value } : prev
    );
  };

  // ✅ ACTION DROPDOWN
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
      { accessorKey: "role", header: "Role" },

      {
        id: "action",
        header: "Action",
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
    [openMenuId, handleOpenPanel]
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

        {/* HEADER */}
        <div className="flex justify-end items-center mb-4">
          
          <div className="flex justify-end items-center gap-3">
            <TableSearch
              value={globalFilter}
              onChange={setGlobalFilter}
              placeholder="Search users..."
            />
            <ColumnToggle table={table} />
          </div>
        </div>

        {/* TABLE */}
        <DataTable table={table} columns={columns} />

        {/* PAGINATION */}
        <Pagination
          table={table}
          totalCount={table.getFilteredRowModel().rows.length}
        />
      </div>

      {/* PANEL */}
      <CustomPanel
        isOpen={isPanelOpen}
        title="Edit User"
        onClose={handleClosePanel}
        onSave={handleSave}
        saveLabel="Update"
      >
        {formData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="text-sm text-gray-500">ID</label>
              <input
                value={formData.id}
                disabled
                className="w-full border px-3 py-2 rounded bg-gray-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">Name</label>
              <input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">Email</label>
              <input
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">Role</label>
              <select
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
                <option value="Manager">Manager</option>
              </select>
            </div>

          </div>
        )}
      </CustomPanel>
    </div>
  );
};

export default Dashboard;