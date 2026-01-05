import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Search, Plus, Menu , Edit2, Trash2 } from "lucide-react";
import BackToSetting from "../BackToSetting";
import AddJuryMemberPanel from "./AddJuryMemberPanel";
import { useAuth } from "../ContextAPI/AuthContext";

const apiUrl = import.meta.env.VITE_API_URL;

interface JuryMember {
  UserRoleID: number;
  UserName: string;
  RoleName: string;
  TenantName?: string;
  TenantID?: number;
}

const JuryPanelSetup: React.FC = () => {
  const { authToken,userId } = useAuth();

  const [data, setData] = useState<JuryMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");

  // Side panel
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState<number | null>(null);
const [selectedMember, setSelectedMember] = useState<JuryMember | null>(null);

const [isEditMode, setIsEditMode] = useState(false);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchJuryPanelList = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/usersrole`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        // const juryPanelData = res.data.map((item: any) => ({
        //   UserRoleID: item.UserRoleID,
        //   UserName: item.UserName,
        //   RoleName: item.RoleName,
        //   TenantName: item.TenantName || "-",
        //    TenantID: item.TenantID,
        // }));
        const juryPanelData = res.data
        .filter(
          (item: any) =>
            item.RoleName === "Business Jury" ||
            item.RoleName === "General Jury"
        )
        .map((item: any) => ({
          UserRoleID: item.UserRoleID,
          UserName: item.UserName,
          RoleName: item.RoleName,
          TenantName: item.TenantName || "-",
          TenantID: item.TenantID,
        }));

      setData(juryPanelData);


        setData(juryPanelData);
      } catch (err) {
        console.error("Error fetching jury panel list", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJuryPanelList();
  }, [authToken]);
   const handleEdit = (item: JuryMember) => {
    setSelectedMember(item);
    setIsEditMode(true);
    setIsPanelOpen(true);
  };
    // ================= PUT REQUEST TO UPDATE JURY MEMBER =================
  const handleUpdateJuryMember = async (updatedMember: JuryMember) => {
    try {
      const res = await axios.put(
        `${apiUrl}/api/usersrole/${updatedMember.UserRoleID}`,
        {
          userID: userId,
          roleID: updatedMember.RoleName === "Business Jury" ? 1 : 2, 
          active: true,
          submittedBy: userId, 
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (res.status === 200) {
        // Update the table data
        setData((prevData) =>
          prevData.map((member) =>
            member.UserRoleID === updatedMember.UserRoleID
              ? { ...member, ...updatedMember }
              : member
          )
        );
        setIsPanelOpen(false);
        setIsEditMode(false);
        setSelectedMember(null);
      }
    } catch (err) {
      console.error("Error updating jury member", err);
    }
  };
  /* ================= COLUMNS ================= */
  const columns = useMemo<ColumnDef<JuryMember>[]>(() => [
     {
      accessorKey: "UserRoleID",
      header: "UserRoleID",
    },
    {
      accessorKey: "UserName",
      header: "Jury Member List",
    },
    {
      accessorKey: "TenantName",
      header: "Entity",
    },
    {
      accessorKey: "RoleName",
      header: "Role",
      cell: ({ row }) =>
        row.original.RoleName === "Business Jury" ? (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
            Business Jury
          </span>
        ) : (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
            General Jury
          </span>
        ),
    },

    // {
    //     accessorKey: "RoleName",
    //     header: "Role",
    //     cell: ({ row }) => {
    //       const role = row.original.RoleName;

    //       if (role === "Business Jury") {
    //         return (
    //           <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
    //             {role}
    //           </span>
    //         );
    //       }

    //       if (role === "Manager") {
    //         return (
    //           <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
    //             {role}
    //           </span>
    //         );
    //       }

    //       if (role === "Admin") {
    //         return (
    //           <span className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">
    //             {role}
    //           </span>
    //         );
    //       }

    //     return (
    //       <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
    //         {role}
    //       </span>
    //     );
    //   },
    // },
       {
          id: "actions",
          header: "Actions",
          cell: ({ row }) => {
            const item = row.original;
            return (
              <div className="flex  gap-3">
                 <button
                  className="text-blue-600 hover:text-blue-800"
                   onClick={() => handleEdit(item)}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="text-red-600 hover:text-red-800"
                 
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          },
        },

  ], []);

  /* ================= TABLE ================= */
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) {
    return <div className="text-center py-6">Loading...</div>;
  }

  return (
    <div>
      <BackToSetting />

      <div className="bg-white shadow-md rounded-lg p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Jury Panel Setup</h1>

          <div className="flex gap-3">
            {/* SEARCH */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search jury member..."
                className="pl-10 pr-4 py-2 w-64 text-sm rounded-md border border-gray-300
                           focus:border-gray-300 focus:ring-0 focus:outline-none"
              />
            </div>

            {/* ADD BUTTON */}
            <button
              onClick={() => setIsPanelOpen(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md text-sm"
            >
              <Plus size={16} />
              Add New Jury Member
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 text-sm text-gray-800">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-8 text-gray-500">
                    No jury members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>

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

      {/* SIDE PANEL */}
      {/* <AddJuryMemberPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      /> */}
       <AddJuryMemberPanel
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setIsEditMode(false);
          setSelectedMember(null);
        }}
        isEdit={isEditMode}
        editData={selectedMember}
        // onSave={handleUpdateJuryMember}
      />
    </div>
  );
};

export default JuryPanelSetup;
