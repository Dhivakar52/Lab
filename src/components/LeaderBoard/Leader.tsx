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
  // ❌ Search removed
// const [globalFilter, setGlobalFilter] = useState("");
  const [awardcategory, setCategory] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [totalCount, setTotalCount] = useState(0);

  // Fetch leaderboard
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

  // Fetch category
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

  // Sort
  const sortedData = useMemo(() => {
    const sorted = [...data];

    if (sortBy === "likes") {
      sorted.sort((a, b) => b.LikesCount - a.LikesCount);
    } else if (sortBy === "comments") {
      sorted.sort((a, b) => b.CommentsCount - a.CommentsCount);
    } else {
      sorted.sort((a, b) => b.AvgBusinessJuryScore - a.AvgBusinessJuryScore);
    }

    return sorted;
  }, [data, sortBy]);

  // Filter
  const filteredData = useMemo(() => {
    if (!selectedCategory) return sortedData;
    return sortedData.filter(
      (item) => item.AwardCategoryID === Number(selectedCategory)
    );
  }, [sortedData, selectedCategory]);

  // Top 3 (for cards only)
  const top3 = useMemo(() => filteredData.slice(0, 3), [filteredData]);

  // ✅ Table uses FULL data
  const tableData = useMemo(() => filteredData, [filteredData]);

  // Columns
  const columns = useMemo<ColumnDef<LeaderboardItem>[]>(() => [
    {
      header: "#Rank",
      cell: ({ row, table }) => {
        const { pageIndex, pageSize } = table.getState().pagination;
        const globalIndex = pageIndex  + row.index;
        return globalIndex + 1;
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
  ], []);

  const table = useReactTable({
    data: tableData,
    columns,
    // ❌ Removed global filter
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    table.setPageIndex(0);
  }, [selectedCategory]);

  if (loading) {
    return <div className="flex justify-center p-10">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Leaderboard</h1>

        <div className="flex gap-3 items-center">
          {/* ❌ Search removed */}
           {/* SORT DROPDOWN */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="score">Sort by Score</option>
            <option value="likes">Sort by Likes</option>
            <option value="comments">Sort by Comments</option>
          </select>

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
            score={item.AvgBusinessJuryScore}
          />
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
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
                <tr key={row.id} className="hover:bg-gray-50 border-gray-200">
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

          <Pagination
            table={table}
            totalCount={totalCount}
          />        </div>
      </div>
    </div>
  );
};

export default Leader;
