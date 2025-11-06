import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,

} from "@tanstack/react-table";
import type {
  ColumnDef,
} from "@tanstack/react-table";

interface Notification {
  TotalRowCount: number;
  NotificationID: number;
  ReferenceIdPK: number;
  FromUser: string;
  ToUser: string;
  Title: string;
  NotificationContent: string;
  DeviceID: string | null;
  DeviceToken: string | null;
  IsSent: boolean;
  SentAt: string | null;
  IsRead: boolean | null;
  ReadAt: string | null;
}



const apiUrl = import.meta.env.VITE_API_URL;
const NotificationTable: React.FC = () => {
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token found");

        const res = await axios.get(`${apiUrl}/api/notificationlog`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setData(res.data);
      } catch (err) {
        console.error("❌ Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const columns = useMemo<ColumnDef<Notification>[]>(
    () => [
      // {
      //   header: "#",
      //   cell: (info) => info.row.index + 1,
      // },
      { accessorKey: "NotificationID", header: "Notification ID" },
      { accessorKey: "ReferenceIdPK", header: "Reference ID" },
      { accessorKey: "FromUser", header: "From User" },
      { accessorKey: "ToUser", header: "To User" },
      { accessorKey: "Title", header: "Title" },
      { accessorKey: "NotificationContent", header: "Content" },
      {
        accessorKey: "IsSent",
        header: "Is Sent",
        cell: (info) =>
          info.getValue() ? (
            <span className="text-green-600 font-medium">Yes</span>
          ) : (
            <span className="text-red-500 font-medium">No</span>
          ),
      },
      {
        accessorKey: "IsRead",
        header: "Is Read",
        cell: (info) =>
          info.getValue() ? (
            <span className="text-green-600 font-medium">Read</span>
          ) : (
            <span className="text-red-500 font-medium">Unread</span>
          ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) {
    return <div className="text-center py-6 text-gray-600">Loading notifications...</div>;
  }

  return (
    <div className="p-6">
      {/* 🔍 Global Search */}
      <div className="mb-4 flex justify-between items-center">
        <input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search notifications..."
          className="border border-gray-300 rounded-md px-4 py-2 w-1/3 text-sm"
        />
      </div>

      {/* 🧾 Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer select-none"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: " 🔼",
                      desc: " 🔽",
                    }[header.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2 text-sm text-gray-800">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-6 text-gray-500">
                  No notifications found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📄 Pagination Controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationTable;
