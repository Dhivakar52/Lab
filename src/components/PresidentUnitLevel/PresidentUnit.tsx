// PresidentUnit.tsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
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

export interface Nominee {
  TotalRowCount: number;
  NominationID: number;
  Nominee: string;
  Tenant: string;
  CategoryName: string;
  SubmittedOn: string;              // "Submitted On"
  BusinessJuryRemarks: string;      // "BusinessJury Remarks"
  Score: number;
  GeneralJuryRemarks: string;       // "GeneralJury Remarks"
  Status: "Approved" | "Rejected" | "Pending" | string;
  ConsolidatedAvgScore?: number;
  FinalStatus?: "Winner" | "Runner-up" | string;
  SupportingDocuments: SupportingDocument[] | null; // "Supporting Documents"
}

const apiUrl = import.meta.env.VITE_API_URL;

const statusBadgeColors: Record<string, string> = {
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
  Pending: "bg-orange-100 text-orange-800",
};

const PresidentUnit: React.FC = () => {
  const [selectedNominee, setSelectedNominee] = useState<Nominee | null>(null);
  const [data, setData] = useState<Nominee[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const { authToken, userId } = useAuth();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // ------------------------------------------------------------
  // 📌 FETCH API
  // ------------------------------------------------------------
  useEffect(() => {
    const fetchNominee = async () => {
      try {
        if (!authToken) throw new Error("No auth token found");

        const res = await axios.get(`${apiUrl}/api/generaljuryevaluation`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        // 🔥 IMPORTANT: map API fields with spaces → TS-friendly keys
        const formatted: Nominee[] = res.data.map((item: any) => ({
          TotalRowCount: item.TotalRowCount,
          NominationID: item.NominationID,
          Nominee: item.Nominee,
          Tenant: item.Tenant,
          CategoryName: item.CategoryName,
          SubmittedOn: item["Submitted On"] ?? "",
          BusinessJuryRemarks: item["BusinessJury Remarks"] ?? "",
          Score: item.Score,
          GeneralJuryRemarks: item["GeneralJury Remarks"] ?? "",
          Status: item.Status,
          ConsolidatedAvgScore: item.ConsolidatedAvgScore ?? 0,
          FinalStatus: item.FinalStatus ?? item.Status,
          SupportingDocuments: item["Supporting Documents"] ?? null,
        }));

        setData(formatted);
      } catch (err) {
        console.error("❌ Error fetching President Evaluation:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNominee();
  }, [authToken]);

  // ------------------------------------------------------------
  // 📌 Approve / Reject Handlers
  // ------------------------------------------------------------
  const handleApprove = async (nominationID: number) => {
    try {
      await axios.put(
        `${apiUrl}/api/generaljuryevaluation/${nominationID}`,
        {
          nominationID,
          isManagerApproved: true,
          approvalComments: "Approved",
          submittedBy: userId,
          active: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      setData((prev) =>
        prev.map((item) =>
          item.NominationID === nominationID
            ? { ...item, Status: "Approved" }
            : item
        )
      );

      setToastType("success");
      setSuccessMessage("Nominee approved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setIsPanelOpen(false);
    } catch (error) {
      console.error("Approve Error:", error);
      alert("Approval failed");
    }
  };

  const handleReject = async (nominationID: number) => {
    try {
      await axios.put(
        `${apiUrl}/api/generaljuryevaluation/${nominationID}`,
        {
          nominationID,
          isManagerApproved: false,
          approvalComments: "Rejected",
          submittedBy: userId,
          active: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      setData((prev) =>
        prev.map((item) =>
          item.NominationID === nominationID
            ? { ...item, Status: "Rejected" }
            : item
        )
      );

      setToastType("error");
      setSuccessMessage("Nominee rejected successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setIsPanelOpen(false);
    } catch (error) {
      console.error("Reject Error:", error);
      alert("Reject failed");
    }
  };

  // ------------------------------------------------------------
  // 📌 Table Columns
  // ------------------------------------------------------------
  const columns = useMemo<ColumnDef<Nominee>[]>(
    () => [
      { accessorKey: "Nominee", header: "Nominee" },
      { accessorKey: "Tenant", header: "Entity" },
      { accessorKey: "CategoryName", header: "Category" },
      { accessorKey: "ConsolidatedAvgScore", header: "Consolidated Avg Score" },
      { accessorKey: "Score", header: "President Score" },

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
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${cls}`}
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
          return (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger className="p-2 rounded hover:bg-gray-100">
                <Menu className="w-5 h-5 text-blue-500" />
              </DropdownMenu.Trigger>

              <DropdownMenu.Content className="bg-white shadow-md rounded-md p-2">
                <DropdownMenu.Item
                  onClick={() => {
                    setSelectedNominee(item);
                    setIsPanelOpen(true);
                  }}
                  className="px-2 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  View
                </DropdownMenu.Item>

             

              </DropdownMenu.Content>
            </DropdownMenu.Root>
          );
        },
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
    return (
      <div className="text-center py-6 text-gray-600">
        Loading President Level Evaluation...
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md relative">
      {/* Toast */}
      {successMessage && (
        <div
          className={`fixed right-5 px-4 py-2 rounded-lg shadow-lg animate-slide-in z-[9999]
            ${toastType === "success" ? "bg-green-600" : "bg-red-600"} text-white`}
        >
          {successMessage}
        </div>
      )}

      {/* Search */}
      <div className="mb-4 flex justify-between items-center">
        <input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
          className="border border-gray-300 rounded-md px-4 py-2 w-1/3 text-sm"
        />
      </div>

      {/* Table */}
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
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
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
                <td
                  colSpan={columns.length}
                  className="text-center py-6 text-gray-500"
                >
                  No President Unit Evaluation found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <div className="text-sm">
          Page {table.getState().pagination.pageIndex + 1}
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

      {/* Panel */}
      <PresidentSidePanel
        nomineeData={selectedNominee}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onApprove={() =>
          selectedNominee && handleApprove(selectedNominee.NominationID)
        }
        onReject={() =>
          selectedNominee && handleReject(selectedNominee.NominationID)
        }
      />
    </div>
  );
};

export default PresidentUnit;
