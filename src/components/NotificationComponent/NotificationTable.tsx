import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useAuth } from "../ContextAPI/AuthContext";
import NotificationDetailSidePanel from "../Notification/NotificationDetailSidePanel";
import * as Dialog from '@radix-ui/react-dialog';
import { Search, Bell } from "lucide-react";
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
  CreatedAt: string;
  Nomination: Nomination[];
}

interface Nomination {
  NominationID: number;
  Nominee: string;
  Tenant: string;
  NominatedBy: string;
  AwardCategory: string;
  Descriptions: string;
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
  // notifications = []
}) => {
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const { userId, authToken } = useAuth();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedNominee, setSelectedNominee] = useState<Notification | null>(null);
  
     const [totalCount, setTotalCount] = useState(0); 

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!authToken) throw new Error("No auth token found");

        const res = await axios.get(`${apiUrl}/api/notificationlog/${userId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
         //setTotalCount(res.data[0]?.TotalCount || 0);
        setTotalCount(res.data.length);
        setData(res.data);
      } catch (err) {
        console.error("❌ Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId, authToken]);

  const columns = useMemo<ColumnDef<Notification>[]>(
    () => [
      { accessorKey: "Title", header: "Title" },
      { accessorKey: "NotificationContent", header: "Content" },
      { accessorKey: "CreatedAt", header: "Time" },
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
    initialState: {
      pagination: {
        pageSize: 8, 
      },
    },
  });

  const handleSidePanelView = (notification: Notification) => {
    setSelectedNominee(notification);
    setIsPanelOpen(true);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center py-6 text-gray-600">Loading notifications...</div>
      </div>
    );
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <div className="min-h-screen ">
        <div className="mx-3 p-6 bg-white rounded-lg shadow-sm my-3">
          
          {/* Header */}
          <div className="mb-6 flex justify-between item-center">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-6 h-6 text-gray-700" />
              <h1 className="text-2xl font-semibold text-gray-900">All Notifications</h1>
            </div>

            {/* Search Bar */}
            <div className="relative w-75">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Notifications Cards - Using table.getRowModel() */}
          <div className="">
            <div className="space-y-3 mb-6">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <div
                    key={row.id}
                    onClick={() => handleSidePanelView(row.original)}
                    className="bg-[#F0F5FF] rounded-lg p-4 cursor-pointer hover:bg-[#E5EDFF] transition-all duration-200 border border-gray-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1.5 text-base">
                          {row.original.Title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {row.original.NotificationContent}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap mt-1">
                        {getTimeAgo(row.original.CreatedAt)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-gray-500">
                  <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No notifications found</p>
                </div>
              )}
            </div>

            {/* Your existing Pagination component */}
            <Pagination  table={table}  totalCount={ globalFilter  ? table.getFilteredRowModel().rows.length : totalCount }  />
          </div>

          {/* Side Panel */}
          <NotificationDetailSidePanel
            isOpen={isPanelOpen}
            onClose={() => setIsPanelOpen(false)}
            notification={selectedNominee}
          />
        </div>
      </div>
    </Dialog.Root>
  );
};

export default NotificationTable;