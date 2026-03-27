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
  TotalRowCount: number;
  AwardCategoryID: number;
}

interface CategoryData {
  CategoryName: string;
  AwardCategoryID: number;
}

const Leader = () => {
  const { authToken } = useAuth();

  const [data, setData] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [awardcategory, setCategory] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [totalCount, setTotalCount] = useState(0); 

  // ✅ Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    if (!authToken) return;

    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/api/leaderboard`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setData(res.data);
      setTotalCount(res.data[0]?.TotalRowCount || 0);
    } catch (err) {
      console.error("Leaderboard load failed", err);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  // ✅ Fetch category
  const fetchCategory = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/awardCategory`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setCategory(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    fetchCategory();
  }, [fetchLeaderboard]);

  // ✅ Sort
  const sortedData = useMemo(() => {
    return [...data].sort(
      (a, b) => b.AvgBusinessJuryScore - a.AvgBusinessJuryScore
    );
  }, [data]);

  // ✅ Filter
  const filteredData = useMemo(() => {
    if (!selectedCategory) return sortedData;
    return sortedData.filter(
      (item) => item.AwardCategoryID === Number(selectedCategory)
    );
  }, [sortedData, selectedCategory]);

  // ✅ Top3 + Table
  const top3 = useMemo(() => filteredData.slice(0, 3), [filteredData]);
  const tableData = useMemo(() => filteredData.slice(3), [filteredData]);

  // Columns
  const columns = useMemo<ColumnDef<LeaderboardItem>[]>(() => [
    {
      header: "#Rank",
      cell: ({ row, table }) => {
      //   const pageIndex = table.getState().pagination.pageIndex;
      //   const pageSize = table.getState().pagination.pageSize;
      //  // return  pageSize + row.index + 1 + top3.length;
      //    const globalRowIndex = (pageIndex ) + row.index;
      //    return -1+ globalRowIndex + 1 + top3.length;
      const { pageIndex, pageSize } = table.getState().pagination;

      const globalIndex = pageIndex   + row.index;

      // ✅ FIXED RANK
      return globalIndex + 4;
      },
    },
    {
      accessorKey: "Name",
      id: "Name", 
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
      header: "Business Jury Score",
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.original.AvgBusinessJuryScore}
        </div>
      ),
    },
    {
      accessorKey: "LikesCount",
      header: "Likes",
      cell: ({ getValue }) => (
        <span className="inline-flex items-center justify-center gap-1 w-full">
          <Heart size={16} className="text-red-500" />
          {getValue<number>()}
        </span>
      ),
    },
    {
      accessorKey: "CommentsCount",
      header: "Comments",
      cell: ({ getValue }) => (
        <span className="inline-flex items-center justify-center gap-1 w-full">
          <MessageCircle size={16} className="text-blue-500" />
          {getValue<number>()}
        </span>
      ),
    },
    {
      accessorKey: "ViewsCount",
      header: "Views",
      cell: ({ getValue }) => (
        <span className="inline-flex items-center justify-center gap-1 w-full">
          <Eye size={16} />
          {getValue<number>()}
        </span>
      ),
    },
  ], [top3.length]);

  // ✅ Table
  const table = useReactTable({
    data: tableData,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // ✅ Reset page on filter change
  useEffect(() => {
    table.setPageIndex(0);
  }, [selectedCategory]);

  if (loading) {
    return <div className="flex justify-center p-10">Loading...</div>;
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Leaderboard</h1>

        <div className="flex gap-3 items-center">
          {/* SEARCH */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          {/* DROPDOWN */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Categories</option>
            {awardcategory.map((cat) => (
              <option key={cat.AwardCategoryID} value={cat.AwardCategoryID}>
                {cat.CategoryName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TOP 3 */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {top3.map((item, index) => (
          <TopCard
            key={item.Name + index}
            rank={index === 0 ? "1st" : index === 1 ? "2nd" : "3rd"}
            name={item.Name}
            org={item.CategoryName}
          />
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full ">
            <thead className="bg-gray-50 border border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`px-6 py-4 text-xs font-semibold uppercase ${
                        header.id === "Name"
                          ? "text-left"
                          : "text-center"
                      }`}
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
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition border-gray-200">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-6 py-4 text-sm ${
                        cell.column.id === "Name"
                          ? "text-left"
                          : "text-center"
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION */}
          
           <Pagination  table={table}  totalCount={ globalFilter  ? table.getFilteredRowModel().rows.length : totalCount }  />
        </div>
      </div>
    </div>
  );
};

export default Leader;