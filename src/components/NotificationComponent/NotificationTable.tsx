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
import { useAuth } from "../ContextAPI/AuthContext";
import NotificationDetailSidePanel from "../Notification/NotificationDetailSidePanel";
import * as Dialog from '@radix-ui/react-dialog';

import Pagination from "../Pagination";
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
  CreatedAt:string;
  Nomination: Nomination[] ; 

}
interface Nomination {
  NominationID: number;
  Nominee: string;
  Tenant: string;
  NominatedBy: string;
  AwardCategory: string;
  Descriptions:string;
}
interface NotificationTableProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
}

const apiUrl = import.meta.env.VITE_API_URL;

const NotificationTable: React.FC<NotificationTableProps> = ({
  isOpen,
  onClose,
  notifications = []
}) => {
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const { userId , authToken} = useAuth();
      const [isPanelOpen, setIsPanelOpen] = useState(false);
        const [selectedNominee, setSelectedNominee] = useState<Notification | null>(null);
  

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
       
        if (!authToken) throw new Error("No auth token found");

        const res = await axios.get(`${apiUrl}/api/notificationlog/${userId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
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
      //   header: "S.NO",
      //   cell: (info) => info.row.index + 1,
      // },
      // { accessorKey: "NotificationID", header: "Notification ID" },
      // { accessorKey: "ReferenceIdPK", header: "Reference ID" },
      //{ accessorKey: "FromUser", header: "From User" },
     
      { accessorKey: "Title", header: "Title" },
      { accessorKey: "NotificationContent", header: "Content" },
       { accessorKey: "Time", header: "Time" },
      // {
      //   accessorKey: "IsSent",
      //   header: "Is Sent",
      //   cell: (info) =>
      //     info.getValue() ? (
      //       <span className="text-green-600 font-medium">Yes</span>
      //     ) : (
      //       <span className="text-red-500 font-medium">No</span>
      //     ),
      // },
      // {
      //   accessorKey: "IsRead",
      //   header: "Is Read",
      //   cell: (info) =>
      //     info.getValue() ? (
      //       <span className="text-green-600 font-medium">Read</span>
      //     ) : (
      //       <span className="text-red-500 font-medium">Unread</span>
      //     ),
      // },
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
   const handleSidePanelView = (notification: Notification) => {
    setSelectedNominee(notification);
    setIsPanelOpen(true);
  };

  if (loading) {
    return <div className="text-center py-6 text-gray-600">Loading notifications...</div>;
  }

  
  return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
    
    <div className="p-6">
      

      {/* 🧾 Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg p-6">

        {/* 🔍 Global Search */}
      <div className="mb-4 flex justify-between items-center">
        <input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search notifications..."
          className="border border-gray-300 rounded-md px-4 py-2 w-1/3 text-sm"
        />
      </div>
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
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
                <tr key={row.id} className="hover:bg-gray-50" onClick={() => handleSidePanelView(row.original)}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 text-sm text-gray-900">
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


           <Pagination table={table} />
      </div>
<NotificationDetailSidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        notification={selectedNominee}
      />

    </div>
    </Dialog.Root>
  );

};

export default NotificationTable;
