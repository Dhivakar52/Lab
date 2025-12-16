import React, { useState,useEffect,useMemo } from 'react';
import axios from "axios";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type {
  ColumnDef,
} from "@tanstack/react-table";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender
} from "@tanstack/react-table";
import { CheckCircle, XCircle, Clock, Menu } from 'lucide-react'; // Import necessary icons
import PresidentSidePanel from './PresidentSidePanel';
import { useAuth } from "../ContextAPI/AuthContext";
import { ColorBadge } from '../TenantBadges';



export interface PresidentLevelNominee {
  id: number;
  JuryApprovalsID:number;
  NominationID: number;
  PresidentID:number;
  Nominee: string;
  Tenant: string;
  CategoryName: string;
  ConsolidatedAvgScore: number;
  PresidentScore: number;
  Descriptions:string;
  NominatedBy:string;
  Designation:string;
  Department:string;
  ManagerUserName:string;
  Status: 'Approved' | 'Rejected' | 'Pending' | string;
  FinalStatus:'Winner' | 'Runner-Up' | string;
  PresidentComments: string;
  "ApprovalStatus": {
   Status: string;
  ApprovalType: string;
  }[];
}

const apiUrl = import.meta.env.VITE_API_URL;
const statusColors: Record<PresidentLevelNominee['FinalStatus'], string> = {
  'Winner': 'bg-blue-100 text-blue-800',
  'Runner-Up': 'bg-gray-100 text-gray-800',
};

const PresidentLevel: React.FC = () => {
  const [selectedNominee, setSelectedNominee] = useState<PresidentLevelNominee | null>(null);
  const [data, setData] = useState<PresidentLevelNominee[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const { authToken } = useAuth();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
     useEffect(() => {
    const fetchNominee = async () => {
      try {
        if (!authToken) throw new Error("No auth token found");

        const res = await axios.get(`${apiUrl}/api/presidentevaluation`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        setData(res.data);
      } catch (err) {
        console.error("❌ Error fetching President Evaluation:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNominee();
  }, []);
 


   const columns = useMemo<ColumnDef<PresidentLevelNominee>[]>(
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
        { accessorKey: "ConsolidatedAvgScore", header: "Consolidated Avg Score" },
         { accessorKey: "Status", header: "Flag" ,
          cell: ({ getValue }) => { // Use 'getValue' to access the cell's raw value
          const flagValue = getValue<PresidentLevelNominee['Status']>();
          // Use a switch statement or if/else for conditional rendering
          switch (flagValue) {
            case 'Approved':
              return <CheckCircle className="text-green-500 w-5 h-5" />;
            case 'Rejected':
              return <XCircle className="text-red-500 w-5 h-5" />;
            case 'Pending':
              return <Clock className="text-yellow-500 w-5 h-5" />;
            default:
              return <span>{flagValue}</span>; // Fallback to raw text
          }
        },
         },
         { accessorKey: "FinalStatus", header: "Final Status" ,
          cell: ({ getValue }) => { // Use 'getValue' to access the cell's raw value
          const statusValue = getValue<PresidentLevelNominee['FinalStatus']>();
          
          // Use a switch statement or if/else for conditional rendering
          switch (statusValue) {
            case 'Winner':
              return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[statusValue]}`}>
                    {statusValue}</span>;
            case 'Runner-Up':
              return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[statusValue]}`}>
                    {statusValue}</span>;// Fallback to raw text
          }
        },
         },
         {
        id: 'actions', // Use a unique ID for columns not tied to an accessorKey
        header: 'Actions',
        cell: ({ row }) => { // Access the entire row data using 'row' prop
          const item = row.original; // This is the full Nominee object for the current row

          return (
         <DropdownMenu.Root>
                         <DropdownMenu.Trigger className="p-2 rounded hover:bg-gray-100"  onClick={() => {setSelectedNominee(item);
                                   setIsPanelOpen(true);
                                 }}>
                             <Menu className="w-5 h-5 text-blue-500" />
                         </DropdownMenu.Trigger>
                        
                     </DropdownMenu.Root>
          
          );
        },
      },
       ],
       []
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
      return <div className="text-center py-6 text-gray-600">Loading President Level Evaluation...</div>;
    }

  return (
   <div className="p-6 m-5 bg-white rounded-xl shadow-md relative">
 
      {/* Table */}
<div className="overflow-x-auto">
      <div className="mb-4 flex justify-between items-center">
          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search..."
            className="border border-gray-300 rounded-md px-4 py-2 w-1/3 text-sm"
          />
      </div>

      <table className="min-w-full border-collapse table-auto">
                    <thead className="bg-gray-100 px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              onClick={header.column.getToggleSortingHandler()}
                              className="px-4 py-3 text-left text-xs font-semibold text-gray-600 cursor-pointer select-none"
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {{
                                asc: " 🔼",
                                desc: " 🔽",
                              }[header.column.getIsSorted() as string] ?? null}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                            {row.getVisibleCells().map((cell) => (
                              <td key={cell.id} className="px-6 py-3 text-sm text-gray-900">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={columns.length} className="text-center py-6 text-gray-500">
                            No President Level Evaluation found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

        </div>         
     {/* 📄 Pagination Controls */}
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

          {/* Panel */}
      <PresidentSidePanel
  nominee={selectedNominee}
  isOpen={isPanelOpen}
  onClose={() => setIsPanelOpen(false)}
  
/>
    </div>
  );
};

export default PresidentLevel;
