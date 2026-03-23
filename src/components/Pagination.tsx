import React from "react";

interface PaginationProps {
  table: any;
  totalCount: number;
  isFiltered?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  table,
  totalCount,
  isFiltered = false,
}) => {
  if (!table) return null;

  const { pageIndex, pageSize } = table.getState().pagination;
  const currentPage = pageIndex + 1;

  // ✅ current rows in table
  const currentRows = table.getRowModel().rows.length;

  // 🔥 MAIN FIX
  const finalTotal = isFiltered ? currentRows : totalCount;

  const totalPages = Math.ceil(finalTotal / pageSize);

  if (totalPages === 0) return null;

  const start = currentRows === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, finalTotal);

  // ✅ Page number logic
  const getPages = () => {
    const pages: (number | string)[] = [];
    const delta = 2;

    let left = currentPage - delta;
    let right = currentPage + delta;

    if (left < 1) left = 1;
    if (right > totalPages) right = totalPages;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }

    return pages;
  };

  const pages = getPages();

  return (
    <div className="flex items-center justify-between mt-4">

      {/* LEFT */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="text-sm text-gray-600 me-3">
          Showing <span className="font-semibold">{start}</span> to{" "}
          <span className="font-semibold">{end}</span> of{" "}
          <span className="font-semibold">{finalTotal}</span> entries
        </div>

        <select
          value={pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
            table.setPageIndex(0); // reset page
          }}
          className="border rounded px-2 py-1"
        >
          {[10, 25, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* RIGHT */}
      <div className="flex items-center">

        {/* Previous */}
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-3 py-1 mx-1 rounded bg-gray-200 disabled:opacity-50"
        >
          ‹
        </button>

        {/* Page numbers */}
        {pages.map((p, idx) =>
          p === "..." ? (
            <span key={idx} className="px-2 py-1 mx-1">
              ...
            </span>
          ) : (
            <button
              key={idx}
              onClick={() => table.setPageIndex(Number(p) - 1)}
              className={`px-3 py-1 mx-1 rounded ${
                p === currentPage
                  ? "themeColor text-white"
                  : "bg-gray-200"
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-3 py-1 mx-1 rounded bg-gray-200 disabled:opacity-50"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;