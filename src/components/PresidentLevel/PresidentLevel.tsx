import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  //ColumnDef,
} from "@tanstack/react-table";
import type {
  ColumnDef,
} from "@tanstack/react-table";
import { Menu } from "lucide-react";
import { useAuth } from "../ContextAPI/AuthContext";
import { ColorBadge } from "../TenantBadges";
import { useNavigate } from "react-router-dom";
import PresidentSidePanel from "./PresidentSidePanel";

export interface PresidentLevelNominee {
  id: number;
  NominationID: number;
  Nominee: string;
  Tenant: string;
  CategoryName: string;
  NominatedBy: string;
  ConsolidatedAvgScore: number;
  PresidentScore: number;
}

const apiUrl = import.meta.env.VITE_API_URL;

const PresidentLevel: React.FC = () => {
  const { authToken } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<PresidentLevelNominee[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!authToken) return;

        const res = await axios.get(
          `${apiUrl}/api/presidentevaluation`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );

        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = useMemo<ColumnDef<PresidentLevelNominee>[]>(
    () => [
      { accessorKey: "Nominee", header: "Nominee" },
      {
        accessorKey: "Tenant",
        header: "Entity Name",
        cell: ({ getValue }) => (
          <ColorBadge label={getValue() as string} />
        ),
      },
      { accessorKey: "CategoryName", header: "Category" },
      { accessorKey: "NominatedBy", header: "Nominated By" },
      
      
      {
            accessorKey: "ConsolidatedAvgScore",
            header: () => <div className="text-center">Consolidated Avg Score</div>,
            cell: ({ getValue }) => (
              <div className="text-center">
                {getValue() as number}
              </div>
            ),
          },
        {
          accessorKey: "PresidentScore",
          header: () => <div className="text-center">President Score</div>,
          cell: ({ getValue }) => (
            <div className="text-center">
              {getValue() as number}
            </div>
          ),
        },
      {
        header: "Actions",
        cell: ({ row }) => (
          <button
            onClick={() =>
              navigate(`/nomination-detail/${row.original.NominationID}`, {
                state: { from: "president-level" },
              })
            }
            className="p-2 rounded hover:bg-gray-100 transition"
             title="View Details"
          >
            <Menu size={18} className="text-blue-600" />
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
    return <div className="text-center py-6">Loading...</div>;
  }

  return (
    <div className="p-6 m-5 bg-white rounded-xl shadow-md">
      {/* 🔹 Header */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          President Level Evaluations
        </h2>

        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
          className="border border-gray-300 rounded-md px-4 py-2 w-1/3 text-sm"
        />
      </div>

      {/* 🔹 Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {table.getHeaderGroups()[0].headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-600"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-2 text-sm text-gray-800"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
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
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
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

      <PresidentSidePanel isOpen={false} nominee={null} onClose={() => {}} />
    </div>
  );
};

export default PresidentLevel;
