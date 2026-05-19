import { useMemo, useState, useEffect } from "react";
import { Menu } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "../../../common/DataTable";
import Pagination from "../../../common/Pagination";
import CustomPanel from "../../../common/CustomPanel";
import TableSearch from "../../../common/TableSearch";
import ColumnToggle from "../../../common/ColumnToggle";

// ✅ TYPE
type Study = {
  id: number;
  studyCode: string;
  protocolNo: string;
  sponsor: string;
  phase: string;
  piName: string;
  status: string;
};

const StudyTable = () => {

  // ✅ DATA (Demo)
  const data: Study[] = useMemo(
    () => [
      {
        id: 1,
        studyCode: "ST001",
        protocolNo: "PROT-001",
        sponsor: "Pfizer",
        phase: "II",
        piName: "Dr Kumar",
        status: "Active",
      },
      {
        id: 2,
        studyCode: "ST002",
        protocolNo: "PROT-002",
        sponsor: "IQVIA",
        phase: "III",
        piName: "Dr Raj",
        status: "Draft",
      },
      
      
    ],
    []
  );

  // ✅ STATES
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);

  // ✅ CLOSE DROPDOWN
  useEffect(() => {
    const close = () => setOpenMenuId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // ✅ PANEL
  const handleOpenPanel = (study: Study) => {
    setSelectedStudy(study);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedStudy(null);
  };

  const handleSave = () => {
    console.log("Saved:", selectedStudy);
    setIsPanelOpen(false);
  };

  // ✅ DROPDOWN
  const handleToggleMenu = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const handleView = (study: Study) => {
    handleOpenPanel(study);
    setOpenMenuId(null);
  };

  const handleEdit = (study: Study) => {
    handleOpenPanel(study);
    setOpenMenuId(null);
  };

  const handleDelete = (study: Study) => {
    console.log("Delete:", study);
    setOpenMenuId(null);
  };

  // ✅ COLUMNS
  const columns: ColumnDef<Study>[] = useMemo(
    () => [
      { accessorKey: "studyCode", header: "Study Code" },
      { accessorKey: "protocolNo", header: "Protocol No" },
      { accessorKey: "sponsor", header: "Sponsor" },
      { accessorKey: "phase", header: "Phase" },
      { accessorKey: "piName", header: "PI Name" },

      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const value = getValue<string>();
          return (
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                value === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {value}
            </span>
          );
        },
      },

      {
        id: "action",
        header: "Actions",
        enableHiding: false,
        cell: ({ row }) => {
          const study = row.original;
          const isOpen = openMenuId === study.id;

          return (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => handleToggleMenu(study.id, e)}
                className="p-2 rounded hover:bg-gray-100"
              >
                <Menu size={18} />
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-[9999]">
                  <button
                    onClick={() => handleView(study)}
                    className="block w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(study)}
                    className="block w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(study)}
                    className="block w-full px-3 py-2 text-left hover:bg-red-50 text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        },
      },
    ],
    [openMenuId]
  );

  // ✅ PAGINATION
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // ✅ TABLE
  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      globalFilter,
      columnVisibility,
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),

    globalFilterFn: "includesString",
  });

  return (
    <div className="p-6">
      <div className="bg-white shadow-md rounded-lg p-6">

        {/* HEADER */}
        <div className="flex justify-end items-center mb-4 gap-3">
          <TableSearch
            value={globalFilter}
            onChange={setGlobalFilter}
            placeholder="Search study..."
          />
          <ColumnToggle table={table} />
        </div>

        {/* TABLE */}
        <DataTable table={table} columns={columns} />

        {/* PAGINATION */}
        <Pagination
          table={table}
          totalCount={table.getFilteredRowModel().rows.length}
        />
      </div>

      {/* PANEL */}
      <CustomPanel
        isOpen={isPanelOpen}
        title="Study Details"
        onClose={handleClosePanel}
        onSave={handleSave}
      >
        {selectedStudy && (
          <div className="space-y-3">
            <div><b>Study Code:</b> {selectedStudy.studyCode}</div>
            <div><b>Protocol:</b> {selectedStudy.protocolNo}</div>
            <div><b>Sponsor:</b> {selectedStudy.sponsor}</div>
            <div><b>Phase:</b> {selectedStudy.phase}</div>
            <div><b>PI:</b> {selectedStudy.piName}</div>
            <div><b>Status:</b> {selectedStudy.status}</div>
          </div>
        )}
      </CustomPanel>
    </div>
  );
};

export default StudyTable;