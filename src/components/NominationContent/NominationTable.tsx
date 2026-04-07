import * as Tabs from "@radix-ui/react-tabs";
import React, { useRef, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel,
getFilteredRowModel, flexRender} from "@tanstack/react-table";
import type { ColumnDef} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, Menu } from "lucide-react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../ContextAPI/AuthContext";
// import NominationDetailsModal from "./NominationDetailsModal";
import { ColorBadge } from "../TenantBadges";
import { useNavigate } from "react-router-dom";
import Pagination from "../Pagination";
import {DropdownMenu, DropdownMenuTrigger
} from "@radix-ui/react-dropdown-menu";
import StatusFlow from "../CommonStatusFlow"; 
import { levelColors, levelTextColors } from "../../statusColors.ts";
import { useLocation } from "react-router-dom";
import ProgressSidePanel from "../ProgressSidePanel";


interface Nomination {
  TotalRowCount: number;
  NominationID: number;
  Nominee: string;
  ManagerName:string;
  Tenant: string;
  NominatedBy: string;
  NominationCycleName: string;
  AwardCategory: string;
  Descriptions: string;
  ContestType:string;
  SubmittedDate:string;
  SelfNomination: string;
  NominationFile: string | null;
  ManagerEmailID:string;
  Levels:string;
  Status: string;
  // Status: "Pending" | "Approved" | "Rejected" | "Under Review";
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
  NominationID: number;
  Status: string;
  ApprovalType: string;
  ApprovalFlow:string;
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
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const navigate = useNavigate();
  const [refreshKey, _setRefreshKey] = useState(0);
  const { authToken, userId } = useAuth();
  // const [tab, setTab] = useState("my");
  const location = useLocation();
  const [tab, setTab] = useState<"my" | "others">("my");
  const [initialized, setInitialized] = useState(false);
  const tableWrapperRef = useRef<HTMLDivElement | null>(null);
  const [isLevelPanelOpen, setIsLevelPanelOpen] = useState(false);
  const [selectedLevelRow, setSelectedLevelRow] = useState<Nomination | null>(null);
   const [totalCount, setTotalCount] = useState(0); 

  useEffect(() => {
    if (location.state?.tab) {
      setTab(location.state.tab);
    }
    setInitialized(true);
  }, [location.state]);



 
  const fetchNominations = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/api/nominationsbyuser`, {
        params: {
          userID: tab === "my" ? userId : 0,
          NominatedBy: tab === "my" ? 0 : userId,
        },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      //setTotalCount(res.data[0]?.TotalCount || 0);
        setTotalCount(res.data.length);
         setData(res.data);
      setExpandedRow(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    setExpandedRow(null);
  };
 

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
  useEffect(() => {
    if (!initialized) return;
    fetchNominations();
  }, [tab, initialized, authToken, userId]);

  useEffect(() => {
    if (location.state?.tab) {
      setTab(location.state.tab);
      navigate(location.pathname, { replace: true });
    }
    setInitialized(true);
  }, []);

  
  const handleForm=()=>{
    navigate("add-nomination");
  }
  const columns = useMemo<ColumnDef<Nomination>[]>(
    () => [
      { accessorKey: "NominationID", header: "ID" },
      { accessorKey: "Nominee", header: "Nominee" },
      // { accessorKey: "Tenant", header: "Entity" },
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
              className={`
                w-20 h-8
                text-xs font-semibold
                rounded-md
                flex items-center justify-center
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
      // {
      //       accessorKey: "Status",
      //       header: "Status",
      //       cell: ({ row, getValue }) => {
      //         const status = getValue() as string;
      //         const isOpen = expandedRow === row.original.NominationID;

      //         const bgClass = levelColors[status] || "bg-gray-100 border-gray-300";
      //         const textClass = levelTextColors[status] || "text-gray-700";

      //         return (
      //           <div
      //             className={`inline-flex items-center border rounded overflow-hidden ${bgClass} ${textClass}`}>
      //             <button
      //               onClick={(e) =>{ e.stopPropagation();
      //               handleStatusClick(row.original.NominationID)}}
      //               className="px-3 py-1 text-sm font-medium flex-1 text-left">
      //               {status}
      //             </button>
      //             <span className="w-px self-stretch bg-current opacity-30" />
      //             <button
      //               onClick={(e) =>{ e.stopPropagation();
      //               handleStatusClick(row.original.NominationID)}}
      //               className="px-2 flex items-center justify-center" >
      //              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      //             </button>
      //           </div>
      //         );
      //       },
      //  },        
     {
      header: "Actions",
      cell: ({ row }) => {
        //const item = row.original;
        // const handleView = () => {
        //   setSelectedNomination(item);
        //   setModalOpen(true);
        // };
        // const handleDetailsView = (item: Nomination) => {
        //  navigate(`/nomination-detail/${item.NominationID}`);
        //  };
        // const handleDetailsView = (item: Nomination) => {
        //   console.log("NAV TAB 👉", tab);

        //   navigate(`/nomination-detail/${item.NominationID}`, {
        //     state: {
        //       from: "nominations",
        //       tab: tab,
        //     },
        //   });
        // };

        const handleDetailsView = (item: Nomination) => {
          navigate(`/nomination-detail/${item.NominationID}`, {
            state: { from: "nominations",tab: tab, }
          });
        };
        // const handleEditNomiation = (item: Nomination) => {
        //   navigate(`/self-nominations/${item.NominationID}`);
        // };
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded hover:bg-gray-100 transition"  title="View Details" onClick={() => handleDetailsView(row.original)}>
                <Menu size={18} className="text-blue-600" />
              </button>
            </DropdownMenuTrigger>      
          </DropdownMenu>
    
        );
      },
    },
    ],[expandedRow,tab]);
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
    return <div className="text-center py-6 text-gray-600">Loading nominations...</div>;
  }
  // const referralEmails: string[] =
  // selectedNomination?.["Referrals ID"]?.map((r) => r.Email) || [];
  return (
    <>
    {/* {successMessage && (
      <div
        className="fixed top-5 right-5 px-4 py-2 rounded-lg shadow-lg z-[99999] bg-green-600 text-white" >
        {successMessage}
      </div>
    )} */}
    <div key={refreshKey}> 
      <div className="p-6">
       <div className="overflow-x-auto bg-white shadow-md rounded-lg p-6">
        <div className="mb-4 flex items-center justify-between gap-6">
          <Tabs.Root value={tab}   onValueChange={(value) => setTab(value as "my" | "others")}>
            <Tabs.List className="flex border-b border-gray-300 w-[420px]">
              <Tabs.Trigger value="my"
                className="flex-1 text-center px-6 py-2 text-sm data-[state=active]:border-b-2
                data-[state=active]:border-green-500 data-[state=active]:text-green-600 
                hover:bg-gray-50"> My Nominations
              </Tabs.Trigger>
              <Tabs.Trigger value="others"
                className="flex-1 text-center px-6 py-2 text-sm data-[state=active]:border-b-2
                data-[state=active]:border-green-500 data-[state=active]:text-green-600
                hover:bg-gray-50"> My Nomination to Others
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>
          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search nominations..."
            className="border border-gray-300 rounded-md px-4 py-2 w-1/3 text-sm" />
          {tab === "others" && (
            <button className="px-4 py-2 btn-theme whitespace-nowrap" onClick={handleForm}>Add Nomination</button>
          )}
        </div>
        {/* 🧾 Table */}
        <div ref={tableWrapperRef}>
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr onClick={(e) => e.stopPropagation()} key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600  cursor-pointer select-none">
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
   </div>
   <ProgressSidePanel
      isOpen={isLevelPanelOpen}
      data={selectedLevelRow}
      onClose={() => {
      setIsLevelPanelOpen(false);
      setSelectedLevelRow(null);
    }}
        />
      {/* 🔍 Modal */}
      {/* {selectedNomination && (
        <NominationDetailsModal
          isOpen={modalOpen}
          onRefresh={refreshNominations}  
          onClose={() => setModalOpen(false)}
          setSuccessMessage={setSuccessMessage} 
          // data={selectedNomination}
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
              referrals: referralEmails,
              description: selectedNomination.Descriptions,
              managerEmailID: selectedNomination.ManagerEmailID,
              "Referrals ID": selectedNomination["Referrals ID"],
              "Supporting Documents": selectedNomination["Supporting Documents"],
              "ApprovalStatus": selectedNomination["ApprovalStatus"] , 
            }}
        />
      )} */}

      <Outlet />
    </>
  );
};

export default NominationTable;
