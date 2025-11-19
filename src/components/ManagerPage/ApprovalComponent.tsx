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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import type {
  ColumnDef,
} from "@tanstack/react-table";
import { useAuth } from "../ContextAPI/AuthContext";
import { Menu } from "lucide-react";
import ApprovalPanel from "./ApprovalPanel";
 
 
interface ApprovalData {
  id: number;
  NominationID: number;
  entity: string;
  NominatedBy: string;
  SubmittedDate: string;
  Status: "Pending" | "Approved" | "Rejected";
  AwardCategory: string;
  TotalRowCount: number;
  ContestType: string;
  Nominee: string | null;
  Tenant: string | null;
 
}
interface ApprovalView {
  NominationID: number;
  nominee: string | null;
  entity: string | null;
  contest: string | null;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
}
const apiUrl = import.meta.env.VITE_API_URL;
 
 
const statusColors: Record<ApprovalData["Status"], string> = {
  Pending: "bg-orange-100 text-orange-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};
 
const ApprovalTable: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
const [selectedNomination, setSelectedNomination] = useState<ApprovalView | null>(null);
  const [data, setData] = useState<ApprovalData[]>([]);
   //const [reject, setRejectData] = useState<ApprovalView[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const {  authToken } = useAuth();
 
  useEffect(() => {
    const fetchApprovals = async () => {
      try {
     
        if (!authToken) throw new Error("No auth token found");
 
        const res = await axios.get(`${apiUrl}/api/managerevaluation`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
 
        setData(res.data);
        console.log("Approval", res.data)
 
        // const rejectapproval = await axios.delete(`${apiUrl}/api/managerevaluation/${item.NominationID}`, {
        //   headers: { Authorization: `Bearer ${authToken}` },
        // });
 
        // setRejectData(rejectapproval.data);
        // console.log("Approval", rejectapproval.data)
       
      } catch (err) {
        console.error("❌ Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };
 
    fetchApprovals();
  }, []);
 
  const columns = useMemo<ColumnDef<ApprovalData>[]>(
    () => [
     
      { accessorKey: "NominationID", header: "Nomination ID" },
      { accessorKey: "Nominee", header: "Nominee Name" },
      { accessorKey: "Tenant", header: "Entity Name" },
      { accessorKey: "ContestType", header: "Contest Type" },
      { accessorKey: "SubmittedDate", header: "Submitted Date" },
     
      {
        accessorKey: "Status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() as ApprovalData["Status"];
          const colorClass = statusColors[status] || "bg-gray-100 text-gray-700";
          return (
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}
            >
              {status}
            </span>
          );
        },
     
     },
   
     {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const item = row.original;
 
          const handleView = () => {
            setSelectedNomination({
              NominationID: item.NominationID,
              nominee: item.Nominee,
              entity: item.Tenant,
              contest: item.ContestType,
              date: item.SubmittedDate,
              status: item.Status,
            });
 
          setIsPanelOpen(true);
        };
 
          const handleApprove = () => {};
          const handleReject = () => {};
          // const handleReject = async () => {
          //     try {
          //       await axios.delete(`${apiUrl}/api/managerevaluation/${item.NominationID}`, {
          //         headers: { Authorization: `Bearer ${authToken}` },
          //       });
 
          //       // Remove from main table data
          //       setData((prev) =>
          //         prev.filter((x) => x.NominationID !== item.NominationID)
          //       );
 
          //       console.log("❌ Nomination rejected & removed");
          //     } catch (error) {
          //       console.error("Error rejecting:", error);
          //     }
          //   };
 
 
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="p-2 rounded hover:bg-gray-100 transition"
                >
                  <Menu size={18} className="text-blue-600" />
                </button>
              </DropdownMenuTrigger>
 
              <DropdownMenuContent
                align="end"
                className="w-30 bg-white shadow-xl rounded-sm border-0"
              >
                <DropdownMenuItem
                  onClick={handleView}
                  className="hover:bg-blue-50 hover:text-blue-700 p-3 rounded-sm"
                >
                  View
                </DropdownMenuItem>
 
                <DropdownMenuItem
                  onClick={handleApprove}
                  className="hover:bg-green-50 hover:text-green-700 p-3 rounded-sm"
                >
                  Approve
                </DropdownMenuItem>
 
                <DropdownMenuItem
                  onClick={handleReject}
                  className="hover:bg-red-50 hover:text-red-700 p-3 rounded-sm"
                >
                 
                  Reject
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }
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
    return <div className="text-center py-6 text-gray-600">Loading approvals...</div>;
  }
 
  return (
    <div className="p-6">
     
 
      {/* 🧾 Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg p-6">
 
        {/* 🔍 Global Search */}
      <div className="mb-4 flex justify-between items-center">
        <input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search Approvals..."
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
                  No approvals found
                </td>
              </tr>
            )}
          </tbody>
        </table>
 
 
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
<ApprovalPanel
  isOpen={isPanelOpen}
  onClose={() => setIsPanelOpen(false)}
  nomination={selectedNomination}
/>
 
    </div>
  );
};
 
export default ApprovalTable;
 