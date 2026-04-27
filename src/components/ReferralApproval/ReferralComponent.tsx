import React, { useRef, useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useAuth } from "../ContextAPI/AuthContext";
// Correct Component Import
import { useNavigate } from "react-router-dom";
// Components
import { ColorBadge } from "../TenantBadges";
import Pagination from "../Pagination";
import StatusFlow from "../CommonStatusFlow"; 
import { ChevronDown, ChevronUp, Menu } from "lucide-react";
import { levelColors, levelTextColors } from "../../statusColors.ts";
import ProgressSidePanel from "../ProgressSidePanel";
import{getReferralEvaluations}from "../../services/nominationService";

interface ReferralData {
  id: number;
  NominationID: number;
  ReferralID: number;
  ReferralUserID:number;
  entity: string;
  NominatedBy: string;
  SubmittedDate: string;
  Status: "Pending" | "Approved" | "Rejected";
  AwardCategory: string;
  TotalRowCount: number;
  ContestType: string;
  Nominee: string | null;
  Tenant: string | null;
  ManagerEmailID: string;
  ManagerName: string;
  Descriptions: string;
  Comments: string | null;
  Levels:string;

 // "Referrals ID": { Email: string }[];
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
   "ApprovalStatus": {
  Status: string;
  ApprovalType: string;
  }[];
  BusinessJuryStatus: string;
}

// interface ReferralView extends ReferralData {}
// const apiUrl = import.meta.env.VITE_API_URL;

const ReferralTable: React.FC = () => {
  const [data, setData] = useState<ReferralData[]>([]);
  const [_resvalue, _setApproveData] = useState<ReferralData[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const { userId, authToken } = useAuth();
  const navigate = useNavigate();
  const [_flagReason, _setFlagReason] = useState<Record<number, string>>({});
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const tableWrapperRef = useRef<HTMLDivElement | null>(null);
  const [isLevelPanelOpen, setIsLevelPanelOpen] = useState(false);
  const [selectedLevelRow, setSelectedLevelRow] = useState<ReferralData | null>(null);
   const [totalCount, setTotalCount] = useState(0); 
  
  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        if (!authToken) throw new Error("No auth token found");

        // const res = await axios.get(`${apiUrl}/api/referralvaluations/${userId}`, {
        //   headers: { Authorization: `Bearer ${authToken}` },
        // });
        const res = await getReferralEvaluations(Number(userId));
         //setTotalCount(res.data[0]?.TotalCount || 0);
        setTotalCount(res.data.length);
         setData(res.data);
       
      } catch (err) {
        console.error("❌ Error fetching approvals:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApprovals();
    setExpandedRow(null);
  }, []);
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
  

  const columns = useMemo<ColumnDef<ReferralData>[]>(() => {
    return [
      // { accessorKey: "NominationID", header: "Nomination ID" },
      { accessorKey: "Nominee", header: "Nominee" },
      {
        accessorKey: "Tenant",
        header: "Entity",
        cell: ({ getValue }) => {
          const tenant = getValue() as string;
          return <ColorBadge label={tenant} />;
        },
      },
       { accessorKey: "NominatedBy", header: "Nominated By" },
      // { accessorKey: "AwardCategory", header: "AwardCategory" },
     // { accessorKey: "Tenant", header: "Entity Name" },
      { accessorKey: "SubmittedDate", header: "Submitted Date" },
       {
              id: "Levels",
              header: "Level",
              cell: ({ row }) => {
                const level = row.original.Levels; 
                const levelStyles: Record<string, string> = {
                  "Level-1":
                    "bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100",
                  "Level-2":
                    "bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100",
                  "Level-3":
                    "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100",
                };
                return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLevelRow(row.original);
                      setIsLevelPanelOpen(true);
                    }}
                    className={`w-20 h-8 text-xs font-semibold rounded-md flex items-center justify-center
                      ${levelStyles[level] || "bg-gray-100 text-gray-600 border"}
                    `}>
                    {level?.replace("-", " ")}
                  </button>
                );
              },
            },
          {
              accessorKey: "Status",
              header: "Status",
              cell: ({ getValue }) => {
                const status = getValue() as string;
                const cleanStatus = status?.includes("-")
                  ? status.substring(status.indexOf("-") + 1).trim()
                  : status?.trim();
                const bgClass = levelColors[cleanStatus] || "bg-gray-100 border-gray-300";
                const textClass = levelTextColors[cleanStatus] || "text-gray-700";
      
                return (
                  <span
                    className={`inline-flex items-center px-3 py-1 text-sm font-medium border rounded ${bgClass} ${textClass}`} >
                    {cleanStatus}
                  </span>
                );
              },
            },       
        {
           header: "Actions",
                  cell: ({ row }) => {
                    const handleDetailsView = (item: ReferralData) => {
                  navigate(`/businessjury-detail/${item.NominationID}`, {
                    state: { from: "referral-approval" }
                  });
                };
                    return (
                      <button
                        onClick={() => handleDetailsView(row.original)}
                        className="p-2 rounded hover:bg-gray-100 transition"
                         title="View Details">
                        <Menu size={18} className="text-blue-600" />
                      </button>
                    );
                  },
                },
    ];},[]);

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
    return <div className="text-center py-6 text-gray-600">Loading...</div>;
  }

  return (
    <div>
      <div className="p-6">
        <div className="overflow-x-auto bg-white shadow-md rounded-lg p-6">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold ">Nominations with your referral</h2>
            <input
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search..."
              className="border border-gray-300 rounded-md px-4 py-2 w-1/3 text-sm"
            />
          </div>
        <div ref={tableWrapperRef}>
           <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr onClick={(e) => e.stopPropagation()} key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-4 py-3 text-left text-sm font-semibold uppercase cursor-pointer select-none">
                  <span className="flex items-center gap-1">

                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === "asc" && <ChevronUp size={14}/>}
                    {header.column.getIsSorted() === "desc" && <ChevronDown size={14}/>}
                  </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

           <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-6 text-center text-gray-500 text-sm"
                  >
                    No data found
                  </td>
                </tr>
              ) : (
              table.getRowModel().rows.map((row) => {
                const item = row.original as any;
                const isExpanded = expandedRow === item.NominationID;
                return (
                  <React.Fragment key={row.id}>
                    <tr className="hover:bg-gray-50">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-2 text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  {isExpanded && (
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
              })
              )}
            </tbody>  
          </table>
          <Pagination  table={table}  totalCount={ globalFilter  ? table.getFilteredRowModel().rows.length : totalCount }  />
        </div>
       </div>
      </div>
      <ProgressSidePanel
          isOpen={isLevelPanelOpen}
          data={selectedLevelRow}
          onClose={() => {
            setIsLevelPanelOpen(false);
            setSelectedLevelRow(null);
          }}
        />
    </div>
  );
};

export default ReferralTable;
