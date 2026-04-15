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
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";
import Pagination from "../Pagination";
import { useAuth } from "../ContextAPI/AuthContext";

interface CategoryNominationData {
  TotalRowCount: number;
  AwardCategoryID: number;
  CategoryName: string;
  Applied: number;
  Contender: number;
  Nominated: number;
  WinnerRunner: number;
}

const apiUrl = import.meta.env.VITE_API_URL;

const ReportTable: React.FC = () => {
  const [data, setData] = useState<CategoryNominationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const { authToken } = useAuth();

  useEffect(() => {
    const fetchCategoryWiseReport = async () => {
      try {
        if (!authToken) throw new Error("No auth token found");

        const res = await axios.get(
          `${apiUrl}/api/categorynominationwisecount`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        // backend returns JSON string
        const parsedData =
          typeof res.data === "string" ? JSON.parse(res.data) : res.data;

        setData(parsedData);
        setTotalCount(parsedData[0]?.TotalRowCount || 0);
      } catch (err) {
        console.error("❌ Error fetching report:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryWiseReport();
  }, [authToken]);

  const columns = useMemo<ColumnDef<CategoryNominationData>[]>(() => {
    return [
      {
        accessorKey: "CategoryName",
        header: "Category Name",
      },
      {
        accessorKey: "Applied",
        header: "Applied",
      },
      {
        accessorKey: "Contender",
        header: "Contender",
      },
      {
        accessorKey: "Nominated",
        header: "Nominated",
      },
      {
        accessorKey: "WinnerRunner",
        header: "Winner / Runner",
      },
    ];
  }, []);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading) {
    return <div className="text-center py-6 text-gray-600">Loading...</div>;
  }

  return (
    <div>
      <div className="p-6">
        <div className="overflow-x-auto bg-white shadow-md rounded-lg p-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold"></h2>

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
                      className="px-4 py-3 text-left text-sm font-semibold uppercase cursor-pointer select-none"
                    >
                      <span className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}

                        {header.column.getIsSorted() === "asc" && (
                          <ChevronUp size={14} />
                        )}
                        {header.column.getIsSorted() === "desc" && (
                          <ChevronDown size={14} />
                        )}
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
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2 text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <Pagination
            table={table}
            totalCount={
              globalFilter
                ? table.getFilteredRowModel().rows.length
                : totalCount
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ReportTable;