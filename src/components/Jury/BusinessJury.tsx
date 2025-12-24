import React, { useState,useEffect,useMemo } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {  Menu,  } from "lucide-react";
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

//api/businessjuryevaluation
const statusColors: Record<BusinessJury["Status"], string> = {
  Pending: "bg-orange-100 text-orange-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

const apiUrl = import.meta.env.VITE_API_URL;

const BusinessJury: React.FC = () => {
  const { authToken, userId } = useAuth();
  const [data, setData] = useState<BusinessJury[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedNomination, setSelectedNomination] = useState<BusinessJury | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const navigate = useNavigate(); // Hook to navigate programmatically
  
    const navigateDetailView = (route: string) => {
      navigate(route); // Navigate to the route
      window.location.reload();  
    };
    
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
  }, []);


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
        { accessorKey: "BusinessJuryScore", header: "Score" },
        {
        accessorKey: "Status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() as BusinessJury["Status"];
          const colorClass = statusColors[status] || "bg-gray-100 text-gray-700";
          return (
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}
            >
              {status}
            </span>
          );
        },     
     },             
        {
        id: 'actions', // Use a unique ID for columns not tied to an accessorKey
        header: 'Actions',
        cell: ({ row }) => { // Access the entire row data using 'row' prop
          const item = row.original; // This is the full Nominee object for the current row
 
          return (
            <DropdownMenu.Root>
                <DropdownMenu.Trigger className="p-2 rounded hover:bg-gray-100"  onClick={() => {setSelectedNomination(item);
                          navigateDetailView(`/businessjury-detail/${item.NominationID}`);
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
      return <div className="text-center py-6 text-gray-600">Loading...</div>;
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

        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Nominee", "Entity", "Category","Nominated By", "Score", "Status", "Actions"].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-600"
                >
                  {header}
                </th>
              ))}
            </tr>
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
                              No nominations found
                            </td>
                          </tr>
                        )}
            </tbody>          
        </table>
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
