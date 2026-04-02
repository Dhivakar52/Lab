import React, { useRef, useState, useEffect, useMemo } from "react";
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
import { useAuth } from "../ContextAPI/AuthContext";
import { ColorBadge } from "../TenantBadges";
import { useNavigate } from "react-router-dom";
import PresidentSidePanel from "./PresidentSidePanel";
import Pagination from "../Pagination";
import StatusFlow from "../CommonStatusFlow"; 
import { Flag } from "lucide-react";
import { ChevronDown, ChevronUp, Menu } from "lucide-react";
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
  const tableWrapperRef = useRef<HTMLDivElement | null>(null);
   const [totalCount, setTotalCount] = useState(0); 
  const [tenants, setTenants] = useState<string[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>("All");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

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
        //setTotalCount(res.data[0]?.TotalCount || 0);
        setTotalCount(res.data.length);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    setExpandedRow(null);
  }, []);

      useEffect(() => {
      if (data.length > 0) {
        const uniqueTenants = Array.from(
          new Set(data.map((item) => item.Tenant))
        );
        setTenants(["All", ...uniqueTenants]);
      }
    }, [data]);

    useEffect(() => {
      if (data.length > 0) {
        const uniqueCategories = Array.from(
          new Set(data.map((item) => item.CategoryName))
        );
        setCategories(["All", ...uniqueCategories]);
      }
    }, [data]);

      const filteredData = useMemo(() => {
        return data.filter((item) => {
          const tenantMatch =
            selectedTenant === "All" || item.Tenant === selectedTenant;

          const categoryMatch =
            selectedCategory === "All" ||
            item.CategoryName === selectedCategory;

          return tenantMatch && categoryMatch;
        });
      }, [data, selectedTenant, selectedCategory]);

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
  

  const columns = useMemo<ColumnDef<PresidentLevelNominee>[]>(
    () => [
      { accessorKey: "Nominee", header: "Nominee" ,size: 150},
      {
        accessorKey: "Tenant",
        header: "Entity",
        size: 180,
        cell: ({ getValue }) => (
          <div className="whitespace-nowrap">
          <ColorBadge label={getValue() as string} />
          </div>
        ),
        
      },
      { accessorKey: "CategoryName", header: "Category", size: 220},
      // { accessorKey: "NominatedBy", header: "Nominated By" },
      { accessorKey: "LikesCount", header: "Likes" },
        { accessorKey: "CommentsCount", header: "Comments" },
        { accessorKey: "referralsCount", header: "Referrals" },
        { accessorKey: "FlagsCount", header: "Flags" },
      {
        accessorKey: "AvgBusinessJuryScore",
       header:"Consolidated Avg Score",
        cell: ({ getValue }) => {
          const value = getValue() as number | null | undefined;
          return (
            <div >
                {value ?? ""}
            </div>
          );
        },
      },
      {
        accessorKey: "PresidentScore",
        header: "Grand Jury Score",
        cell: ({ getValue }) => {
          const value = getValue() as number | null | undefined;
          return (
            <div >
              
                {value ?? ""}
              
            </div>
          );
        },
      },
     
       {
            header: "Actions",
            cell: ({ row }) => {
              const item = row.original;
              const handleDetailsView = (item: PresidentLevelNominee) => {
            navigate(`/businessjury-detail/${item.NominationID}`, {
              state: { from: "president-level" }
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
    ],[expandedRow]);

  const table = useReactTable({
      data: filteredData,
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
    return <div className="text-center py-6">Loading...</div>;
  }

  return (
    <div className="p-6 m-5 bg-white rounded-xl shadow-md">
      {/* 🔹 Header */}
      <div className="flex justify-between items-start gap-4 mb-4 flex-wrap">
        {/* <h2 className="text-xl font-semibold">
          President Evaluation
        </h2> */}

        <div className="flex flex-wrap gap-2 max-w-[60%] flex-grow">
            {tenants.map((tenant) => (
              <button
                key={tenant}
                onClick={() => setSelectedTenant(tenant)}
                className={`px-1 py-1 rounded-md transition
                  ${selectedTenant === tenant ? "opacity-100" : "opacity-70 hover:opacity-100"}
                `}
              >
                {tenant === "All" ? (
                  <span className="px-3 py-1 rounded-md text-xs font-semibold border ">All</span>
                ) : (
                  <ColorBadge label={tenant} />
                )}
              </button>
            ))}
        </div>
         <div className="flex gap-3 items-center flex-shrink-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
         <input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search..."
              className="border border-gray-300 rounded-md px-4 py-2 text-sm w-64 min-w-[200px]"
            />
        </div>
      </div>

      {/* 🔹 Table */}
      <div ref={tableWrapperRef} className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr onClick={(e) => e.stopPropagation()}>
              {table.getHeaderGroups()[0].headers.map((header) => (
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
        <Pagination  table={table}  totalCount={ globalFilter  ? table.getFilteredRowModel().rows.length : totalCount }  />
      <PresidentSidePanel isOpen={false} nominee={null} onClose={() => {}} />
    </div>
  );
};

export default PresidentLevel;
