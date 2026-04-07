import React, { useRef, useEffect, useMemo, useState } from "react";
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
import { useAuth } from "../ContextAPI/AuthContext";
import { Menu } from "lucide-react";
import ApprovalPanel from "./ApprovalPanel";
import { ColorBadge } from "../TenantBadges";
import { useNavigate } from "react-router-dom";
import Pagination from "../Pagination";
 import StatusFlow from "../CommonStatusFlow"; 
import { Flag } from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { levelColors, levelTextColors } from "../../statusColors.ts";
import ProgressSidePanel from "../ProgressSidePanel";


interface ApprovalData {
  id: number;
  NominationID: number;
  entity: string;
  NominatedBy: string;
  SubmittedDate: string;
  Status: "Pending" | "Approved" | "Rejected";
  AwardCategory: string;
  TotalRowCount: number;
  ContestType: string;
  Department: string;
  Nominee: string | null;
  Tenant: string | null;
  ManagerEmailID: string;
  ApprovalComments?: string;
  ManagerName: string;
  Descriptions: string;
  Levels:string;
  "Referrals ID": {
    Email: string;
    TenantName: string;
    DeptName: string;
    ReferralName: string;
  }[];
  "Supporting Documents": {
    OriginalFileName: string;
    FileType: string;
    FileNameGUID: string;
    FilePath: string;
  }[];
  BusinessJuryStatus: string;
  "ApprovalStatus": {
  NominationID: number;
  Status: string;
  ApprovalType: string;
  ApprovalFlow:string;
  ApprovalComments:string;
  ApprovalName:string;
  ApprovalScore:string;
  ApprovedAt:string;
  }[];
}

interface ApprovalView {
  NominationID: number;
  nominee: string | null;
  entity: string | null;
  contest: string | null;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
  AwardCategory: string;
  NominatedBy: string;
  ManagerEmailID: string;
  ManagerName: string;
  "Referrals ID": {
    Email: string;
    TenantName: string;
    DeptName: string;
    ReferralName: string;
  }[];
  "Supporting Documents": {
    OriginalFileName: string;
    FileType: string;
    FileNameGUID: string;
    FilePath: string;
  }[];
  Descriptions: string;
  ApprovalComments: string;
  Department: string;
  BusinessJuryStatus: string;
   "ApprovalStatus": {
  Status: string;
  ApprovalType: string;
  }[];
}
type ExpandedRow = {
  id: number;
  type: "flag" | "status";
} | null;
const apiUrl = import.meta.env.VITE_API_URL;

const ApprovalTable: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedNomination, _setSelectedNomination] = useState<ApprovalView | null>(null);
  const [data, setData] = useState<ApprovalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const { userId, authToken } = useAuth();
  const [_successMessage, setSuccessMessage] = useState("");
  const [reason, setReason] = useState("");
  const [_toastType, setToastType] = useState<"success" | "error">("success");
  const [flagReason, setFlagReason] = useState<Record<number, string>>({});
  const [flagError, setFlagError] = useState<Record<number, string>>({});
  const [_expandedFlagRow, setExpandedFlagRow] = useState<number | null>(null);
  const [expandedRow, setExpandedRow] = useState<ExpandedRow>(null);
  const flagInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const tableWrapperRef = useRef<HTMLDivElement | null>(null);
  const [isLevelPanelOpen, setIsLevelPanelOpen] = useState(false);
  const [selectedLevelRow, setSelectedLevelRow] = useState<ApprovalData | null>(null);
   const [totalCount, setTotalCount] = useState(0); 
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        if (!authToken) throw new Error("No auth token found");

        const res = await axios.get(`${apiUrl}/api/managerevaluation?ManagerID=${userId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
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

  const handleApprove = async (nominationID: number) => {
    try {
      await axios.put(
        `${apiUrl}/api/managerevaluation/${nominationID}`,
        {
          nominationID,
          isManagerApproved: true,
          approvalComments: reason,
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
          item.NominationID === nominationID ? { ...item, Status: "Approved" } : item
        )
      );

      setToastType("success");
      setSuccessMessage("Nomination Approved Successfully!");
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
        `${apiUrl}/api/managerevaluation/${nominationID}`,
        {
          nominationID,
          isManagerApproved: false,
          approvalComments: reason,
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
          item.NominationID === nominationID ? { ...item, Status: "Rejected" } : item
        )
      );

      setToastType("error");
      setSuccessMessage("Nomination Rejected Successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setIsPanelOpen(false);
    } catch (error) {
      console.error("Reject Error:", error);
      alert("Reject failed");
    }
  };

  const columns = useMemo<ColumnDef<ApprovalData>[]>(() => [
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
      { accessorKey: "AwardCategory", header: "Category" },
      { accessorKey: "NominatedBy", header: "Nominated By" },
     
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
        header: "Flag",
        cell: ({ row }) => {
          const item = row.original as any;
          const flagStatus = Number(item.FlagStatus);

          if (flagStatus < 0) return null;
          const isRed = flagStatus === 1;
          return (
            <span>
              <Flag
                size={18}
                className={
                  isRed
                    ? "text-red-600 fill-red-600"
                    : "text-gray-400 fill-gray-400"
                }/>
            </span>
          );
        },
      },  
    
      {
              header: "Actions",
              cell: ({ row }) => {
                //const item = row.original;
                const handleDetailsView = (item: ApprovalData) => {
              navigate(`/businessjury-detail/${item.NominationID}`, {
                state: { from: "approvals" }
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
          <h2 className="text-xl font-semibold ">Your Team's Nominations</h2>
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
                      className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer select-none">
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
                const isFlagExpanded =
                  expandedRow?.id === item.NominationID &&
                  expandedRow?.type === "flag";

                const isStatusExpanded =
                  expandedRow?.id === item.NominationID &&
                  expandedRow?.type === "status";
                const submitFlag = async (
                  nominationID: number,
                  isFlag: 0 | 1,
                  reason: string
                ) => {
                  if (isFlag === 1 && (!reason || reason.trim() === "")) {
                  setFlagError(prev => ({
                    ...prev,
                    [nominationID]: "Please enter reason"
                  }));
                  setTimeout(() => {
                    flagInputRefs.current[nominationID]?.focus();
                  }, 0);
                  return; 
                }

                setFlagError(prev => ({
                  ...prev,
                  [nominationID]: ""
                }));
                  try {
                    await axios.put(
                      `${apiUrl}/api/nominationflag/${nominationID}`,
                      {
                        isFlag: isFlag === 1,
                        flagReason: isFlag === 1 ? reason : "",
                        updatedBy: userId,
                      },
                      {
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${authToken}`,
                        },
                      }
                    );
                    setData((prev) =>
                      prev.map((item: any) =>
                        item.NominationID === nominationID
                          ? {
                              ...item,
                              FlagStatus: isFlag.toString(), 
                              FlagReason: isFlag === 1 ? reason : "",
                            }
                          : item
                      )
                    );
                     setFlagReason(prev => ({
                        ...prev,
                        [nominationID]: isFlag === 1 ? reason : ""
                      }));
                    setExpandedFlagRow(null);

                  } catch (error) {
                    console.error("Flag Error:", error);
                  }
                };
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
                          {item.FlagStatus === "1" && (
                            <Flag size={18} className="text-red-500" />
                          )}
                          <span
                            className={`text-sm font-semibold whitespace-nowrap text-red-700 `}>
                            Reason For Flagging: *
                          </span>
                          {item.FlagStatus === "1" ? (
                            <>
                              <label className="flex-1 text-sm text-gray-700">
                                 {flagReason[item.NominationID] || item.FlagReason}
                              </label>
                              <button
                                onClick={() => submitFlag(item.NominationID, 0, flagReason[item.NominationID])}
                                className="px-4 py-2 btn-theme-reject"> Remove Flag </button>
                            </>
                          ) : (
                            <>
                              <input
                                ref={(el) => {flagInputRefs.current[item.NominationID] = el;}}
                                type="text"
                                value={flagReason[item.NominationID] || ""}
                                onChange={(e) =>{
                                  const value = e.target.value;
                                  setFlagReason(prev => ({
                                    ...prev,
                                    [item.NominationID]: e.target.value,
                                  }));
                                  if (value.trim()) {
                                    setFlagError(prev => ({
                                      ...prev,
                                      [item.NominationID]: "",
                                    }));
                                  }
                                }}
                                placeholder="Enter flag reason"
                                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-700"/>
                                {flagError[item.NominationID] && (
                                  <p className="text-xs text-red-600 mt-1">
                                    {flagError[item.NominationID]}
                                  </p>
                                )}
                              <button
                                onClick={() => submitFlag(item.NominationID, 1, flagReason[item.NominationID])}
                                className="px-4 py-2 btn-theme"> Save</button>
                            </>
                          )}
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
              })
              )}
            </tbody>

          </table>
           <Pagination  table={table}  totalCount={ globalFilter  ? table.getFilteredRowModel().rows.length : totalCount }  />
          </div>
        </div>
      </div>

      {/* APPROVAL POPUP PANEL */}
      <ApprovalPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        nomination={selectedNomination}
        reason={reason}
        setReason={setReason}
        onApprove={() =>
          selectedNomination && handleApprove(selectedNomination.NominationID)
        }
        onReject={() =>
          selectedNomination && handleReject(selectedNomination.NominationID)
        }
      />
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

export default ApprovalTable;
