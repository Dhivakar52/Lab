// PresidentUnit.tsx
import React, { useRef, useState, useEffect, useMemo } from "react";
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
import { ColorBadge } from "../TenantBadges";
import { useAuth } from "../ContextAPI/AuthContext";
import { useNavigate } from "react-router-dom";
import PresidentSidePanel from "./PresidentUnitPanel";
import Pagination from "../Pagination";
import StatusFlow from "../CommonStatusFlow"; 
import { ChevronDown, ChevronUp, Menu,Flag } from "lucide-react";
import { levelColors, levelTextColors } from "../../statusColors.ts";

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
type ExpandedRow = {
  id: number;
  type: "flag" | "status";
} | null;
const apiUrl = import.meta.env.VITE_API_URL;

const PresidentUnit: React.FC = () => {
  const { authToken, userId } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<GeneralJury[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [flagReason, setFlagReason] = useState<Record<number, string>>({});
  const [expandedRow, setExpandedRow] = useState<ExpandedRow>(null);
  const tableWrapperRef = useRef<HTMLDivElement | null>(null);
  
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
    setExpandedRow(null);
  }, [authToken, userId]);
   useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!tableWrapperRef.current) return;
  
      const target = event.target as HTMLElement;
  
      if (tableWrapperRef.current.contains(target)) return;
  
      setExpandedRow(null);
    };
  
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
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
          header: () => <div className="text-center pr-4">Score</div>,
          cell: ({ getValue }) => (
            <div className="text-center pr-4">
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
                    onClick={(e) =>{ e.stopPropagation(); handleStatusClick(row.original);}}
                    className="px-3 py-1 text-sm font-medium flex-1 text-left">
                    {status}
                  </button>
                  <span className="w-px self-stretch bg-current opacity-30" />
                  <button
                    onClick={(e) =>{ e.stopPropagation(); handleStatusClick(row.original);}}
                    className="px-2 flex items-center justify-center" >
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
                    onClick={(e) =>{ e.stopPropagation(); handleFlagClick(item);}}
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
    ],[navigate,expandedRow]);

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
  useEffect(() => {
      setExpandedRow(null);
    }, [table.getState().pagination.pageIndex]);
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
       <div ref={tableWrapperRef}>
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr onClick={(e) => e.stopPropagation()} key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-3 text-left text-sm font-semibold uppercase cursor-pointer select-none"
                  >
                  <span className="flex items-center gap-1">

                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getIsSorted() === "asc" && <ChevronUp size={14}/>}
                    {header.column.getIsSorted() === "desc" && <ChevronDown size={14}/>}
                        </span>
                  </th>
                ))}
              </tr>
            ))}
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

        {/* Pagination */}
       <Pagination table={table} />
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
