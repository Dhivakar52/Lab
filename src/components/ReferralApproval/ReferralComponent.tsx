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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { useAuth } from "../ContextAPI/AuthContext";
import { Menu } from "lucide-react";

// Correct Component Import
import ReferralPanel from "./ReferralPanel";
import { useNavigate } from "react-router-dom";
import ReferralReasonPanel from "./ReferralDetailView";
// Components

import { ColorBadge } from "../TenantBadges";


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


interface ReferralView {
  NominationID: number;
  ReferralUserID:number;
  nominee: string | null;
  entity: string | null;
  contest: string | null;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
  AwardCategory: string;
  NominatedBy: string;
  ManagerEmailID: string;
  
   Comments: string | null;
  //"Referrals ID": { Email: string }[];
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
  Descriptions: string;
  ReferralID: number;
  ManagerName: string;
  BusinessJuryStatus: string;
}
// interface ReferralView extends ReferralData {}
const apiUrl = import.meta.env.VITE_API_URL;

const statusColors: Record<ReferralData["Status"], string> = {
  Pending: "bg-orange-100 text-orange-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

const ReferralTable: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedNomination, setSelectedNomination] =
    useState<ReferralView | null>(null);

  const [data, setData] = useState<ReferralData[]>([]);
  const [resvalue, setApproveData] = useState<ReferralData[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const { userId, authToken } = useAuth();
  const [successMessage, setSuccessMessage] = useState("");
  
    const [reason, setReason] = useState("");
    const navigate = useNavigate();
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        if (!authToken) throw new Error("No auth token found");

        const res = await axios.get(`${apiUrl}/api/referralvaluations/${userId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setData(res.data);
        console.log("approval:", res.data);

       
      } catch (err) {
        console.error("❌ Error fetching approvals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, []);

  const handleApprove = async (nominationID: number) => {
     if (!selectedNomination) return;
    try {
      await axios.put(
        `${apiUrl}/api/referralvaluations/${selectedNomination.ReferralID}`,
        {
          
            referralUserID: selectedNomination.ReferralUserID,
            nominationID: nominationID,
            isReferralApproved: true,       // REJECT
            approvalComments: reason,
            active: true,
            submittedBy: userId
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
          item.NominationID === nominationID
            ? { ...item, Status: "Approved" }
            : item
        )
      );

      setToastType("success");
      setSuccessMessage("Nomination Approved Successfully!");
     // setTimeout(() => setSuccessMessage(""), 3000);
       setTimeout(() => {
      setSuccessMessage("");
      navigate("/referral-approval"); // redirect after showing toast
    }, 2000); // show toast for 1.5s
      setIsPanelOpen(false);
    } catch (error) {
      console.error("Approve Error:", error);
      alert("Approval failed");
    }
  };

  const handleReject = async (nominationID: number) => {
     if (!selectedNomination) return;
    try {
      await axios.put(
        `${apiUrl}/api/referralvaluations/${selectedNomination.ReferralID}`,
        {
          referralUserID: selectedNomination.ReferralUserID,
            nominationID: nominationID,
            isReferralApproved: false,       // REJECT
            approvalComments: reason,
            active: true,
            submittedBy: userId
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
          item.NominationID === nominationID
            ? { ...item, Status: "Rejected" }
            : item
        )
      );

      setToastType("error");
      setSuccessMessage("Nomination Rejected Successfully!");
       setTimeout(() => {
      setSuccessMessage("");
      navigate("/referral-approval"); // redirect after showing toast
    }, 1500); // show toast for 1.5s
     // setTimeout(() => setSuccessMessage(""), 3000);
      setIsPanelOpen(false);
    } catch (error) {
      console.error("Reject Error:", error);
      alert("Reject failed");
    }
  };
 const handleOpenPanel = (nomination: ReferralView) => {
    setSelectedNomination(nomination);
    setIsPanelOpen(true);
  };
  const columns = useMemo<ColumnDef<ReferralData>[]>(() => {
    return [
      { accessorKey: "NominationID", header: "Nomination ID" },
      { accessorKey: "Nominee", header: "Nominee Name" },
      {
        accessorKey: "Tenant",
        header: "Entity Name",
        cell: ({ getValue }) => {
          const tenant = getValue() as string;
          return <ColorBadge label={tenant} />;
        },
      },
       { accessorKey: "NominatedBy", header: "Nominated By" },
      { accessorKey: "AwardCategory", header: "AwardCategory" },
     // { accessorKey: "Tenant", header: "Entity Name" },
      { accessorKey: "SubmittedDate", header: "Submitted Date" },

      {
        accessorKey: "Status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() as ReferralData["Status"];
          const colorClass = statusColors[status];
          return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
              {status}
            </span>
          );
        },
      },

  
    // {
    //   header: "Actions",
    //   cell: ({ row }) => {
    //     const item = row.original;
  
    //      const handleDetailsView = (item: ReferralData) => {
    //       navigate(`/nomination-detail/${item.NominationID}`, {
    //         state: { from: "referral-approval" }
    //       });
          
    //     };
    //     return (
    //       <DropdownMenu>
    //         <DropdownMenuTrigger asChild>
    //           <button className="p-2 rounded hover:bg-gray-100 transition">
    //             <Menu size={18} className="text-blue-600" />
    //           </button>
    //         </DropdownMenuTrigger>
    
    //         <DropdownMenuContent align="end" className="w-30 bg-white shadow-xl rounded-sm">
    //           <DropdownMenuItem
    //             onClick={() => handleDetailsView(row.original)}
    //             className="hover:bg-blue-50 hover:text-blue-700 p-3" >
    //              View
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
              state: { from: "referral-approval" },
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

    ];
  }, []);

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
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === "asc" ? " 🔼" : ""}
                      {header.column.getIsSorted() === "desc" ? " 🔽" : ""}
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
                    No approvals found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

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
      </div>

      {/* Final Correct Component */}
      <ReferralPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        nomination={selectedNomination}
        onApprove={() =>
          selectedNomination && handleApprove(selectedNomination.NominationID)
        }
        onReject={() =>
          selectedNomination && handleReject(selectedNomination.NominationID)
        }
         reason={reason}
        setReason={setReason}
      />
       {/* Final Correct Component */}
      {/* <ReferralReasonPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        nomination={selectedNomination}
        onApprove={() =>
          selectedNomination && handleApprove(selectedNomination.NominationID)
        }
        onReject={() =>
          selectedNomination && handleReject(selectedNomination.NominationID)
        }
         reason={reason}
        setReason={setReason}
      /> */}
       {/* <ReferralReasonPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        nomination={selectedNomination}
        reason={reason}
        setReason={setReason}
        onApprove={() => selectedNomination && handleApprove(selectedNomination.NominationID)}
        onReject={() => selectedNomination && handleReject(selectedNomination.NominationID)}
      /> */}
    </div>
  );
};

export default ReferralTable;
