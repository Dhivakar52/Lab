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
import Pagination from "../Pagination";
import StatusFlow from "../CommonStatusFlow"; 
import { Flag } from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { levelColors, levelTextColors } from "../../statusColors.ts";

export interface PresidentLevelNominee {
  id: number;
  NominationID: number;
  Nominee: string;
  Tenant: string;
  CategoryName: string;
  NominatedBy: string;
  ConsolidatedAvgScore: number;
  PresidentScore: number;
  Status: "Approved" | "Rejected" | "Pending" | string;

}
type ExpandedRow = {
  id: number;
  type: "flag" | "status";
} | null;
const apiUrl = import.meta.env.VITE_API_URL;

const PresidentLevel: React.FC = () => {
  const { authToken } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<PresidentLevelNominee[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [flagReason, setFlagReason] = useState<Record<number, string>>({});
  const [expandedRow, setExpandedRow] = useState<ExpandedRow>(null);
  

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
    const handleFlagClick = (item: any) => {
    setExpandedRow(prev => {
      if (prev?.id === item.NominationID && prev?.type === "flag") {
        return null;
      }
      return { id: item.NominationID, type: "flag" };
    });
  };
  const handleStatusClick = (item: any) => {
    setExpandedRow(prev => {
      if (prev?.id === item.NominationID && prev?.type === "status") {
        return null;
      }
      return { id: item.NominationID, type: "status" };
    });
  };

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
            accessorKey: "Status",
            header: "Status",
            cell: ({ row, getValue }) => {
              const status = getValue() as string;
              const isOpen =
                expandedRow?.id === row.original.NominationID &&
                expandedRow?.type === "status";

              const bgClass = levelColors[status] || "bg-gray-100 border-gray-300";
              const textClass = levelTextColors[status] || "text-gray-700";

              return (
                <div
                  className={`inline-flex items-center border rounded overflow-hidden ${bgClass} ${textClass}`}>
                  <button
                    onClick={() => handleStatusClick(row.original)}
                    className="px-3 py-1 text-sm font-medium flex-1 text-left">
                    {status}
                  </button>
                  <span className="w-px self-stretch bg-current opacity-30" />
                  <button
                    onClick={() => handleStatusClick(row.original)}
                    className="px-2 flex items-center justify-center" >
                    {/* <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : "" }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2} >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg> */}
                   {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              );
            },
       },
       {
            header: "Flag",
            cell: ({ row }) => {
              const item = row.original as any;
              const flagStatus = Number(item.FlagStatus);
              if (flagStatus < 0) return null;
              if (flagStatus === 1) {
                  return (
                   <button
                    onClick={() => handleFlagClick(item)}
                    className="p-1" title="Flagged">
                   <Flag
                    size={18} className="text-red-600 fill-red-600" /></button>
                );
              }
                return (
                  <span className="text-green-600 text-xl leading-none"  title="Not Flagged">✔</span>
                );
              },
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
    ],[expandedRow]);

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
              {table.getRowModel().rows.map((row) => {
                const item = row.original as any;
                const isFlagExpanded =
                  expandedRow?.id === item.NominationID &&
                  expandedRow?.type === "flag";
                const isStatusExpanded =
                  expandedRow?.id === item.NominationID &&
                  expandedRow?.type === "status";

                return (
                  <React.Fragment key={row.id}>
                    <tr className="hover:bg-gray-50">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-2 text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  {isFlagExpanded && (
                    <tr className="bg-gray-50">
                      <td colSpan={columns.length} className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Flag size={18} className="text-red-600 fill-red-600" />
                          <span className="text-sm font-semibold text-red-700">
                            Reason For Flagging:
                          </span>
                          <span className="text-sm text-gray-700">
                            {flagReason[item.NominationID] || item.FlagReason}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                  {isStatusExpanded && (
                    <tr className="bg-gray-50">
                      <td colSpan={columns.length} className="px-2 py-2">
                        <StatusFlow
                          steps={(item.ApprovalStatus || []).map((a: any) => ({
                            type: a.ApprovalType,
                            status: a.Status,
                            level: a.ApprovalFlow,
                            approvedAt: a.ApprovedAt,
                          }))}
                        />
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                );
              })}
            </tbody>  
        </table>
      </div>

      {/* 🔹 Pagination */}
       <Pagination table={table} />
      <PresidentSidePanel isOpen={false} nominee={null} onClose={() => {}} />
    </div>
  );
};

export default PresidentLevel;
