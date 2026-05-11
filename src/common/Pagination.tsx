import React from "react";

interface PaginationProps {
  table: any;
  totalCount: number;
}

const Pagination: React.FC<PaginationProps> = ({ table, totalCount }) => {
  if (!table) return null;

  const { pageIndex, pageSize } = table.getState().pagination;
  const currentPage = pageIndex + 1;
  const totalPages = Math.ceil(totalCount / pageSize) || 0;

  if (totalPages === 0) return null;

  const start = pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, totalCount);

  // ✅ Ellipsis Pagination Logic
  const getPages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 2;

    // 👉 First pages (1,2,3)
    for (let i = 1; i <= Math.min(maxVisible, totalPages); i++) {
      pages.push(i);
    }

    // 👉 Show dots after first block
    if (currentPage > 4 && totalPages > 6) {
      pages.push("...");
    }

    // 👉 Middle current page (if not near start/end)
    if (currentPage > 3 && currentPage < totalPages - 2) {
      pages.push(currentPage);
    }

    // 👉 Show dots before last
    if (currentPage < totalPages - 3 && totalPages > 6) {
      pages.push("...");
    }

    // 👉 Last page
    if (totalPages > maxVisible) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPages();

  return (
    <div className="flex items-center justify-between mt-4">

      {/* LEFT */}
      <div className="flex items-center gap-3 text-sm">
        <div>
          Showing <b>{start}</b> to <b>{end}</b> of <b>{totalCount}</b>
        </div>

        <select
          value={pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
            table.setPageIndex(0);
          }}
          className="border px-2 py-1 rounded"
        >
          {[10, 25, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* RIGHT */}
      <div className="flex items-center">

        {/* Prev */}
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-3 py-1 mx-1 bg-gray-200 rounded disabled:opacity-50"
        >
          ‹
        </button>

        {/* Pages */}
        {pages.map((p, index) => {
          if (p === "...") {
            return (
              <span key={index} className="px-2">
                ...
              </span>
            );
          }

          return (
            <button
              key={p}
              onClick={() => table.setPageIndex(Number(p) - 1)}
              className={`px-3 py-1 mx-1 rounded ${
                p === currentPage
                  ? "themeColor text-white"
                  : "bg-gray-200"
              }`}
            >
              {p}
            </button>
          );
        })}

        {/* Next */}
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-3 py-1 mx-1 bg-gray-200 rounded disabled:opacity-50"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;