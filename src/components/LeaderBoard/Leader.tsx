import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Heart, MessageCircle, Eye, Search } from "lucide-react";
import { useAuth } from "../ContextAPI/AuthContext";
import Pagination from "../Pagination";
import TopCard from "./TopCard";

const apiUrl = import.meta.env.VITE_API_URL;

interface LeaderboardItem {
  CategoryName: string;
  Name: string;
  LikesCount: number;
  CommentsCount: number;
  ViewsCount: number;
  AvgBusinessJuryScore: number;
  NoofRank: number;
}

const Leader = () => {
  const { authToken } = useAuth();

  const [data, setData] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");

  // Memoize fetch function
  const fetchLeaderboard = useCallback(async () => {
    if (!authToken) return;
    
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/api/leaderboard`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setData(res.data);
    } catch (err) {
      console.error("Leaderboard load failed", err);
    } finally {
      setLoading(false);
    }
  }, [authToken, apiUrl]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Sort data
  const sortedData = useMemo(() => {
    return [...data].sort(
      (a, b) => b.AvgBusinessJuryScore - a.AvgBusinessJuryScore
    );
  }, [data]);

  // Top 3 and table data with useMemo
  const top3 = useMemo(() => sortedData.slice(0, 3), [sortedData]);
  const tableData = useMemo(() => sortedData.slice(3), [sortedData]);

  // Columns with useMemo
  const columns = useMemo<ColumnDef<LeaderboardItem>[]>(() => [
    {
      header: "#Rank",
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        return row.index + 1 + pageIndex * pageSize + 3;
      },
    },
    {
      accessorKey: "Name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full themeColor text-white flex items-center justify-center font-semibold">
            {row.original.Name?.charAt(0) || "?"}
          </div>
          <div>
            <div className="font-medium">{row.original.Name}</div>
            <div className="text-xs text-gray-500">
              {row.original.CategoryName}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "LikesCount",
      header: "Likes",
      cell: ({ getValue }) => (
        <span className="inline-flex items-center gap-1">
          <Heart size={16} className="text-red-500" />
          {getValue<number>()}
        </span>
      ),
    },
    {
      accessorKey: "CommentsCount",
      header: "Comments",
      cell: ({ getValue }) => (
        <span className="inline-flex items-center gap-1">
          <MessageCircle size={16} className="text-blue-500" />
          {getValue<number>()}
        </span>
      ),
    },
    {
      accessorKey: "ViewsCount",
      header: "Views",
      cell: ({ getValue }) => (
        <span className="inline-flex items-center gap-1">
          <Eye size={16} />
          {getValue<number>()}
        </span>
      ),
    },
  ], []);

  // Table Setup with proper dependencies
  const table = useReactTable({
    data: tableData,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center py-6">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* HEADER + SEARCH */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Leaderboard</h1>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search leaderboard..."
            className="pl-10 pr-4 py-2 w-64 text-sm rounded-md border border-gray-300
                       focus:border-gray-300 focus:ring-0 focus:outline-none"
          />
        </div>
      </div>

      {/* TOP 3 */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {top3.map((item, index) => (
          <TopCard
            key={item.Name + index} // Better key
            rank={index === 0 ? "1st" : index === 1 ? "2nd" : "3rd"}
            name={item.Name}
            org={item.CategoryName}
          />
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                 </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 text-sm text-gray-800"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-8">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <Pagination
            table={table}
            totalCount={
              globalFilter
                ? table.getFilteredRowModel().rows.length
                : tableData.length
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Leader;