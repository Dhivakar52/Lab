// PresidentUnit.tsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ColorBadge } from "../TenantBadges";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, XCircle, Clock, Menu } from "lucide-react";
import PresidentSidePanel from "./PresidentUnitPanel";
import { useAuth } from "../ContextAPI/AuthContext";

interface SupportingDocument {
  OriginalFileName: string;
  FileType: string;
  FileNameGUID: string;
  FilePath: string;
}

export interface GeneralJury {
  TotalRowCount: number;
  JuryApprovalsID: number;
  GeneralJuryID: number;
  NominationID: number;
  IsGeneralJuryApproved: boolean;
  GeneralJuryComments: string;
  Nominee: string;
  NominatedBy: string;
  Tenant: string;
  CategoryName: string;
  SubmittedOn: string;
  BusinessJuryRemarks: string;
  GeneralJuryScore: number;
  GeneralJuryRemarks: string;
  Active: boolean;
  SubmittedBy: number;
  Status: "Approved" | "Rejected" | "Pending" | string;
  ConsolidatedAvgScore?: number;
  FinalStatus?: "Winner" | "Runner-up" | string;

  ApprovalStatus: {
    ApprovalType: string;
    Status: string;
  }[];

  "Supporting Documents": {
    OriginalFileName: string;
    FileType: string;
    FileNameGUID: string;
    FilePath: string;
  }[];
}


const apiUrl = import.meta.env.VITE_API_URL;

const statusBadgeColors: Record<string, string> = {
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
  Pending: "bg-orange-100 text-orange-800",
};

const PresidentUnit: React.FC = () => {
  const [selectedNominee, setSelectedNominee] = useState<GeneralJury | null>(null);
  const [data, setData] = useState<GeneralJury[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const { authToken, userId } = useAuth();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");


  useEffect(() => {
    const fetchGeneralJury = async () => {
      try {
        if (!authToken) throw new Error("No auth token found");

        const res = await axios.get(`${apiUrl}/api/generaljuryevaluation/${userId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        setData(res.data);
      } catch (err) {
        console.error("❌ Error fetching nominees:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGeneralJury();
  }, [authToken, userId]);

debugger
  const columns = useMemo<ColumnDef<GeneralJury>[]>(
    () => [
      { accessorKey: "Nominee", header: "Nominee" },
      
      {
        accessorKey: "Tenant",
        header: "Entity Name",
        cell: ({ getValue }) => {
          const tenant = getValue() as string;
          return <ColorBadge label={tenant} />;
        },
      },
     
      { accessorKey: "CategoryName", header: "Category" },
      { accessorKey: "NominatedBy", header: "Nominated By" },         
      { accessorKey: "GeneralJuryScore", header: "Score" },
      {
        accessorKey: "Status",
        header: "Flag",
        cell: ({ getValue }) => {
          const flag = getValue<string>();
          if (flag === "Approved")
            return <CheckCircle className="text-green-500 w-5 h-5" />;
          if (flag === "Rejected")
            return <XCircle className="text-red-500 w-5 h-5" />;
          return <Clock className="text-yellow-500 w-5 h-5" />;
        },
      },
      {
        accessorKey: "Status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue<string>();
          const cls = statusBadgeColors[status] ?? "bg-gray-100 text-gray-800";
          return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${cls}`}>
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

    return (
      <button
        onClick={() => {
          setSelectedNominee(item);
          setIsPanelOpen(true);
        }}
        className="p-2 rounded hover:bg-gray-100"
      >
        <Menu className="w-5 h-5 text-blue-500" />
      </button>
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

  if (loading)
    return <div className="text-center py-6 text-gray-600">Loading President Level Evaluation...</div>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-md relative">

      {successMessage && (
        <div
          className={`fixed right-5 px-4 py-2 rounded-lg shadow-lg animate-slide-in z-[9999] ${
            toastType === "success" ? "bg-green-600" : "bg-red-600"
          } text-white`}
        >
          {successMessage}
        </div>
      )}

      <div className="mb-4 flex justify-between items-center">
        <input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
          className="border border-gray-300 rounded-md px-4 py-2 w-1/3 text-sm"
        />
      </div>

     
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse table-auto">
          <thead className="bg-gray-100 text-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-3 text-left cursor-pointer"
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
                    <td key={cell.id} className="px-6 py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-6 text-gray-500">
                  No President Unit Evaluation found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      
      <div className="flex justify-between mt-4">
        <div className="text-sm">Page {table.getState().pagination.pageIndex + 1}</div>
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

     
      <PresidentSidePanel
        nominee={selectedNominee}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
};

export default PresidentUnit;
