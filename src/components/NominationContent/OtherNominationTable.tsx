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
// import NominationDetailsModal from "./NominationDetailsModal";

interface Nomination {
  TotalRowCount: number;
  NominationID: number;
  Nominee: string;
  Tenant: string;
  NominatedBy: string;
  NominationCycleName: string;
  AwardCategory: string;
  Description: string;
  SelfNomination: string;
  NominationFile: string | null;
}

const apiUrl = import.meta.env.VITE_API_URL;

const NominationTable: React.FC = () => {
  const [data, setData] = useState<Nomination[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNomination, setSelectedNomination] = useState<Nomination | null>(null);

  const { authToken, userId } = useAuth();

  useEffect(() => {
    const fetchNominations = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/nominations`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setData(res.data);
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
      { accessorKey: "Tenant", header: "Tenant" },
      { accessorKey: "NominationCycleName", header: "Cycle Name" },
      { accessorKey: "AwardCategory", header: "Category" },
      { accessorKey: "NominatedBy", header: "Nominated By" },
      { accessorKey: "SelfNomination", header: "Self Nomination" },
      {
        accessorKey: "NominationFile",
        header: "Nomination File",
        cell: (info) =>
          info.getValue() ? (
            <a
              href={info.getValue() as string}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View File
            </a>
          ) : (
            <span className="text-gray-400">No File</span>
          ),
      },
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
      {/* {selectedNomination && (
        <NominationDetailsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          data={selectedNomination}
        />
      )} */}

      <Outlet />
    </>
  );
};

export default NominationTable;
