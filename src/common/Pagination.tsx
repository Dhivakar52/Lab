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

  // 🔥 SIMPLE PAGE LOGIC (NO HEAVY LOOP)
  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between mt-4">

      {/* LEFT */}
      <div className="flex items-center gap-2 text-sm">
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

        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-3 py-1 mx-1 bg-gray-200 rounded"
        >
          ‹
        </button>

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => table.setPageIndex(p - 1)}
            className={`px-3 py-1 mx-1 rounded ${
              p === currentPage
                ? "themeColor"
                : "bg-gray-200"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-3 py-1 mx-1 bg-gray-200 rounded"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;