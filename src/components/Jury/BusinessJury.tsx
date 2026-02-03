import React, { useRef,useState,useEffect,useMemo } from "react";
import {ChevronDown, ChevronUp, Menu,  } from "lucide-react";
import BusinessPanel from "./BusinessPanel"; 
import axios from "axios";
import { useAuth } from "../ContextAPI/AuthContext";
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
import { ColorBadge } from "../TenantBadges";
import { useNavigate } from "react-router-dom";
import Pagination from "../Pagination";
import StatusFlow from "../CommonStatusFlow"; 
import { Flag } from "lucide-react";
import { levelColors, levelTextColors } from "../../statusColors.ts";


export interface BusinessJury {
  id: number;
  JuryApprovalsID:number;
  BusinessJuryID:number;
  NominationID: number;
  TotalRowCount: number;
  //UserID: number;
  Nominee: string;
  Tenant: number;
  CategoryName: string;
  "Submitted On": string;
  BusinessJuryScore: number;
  BusinessJuryComments: string;
  Descriptions:string;
  NominatedBy:string;
  Designation:string;
  Department:string;
  ManagerUserName:string;
  Status: string; 
   "ApprovalStatus": {
   Status: string;
  ApprovalType: string;
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
//api/businessjuryevaluation

const apiUrl = import.meta.env.VITE_API_URL;

const BusinessJury: React.FC = () => {
  const { authToken, userId } = useAuth();
  const [data, setData] = useState<BusinessJury[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedNomination, setSelectedNomination] = useState<BusinessJury | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [flagReason, setFlagReason] = useState<Record<number, string>>({});
  const [expandedRow, setExpandedRow] = useState<ExpandedRow>(null);
  const tableWrapperRef = useRef<HTMLDivElement | null>(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
      const fetchBusinessJury = async () => {
      try {
        //const token = localStorage.getItem("authToken");
        if (!authToken) throw new Error("No auth token found");

        const res = await axios.get(`${apiUrl}/api/businessjuryevaluation/${userId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        
        setData(res.data);
      } catch (err) {
        console.error("❌ Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinessJury();
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
  const columns = useMemo<ColumnDef<BusinessJury>[]>(
      () => [
        //{ accessorKey: "Nomination", header: "Nomination" },
        { accessorKey: "Nominee", header: "Nomination" },
         {
               accessorKey: "Tenant",
               header: "Entity Name",
               cell: ({ getValue }) => {
                 const tenant = getValue() as string;
                 return <ColorBadge label={tenant} />;
               },
             },
        { accessorKey: "CategoryName", header: "Category Name" },
        { accessorKey: "NominatedBy", header: "Nominated By" },
       // { accessorKey: "BusinessJuryScore", header: "Score"},
         {
          accessorKey: "BusinessJuryScore",
          header: () => <div className="text-center">Score</div>,
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
              const handleDetailsView = (item: BusinessJury) => {
            navigate(`/businessjury-detail/${item.NominationID}`, {
              state: { from: "business-jury" }
            });
          };
              return (
                <button
                  onClick={() => handleDetailsView(row.original)}
                  className="p-2 rounded hover:bg-gray-100 transition"
                   title="View Details"
                >
                  <Menu size={18} className="text-blue-600" />
                </button>
              );
            },
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
  useEffect(() => {
      setExpandedRow(null);
    }, [table.getState().pagination.pageIndex]);
  if (loading) {
      return <div className="text-center py-6 text-gray-600">Loading...</div>;
    }

  return (
    <div className="p-6 m-5 bg-white rounded-xl shadow-md relative">
      
      {/* Table */}
      <div className="overflow-x-auto">
           <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold ">Business Jury Evaluations</h2>
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
            {table.getHeaderGroups().map(headerGroup => (
              <tr onClick={(e) => e.stopPropagation()} key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={`px-4 py-3 text-sm text-left text-gray-600 cursor-pointer select-none${
                      (header.column.columnDef.meta as any)?.className ?? ""
                    }`}
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
    <BusinessPanel
  isOpen={isPanelOpen}
  onClose={() => setIsPanelOpen(false)}
  nominee={selectedNomination}
/>    
    </div>
  );
};

export default BusinessJury;
