import  { useEffect, useMemo, useState, useCallback, useRef } from "react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Heart, MessageCircle, Eye, Users, ArrowUpDown } from "lucide-react";
import { useAuth } from "../ContextAPI/AuthContext";
import Pagination from "../Pagination";

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
  AvatarUrl?: string;
}

interface CategoryData {
  CategoryName: string;
  AwardCategoryID: number;
}

// Color palette - using the specified gradient colors
const themeColors = {
  primary: '#08605e',
  primaryLight: '#0a7a6e',
  secondary: '#1861ae',
  secondaryLight: '#1e7ad4',
  accent: '#f59e0b',
  success: '#10b981',
  background: '#f8fafc',
  cardBg: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  gold: '#fbbf24',
  silver: '#94a3b8',
  bronze: '#cd7f32'
};

const gradientStyle = {
  background: 'linear-gradient(90deg, rgb(8, 128, 94) 16%, rgb(24, 97, 174) 100%)'
};


const Leader = () => {
  const { authToken } = useAuth();

  const [data, setData] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [awardcategory, setCategory] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [_totalCount, setTotalCount] = useState(0);
  const [animateRows, setAnimateRows] = useState<number[]>([]);
  const tableWrapperRef = useRef<HTMLDivElement | null>(null);

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

      // Animate first 3 rows on load
      setTimeout(() => {
        setAnimateRows([0, 1, 2]);
        setTimeout(() => setAnimateRows([]), 600);
      }, 100);
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
  if (awardcategory.length > 0 && data.length > 0) {
    const counts = data.reduce((acc, item) => {
      acc[item.AwardCategoryID] = (acc[item.AwardCategoryID] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const highestCategory = Object.entries(counts).sort(
      (a, b) => Number(b[1]) - Number(a[1])
    )[0];

    if (highestCategory) {
      setSelectedCategory(highestCategory[0]);
    }
  }
}, [awardcategory, data]);
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
    } else if (sortBy === "views") {
      sorted.sort((a, b) => b.ViewsCount - a.ViewsCount);
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

  // Table uses FULL data
  const tableData = useMemo(() => filteredData, [filteredData]);

  // Columns with sorting
  const columns = useMemo<ColumnDef<LeaderboardItem>[]>(() => [
    {
      accessorKey: "NoofRank",
      header: "#Rank",
      cell: ({ row }) => {
        const rank = row.index + 1;
        const isAnimating = animateRows.includes(row.index);

        let rankColor = themeColors.textSecondary;
        let rankBg = '#f1f5f9';
       
        return (
          <div className="flex justify-center">
            <span
              className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg transition-all duration-300 ${isAnimating ? 'scale-110 bg-opacity-80' : 'scale-100'}`}
              style={{ backgroundColor: rankBg, color: rankColor }}
            >
              {rank}
            </span>
          </div>
        );
      },
    },
    // {
    //   accessorKey: "Name",
    //   id: "Name",
    //   header: "Participant",
    //   cell: ({ row }) => {
    //     const rank = row.index + 1;
    //     const isAnimating = animateRows.includes(row.index);

    //     return (
    //       <div className={`flex items-center gap-3 transition-all duration-500 ${isAnimating ? 'translate-x-2' : 'translate-x-0'}`}>
    //         <div 
    //           className="w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-white shadow-md relative"
    //           style={gradientBg}
    //         >
    //           {row.original.Name?.charAt(0) || "?"}
    //           {rank === 1 && (
    //             <div className="absolute -top-1 -right-1">
    //               <Sparkles size={10} className="text-yellow-400 animate-pulse" />
    //             </div>
    //           )}
    //         </div>
    //         <div>
    //           <div className="font-semibold text-gray-800">{row.original.Name}</div>
    //           <div className="text-xs" style={{ color: themeColors.textSecondary }}>
    //             {row.original.CategoryName}
    //           </div>
    //         </div>
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: "Name",
      id: "Name",
      header: "Participant",
      cell: ({ row }) => {
       // const rank = row.index + 1;
        const isAnimating = animateRows.includes(row.index);

        return (
          <div
            className={`flex items-center gap-3 transition-all duration-500 ${isAnimating ? "translate-x-2" : "translate-x-0"
              }`}
          >
            {/* Avatar same like header */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-base shrink-0"
              style={{
                background:
                  "linear-gradient(90deg, rgb(8,128,94) 16%, rgb(24,97,174) 100%)",
              }}
            >
              {row.original.Name?.trim().charAt(0).toUpperCase()}
            </div>

            {/* Name + Category */}
            <div>
              <div className="font-semibold text-gray-800">
                {row.original.Name}
              </div>
              <div
                className="text-xs"
                style={{ color: themeColors.textSecondary }}
              >
                {row.original.CategoryName}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "AvgBusinessJuryScore",
      id: "AvgBusinessJuryScore",
      header: "Jury Score",
      cell: ({ row }) => {
        const rank = row.index + 1;
        const isAnimating = animateRows.includes(row.index);

        return (
          <div className="text-center">
            <span
              className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-bold text-sm transition-all duration-500 ${isAnimating ? 'scale-110' : 'scale-100'}`}
              style={{
                background: rank === 0 ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : 'linear-gradient(90deg, rgb(8, 128, 94) 16%, rgb(24, 97, 174) 100%)',
                color: 'white'
              }}
            >
              {/* {rank === 1 && <Trophy size={12} className="mr-1" />} */}
              {row.original.AvgBusinessJuryScore?.toFixed(2) || '0.00'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "LikesCount",
      id: "LikesCount",
      header: "Likes",
      cell: ({ row }) => {
        const isAnimating = animateRows.includes(row.index);

        return (
          <div className={`flex items-center justify-center gap-2 transition-all duration-500 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
            <Heart size={18} style={{ color: '#ef4444' }} fill="#fee2e2" />
            <span className="font-semibold text-gray-700">{row.original.LikesCount}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "CommentsCount",
      id: "CommentsCount",
      header: "Comments",
      cell: ({ row }) => {
        const isAnimating = animateRows.includes(row.index);

        return (
          <div className={`flex items-center justify-center gap-2 transition-all duration-500 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
            <MessageCircle size={18} style={{ color: themeColors.primary }} />
            <span className="font-semibold text-gray-700">{row.original.CommentsCount}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "ViewsCount",
      id: "ViewsCount",
      header: "Views",
      cell: ({ row }) => {
        const isAnimating = animateRows.includes(row.index);

        return (
          <div className={`flex items-center justify-center gap-2 transition-all duration-500 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
            <Eye size={18} style={{ color: themeColors.textSecondary }} />
            <span className="font-semibold text-gray-700">{row.original.ViewsCount}</span>
          </div>
        );
      },
    },
  ], [animateRows]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    table.setPageIndex(0);
  }, [selectedCategory, sortBy]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div
          className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: `${themeColors.primary} transparent ${themeColors.primary} transparent` }}
        ></div>
        <p className="mt-4 text-gray-500">Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: themeColors.background }}>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section with Gradient */}
        <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
          <div className="p-3" style={gradientStyle}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Leaderboard
                </h1>
                <p className="text-sm mt-1 text-white/80">
                  Top performers and their achievements
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none px-4 py-2 pr-10 rounded-xl text-sm font-medium border border-white/20 focus:outline-none focus:ring-2 transition-all cursor-pointer bg-white/10 text-white"
                  >
                    <option value="score" className="text-gray-800">Sort by Score</option>
                    <option value="likes" className="text-gray-800">Sort by Likes</option>
                    <option value="comments" className="text-gray-800">Sort by Comments</option>
                    <option value="views" className="text-gray-800">Sort by Views</option>
                  </select>
                  <ArrowUpDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/70" />
                </div>

                {/* Category Filter */}
           <select
  value={selectedCategory}
  onChange={(e) => setSelectedCategory(e.target.value)}
  className="px-4 py-2 rounded-xl text-sm font-medium border border-white/20 focus:outline-none focus:ring-2 transition-all cursor-pointer bg-white/10 text-white"
>
  {awardcategory
    .slice()
    .sort((a, b) => a.CategoryName.localeCompare(b.CategoryName))
    .map((cat) => (
      <option
        key={cat.AwardCategoryID}
        value={cat.AwardCategoryID}
        className="text-gray-800"
      >
        {cat.CategoryName}
      </option>
    ))}
</select>
              </div>
            </div>
          </div>
        </div>

        {/* TOP 3 Cards with animations */}
        {top3.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {top3.map((item, index) => {
              let rankLabel = index === 0 ? "1st" : index === 1 ? "2nd" : "3rd";
              let rankColor = index === 0 ? themeColors.gold : index === 1 ? themeColors.silver : themeColors.bronze;
             // let rankIcon = index === 0 ? <Crown size={28} /> : index === 1 ? <Medal size={28} /> : <Award size={28} />;

              return (
                <div
                  key={item.Name + index}
                  className="bg-white rounded-2xl shadow-lg border overflow-hidden transition-all duration-500 hover:scale-[1.02] animate-fade-in-up"
                  style={{
                    borderColor: themeColors.border,
                    animation: `slideUp 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">

                      <div className="flex items-center gap-3">

                        {/* Avatar same like header */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-base shrink-0"
                          style={{
                            background:
                              "linear-gradient(90deg, rgb(8,128,94) 16%, rgb(24,97,174) 100%)",
                          }}
                        >
                          {item.Name?.trim().charAt(0).toUpperCase()}
                        </div>

                        {/* Name */}
                        <div>
                          <div
                            className="text-xl font-bold"
                            style={{ color: themeColors.textPrimary }}
                          >
                            {item.Name}
                          </div>
                        </div>

                      </div>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg animate-pulse"
                        style={{ backgroundColor: rankColor }}
                      >
                        {/* {rankIcon} */}
                        {rankLabel}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm" style={{ color: themeColors.textSecondary }}>
                        <Users size={16} />
                        <span>{item.CategoryName}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span
                          className="text-3xl font-bold bg-gradient-to-r from-[rgb(8,128,94)] to-[rgb(24,97,174)] bg-clip-text text-transparent"
                        >
                          {item.AvgBusinessJuryScore?.toFixed(2) || '0'}
                        </span>
                        <span className="text-sm" style={{ color: themeColors.textSecondary }}>scores</span>
                      </div>
                      <div className="flex gap-4 pt-2">
                        <div className="flex items-center gap-1">
                          <Heart size={14} className="text-red-400" />
                          <span className="text-sm font-medium">{item.LikesCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle size={14} style={{ color: themeColors.primary }} />
                          <span className="text-sm font-medium">{item.CommentsCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye size={14} style={{ color: themeColors.textSecondary }} />
                          <span className="text-sm font-medium">{item.ViewsCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="h-1"
                    style={gradientStyle}
                  ></div>
                </div>
              );
            })}
          </div>
        )}


        {/* Table Section */}
        <div className="rounded-2xl shadow-lg overflow-hidden bg-white" style={{ borderColor: themeColors.border }}>
          {/* Table Header with Gradient */}
          <div className="px-6 py-3" style={gradientStyle}>
            <h2 className="text-white font-semibold">Rankings</h2>
          </div>

          {/* Table */}
          <div ref={tableWrapperRef} className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      // <th
                      //   key={header.id}
                      //   className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider"
                      //   style={{ color: themeColors.textSecondary }}
                      // >
                      <th
                        key={header.id}
                        className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider ${header.id === "Name" ? "text-left" : "text-center"
                          }
                            `}
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

              <tbody className="divide-y divide-gray-100">
                {table.getRowModel().rows.map((row, idx) => {
                  const rank = idx + 1;
                  const isTopRank = rank === 1 || rank === 2 || rank === 3;
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-gray-50 transition-all duration-300 ${isTopRank ? 'bg-gradient-to-r from-yellow-50/50 to-transparent' : ''}`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 text-sm"
                          style={{ color: themeColors.textPrimary }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {tableData.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Users size={32} style={{ color: themeColors.textSecondary }} />
              </div>
              <p className="text-gray-500">No participants found</p>
            </div>
          )}

          {/* Pagination */}
          {tableData.length > 0 && (
            <div className="px-6 py-4 border-t" style={{ borderColor: themeColors.border }}>
              <Pagination
                table={table}
                // totalCount={totalCount}
                 totalCount={tableData.length}
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pop {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.3);
          }
          100% {
            transform: scale(1);
          }
        }
        
        .animate-fade-in-up {
          animation: slideUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Leader;