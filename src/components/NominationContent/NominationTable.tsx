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
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../ContextAPI/AuthContext";
import NominationDetailsModal from "./NominationDetailsModal";

interface Nomination {
  TotalRowCount: number;
  NominationID: number;
  Nominee: string;
  ManagerName:string;
  Tenant: string;
  NominatedBy: string;
  NominationCycleName: string;
  AwardCategory: string;
  Descriptions: string;
  ContestType:string;
  SubmittedDate:string;
  SelfNomination: string;
  NominationFile: string | null;
  ManagerEmailID:string;
  Status: "Pending" | "Approved" | "Rejected" | "Under Review";
  "Referrals ID": {
    Email: string;
    TenantName: string;
    DeptName: string;
    ReferralName:string;
  }[];

  "Supporting Documents": {
    OriginalFileName: string;
    FileType: string;
    FileNameGUID: string;
    FilePath: string;
  }[];
  //"Referrals ID": { Email: string }[];
}

const apiUrl = import.meta.env.VITE_API_URL;

const NominationTable: React.FC = () => {
  const [data, setData] = useState<Nomination[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNomination, setSelectedNomination] = useState<Nomination | null>(null);

  const { authToken, userId } = useAuth();

  const statusColors: Record<Nomination["Status"], string> = {
  Pending: "bg-orange-100 text-orange-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
  "Under Review": "bg-yellow-100 text-yellow-700",
};

  useEffect(() => {
    const fetchNominations = async () => {
      try {
        // const res = await axios.get(`${apiUrl}/api/nominations/${userId}`, {
        //   headers: { Authorization: `Bearer ${authToken}` },
        // });
         const res = await axios.get(`${apiUrl}/api/nominationsbyuser`, {
          params: {
            userID: userId,
            NominatedBy: 0,
          },
          headers: { Authorization: `Bearer ${authToken}`,},
        });
        setData(res.data);
        console.log("Nomination Table", res.data)
      } catch (err) {
        console.error("❌ Error fetching nominations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNominations();
  }, [authToken, userId]);

  const columns = useMemo<ColumnDef<Nomination>[]>(
    () => [
      { accessorKey: "NominationID", header: "Nomination ID" },
      { accessorKey: "Nominee", header: "Nominee" },
      { accessorKey: "Tenant", header: "Entity" },
      { accessorKey: "AwardCategory", header: "Category" },
      
      {
        accessorKey: "Status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() as Nomination["Status"];
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
      // {
      //   accessorKey: "NominationFile",
      //   header: "Nomination File",
      //   cell: (info) =>
      //     info.getValue() ? (
      //       <a
      //         href={info.getValue() as string}
      //         target="_blank"
      //         rel="noopener noreferrer"
      //         className="text-blue-600 underline"
      //       >
      //         View File
      //       </a>
      //     ) : (
      //       <span className="text-gray-400">No File</span>
      //     ),
      // },
      {
        header: "Actions",
        cell: ({ row }) => (
          <button
            onClick={() => {
              setSelectedNomination(row.original);
              setModalOpen(true);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={16} className="text-gray-600" />
          </button>
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
    return <div className="text-center py-6 text-gray-600">Loading nominations...</div>;
  }
  const referralEmails: string[] =
  selectedNomination?.["Referrals ID"]?.map((r) => r.Email) || [];
  return (
    <>
      <div className="p-6">
        {/* 🔍 Global Search */}
        <div className="mb-4 flex justify-between items-center">
          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search nominations..."
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
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600  cursor-pointer select-none"
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
                    No nominations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 📄 Pagination */}
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

      {/* 🔍 Modal */}
      {selectedNomination && (
        <NominationDetailsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          // data={selectedNomination}
            data={{
      nominationId: selectedNomination.NominationID.toString(),
      nominee: selectedNomination.Nominee,
      entity: selectedNomination.Tenant,
      category: selectedNomination.AwardCategory,
      nominatedBy: selectedNomination.NominatedBy,
      submissionDate: selectedNomination.SubmittedDate, // or actual date if available
      contestType: selectedNomination.ContestType,
      status: selectedNomination.Status,  
      managerEmail: selectedNomination.ManagerName,
      referrals: referralEmails,
      description: selectedNomination.Descriptions,
      managerEmailID: selectedNomination.ManagerEmailID,
      "Referrals ID": selectedNomination["Referrals ID"],
      "Supporting Documents": selectedNomination["Supporting Documents"],
    }}
        />
      )}

      <Outlet />
    </>
  );
};

export default NominationTable;
