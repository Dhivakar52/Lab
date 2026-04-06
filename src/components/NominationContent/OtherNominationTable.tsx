import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  expandRows,
} from "@tanstack/react-table";
import type {
  ColumnDef,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, Menu } from "lucide-react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../ContextAPI/AuthContext";
import NominationDetailsModal from "./NominationDetailsModal";
import { ColorBadge } from "../TenantBadges";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import StatusFlow from "../CommonStatusFlow"; 
import { levelColors, levelTextColors } from "../../statusColors.ts";

import Pagination from "../Pagination";

interface Nomination {
  TotalRowCount: number;
  NominationID: number;
  Nominee: string;
  ManagerName:string;
  ManagerEmailID:string;
  Tenant: string;
  NominatedBy: string;
  NominationCycleName: string;
  AwardCategory: string;
  Descriptions: string;
  ContestType:string;
  SubmittedDate:string;
  SelfNomination: string;
  NominationFile: string | null;
  Status: "Pending" | "Approved" | "Rejected" | "Under Review";
  "Referrals ID": {
    Email: string;
    TenantName: string;
    DeptName: string;
    ReferralName:string;
    ReferralStatus:string;
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
    ApprovalFlow: string;
    ApprovalComments:string;
    ApprovalName:string;
    ApprovalScore:string;
    ApprovedAt:string;
   }[];
  //"Referrals ID": { Email: string }[];
}

const apiUrl = import.meta.env.VITE_API_URL;

const NominationTable: React.FC = () => {
  const [data, setData] = useState<Nomination[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNomination, _setSelectedNomination] = useState<Nomination | null>(null);
  const [_successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const { authToken, userId } = useAuth();
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  
     const [totalCount, setTotalCount] = useState(0); 
  
 const fetchNominations = async () => {
      try {
        // const res = await axios.get(`${apiUrl}/api/nominations`, {
        //   headers: { Authorization: `Bearer ${authToken}` },
        // });
        const res = await axios.get(`${apiUrl}/api/nominationsbyuser`, {
                  params: {
                    userID: 0,
                    NominatedBy: userId,
                  },
                  headers: { Authorization: `Bearer ${authToken}`,},
                });
        setData(res.data);
         setTotalCount(res.data.length);
      } catch (err) {
        console.error("❌ Error fetching nominations:", err);
      } finally {
        setLoading(false);
      }
    };
     const handleStatusClick = (nominationID: number) => {
      setExpandedRow(prev =>
        prev === nominationID ? null : nominationID
      );
    };
  useEffect(() => {
    fetchNominations();
  }, [authToken, userId]);

  const columns = useMemo<ColumnDef<Nomination>[]>(
    () => [
     { accessorKey: "NominationID", header: "Nomination ID" },
      { accessorKey: "Nominee", header: "Nominee" },
      // { accessorKey: "Tenant", header: "Entity" },
      {
              accessorKey: "Tenant",
              header: "Entity Name",
              cell: ({ getValue }) => {
                const tenant = getValue() as string;
                return <ColorBadge label={tenant} />;
              },
      },
      { accessorKey: "AwardCategory", header: "Category" },
      { accessorKey: "NominatedBy", header: "Nominated By" },
      {
            accessorKey: "Status",
            header: "Status",
            cell: ({ row, getValue }) => {
              const status = getValue() as string;
              const isOpen = expandedRow === row.original.NominationID;

              const bgClass = levelColors[status] || "bg-gray-100 border-gray-300";
              const textClass = levelTextColors[status] || "text-gray-700";

              return (
                <div
                  className={`inline-flex items-center border rounded overflow-hidden ${bgClass} ${textClass}`}>
                  <button
                    onClick={() => handleStatusClick(row.original.NominationID)}
                    className="px-3 py-1 text-sm font-medium flex-1 text-left">
                    {status}
                  </button>
                  <span className="w-px self-stretch bg-current opacity-30" />
                  <button
                    onClick={() => handleStatusClick(row.original.NominationID)}
                    className="px-2 flex items-center justify-center" >
                   {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              );
            },
       },  
     {
        header: "Actions",
        cell: ({ row }) => { 
         const handleDetailsView = (item: Nomination) => {
          navigate(`/nomination-detail/${item.NominationID}`, {
            state: { from: "other-nominations", tab: "form" }
          });
        };

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded hover:bg-gray-100 transition" title="View Details" onClick={() => handleDetailsView(row.original)}>
                  <Menu size={18} className="text-blue-600" />
                </button>
              </DropdownMenuTrigger>              
            </DropdownMenu>
          );
        },
      },
    ],[expandRows]);

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
    return <div className="text-center py-6 text-gray-600">Loading other nominations...</div>;
  }
 const referralEmails: string[] =
  selectedNomination?.["Referrals ID"]?.map((r) => r.Email) || [];

       const handleForm=()=>{
       navigate("add-nomination");
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
        <button className="px-4 py-2 btn-theme" onClick={handleForm}>Add Nomination</button>

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
              {table.getRowModel().rows.map((row) => {
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
                      <td colSpan={columns.length} className="px-6 py-4">
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
         <Pagination table={table}  totalCount={totalCount}/>
        {/* 📄 Pagination */}
        {/* <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
        
        </div> */}
      </div>
      {selectedNomination && (
        <NominationDetailsModal
          isOpen={modalOpen}
          onRefresh={fetchNominations}  
          onClose={() => setModalOpen(false)}
          setSuccessMessage={setSuccessMessage} 
          // data={selectedNomination}s
            data={{
      nominationId: selectedNomination.NominationID.toString(),
      nominee: selectedNomination.Nominee,
      entity: selectedNomination.Tenant,
      category: selectedNomination.AwardCategory,
      nominatedBy: selectedNomination.NominatedBy,
      submissionDate: selectedNomination.SubmittedDate, // or actual date if available
      contestType: selectedNomination.ContestType,
      status: selectedNomination.Status,  
      managerEmail: selectedNomination.ManagerName,
      managerEmailID:selectedNomination.ManagerEmailID,
      referrals: referralEmails,
      description: selectedNomination.Descriptions,
      "Referrals ID": selectedNomination["Referrals ID"],
      "Supporting Documents": selectedNomination["Supporting Documents"],
       "ApprovalStatus": selectedNomination["ApprovalStatus"] , 
    }}
        />
      )}

      
      <Outlet />
    </>
  );
};

export default NominationTable;
