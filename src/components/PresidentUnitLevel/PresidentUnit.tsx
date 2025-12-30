// PresidentUnit.tsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Menu } from "lucide-react";
import { ColorBadge } from "../TenantBadges";
import { useAuth } from "../ContextAPI/AuthContext";
import { useNavigate } from "react-router-dom";
import PresidentSidePanel from "./PresidentUnitPanel";

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
  Active: boolean;
  SubmittedBy: number;
  Status: "Approved" | "Rejected" | "Pending" | string;

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

const PresidentUnit: React.FC = () => {
  const { authToken, userId } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<GeneralJury[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");

   const statusColors: Record<GeneralJury["Status"], string> = {
    Pending: "bg-orange-100 text-orange-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
  };

  useEffect(() => {
    const fetchGeneralJury = async () => {
      try {
        if (!authToken) throw new Error("No auth token");

        const res = await axios.get(
          `${apiUrl}/api/generaljuryevaluation/${userId}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );

        setData(res.data);
      } catch (err) {
        console.error("❌ Error fetching president unit data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGeneralJury();
  }, [authToken, userId]);

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
     
      {
          accessorKey: "GeneralJuryScore",
          header: () => <div className="text-center">Score</div>,
          cell: ({ getValue }) => (
            <div className="text-center">
              {getValue() as number}
            </div>
          ),
        },
        {
                accessorKey: "Status",
                header: "Status",
                cell: ({ getValue }) => {
                  const status = getValue() as GeneralJury["Status"];
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
      //   header: "Actions",
      //   cell: ({ row }) => {
      //     const item = row.original;

      //     const handleDetailsView = () => {
      //       navigate(`/nomination-detail/${item.NominationID}`, {
      //         state: { from: "president-unit" },
      //       });
      //     };

      //     return (
      //       <DropdownMenu>
      //         <DropdownMenuTrigger asChild>
      //           <button className="p-2 rounded hover:bg-gray-100 transition">
      //             <Menu size={18} className="text-blue-600" />
      //           </button>
      //         </DropdownMenuTrigger>

      //         <DropdownMenuContent
      //           align="end"
      //           className="w-30 bg-white shadow-xl rounded-sm"
      //         >
      //           <DropdownMenuItem
      //             onClick={handleDetailsView}
      //             className="hover:bg-blue-50 hover:text-blue-700 p-3"
      //           >
      //             View
      //           </DropdownMenuItem>
      //         </DropdownMenuContent>
      //       </DropdownMenu>
      //     );
      //   },
      // },
      {
          header: "Actions",
          cell: ({ row }) => {
            const item = row.original;

            const handleDetailsView = () => {
              navigate(`/nomination-detail/${item.NominationID}`, {
                state: { from: "president-unit" },
              });
            };

            return (
              <button
                onClick={handleDetailsView}
                className="p-2 rounded hover:bg-gray-100 transition"
                title="View Details"
              >
                <Menu size={18} className="text-blue-600" />
              </button>
            );
          },
        },

     
    ],
    [navigate]
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
    <div className="p-6">
      <div className="overflow-x-auto bg-white shadow-md rounded-lg p-6">
        {/* Header */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            President Unit Evaluations
          </h2>

          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search..."
            className="border border-gray-300 rounded-md px-4 py-2 w-1/3 text-sm"
          />
        </div>

        {/* Table */}
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getIsSorted() === "asc" && " 🔼"}
                    {header.column.getIsSorted() === "desc" && " 🔽"}
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
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-gray-800"
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
                  No President Unit Evaluation found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
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
      </div>

      {/* <PresidentSidePanel
        nominee={selectedNominee}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      /> */}
    </div>
  );
};

export default PresidentUnit;
