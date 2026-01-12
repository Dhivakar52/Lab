import React from "react";

interface PaginationProps {
  table: any;
}

const Pagination: React.FC<PaginationProps> = ({ table }) => {
  if (!table || table.getPageCount() === 0) return null;

  const totalPages = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;

  const getPages = () => {
    const pages: (number | string)[] = [];
    const delta = 2; // how many pages to show around current
    let left = currentPage - delta;
    let right = currentPage + delta;

    if (left < 1) left = 1;
    if (right > totalPages) right = totalPages;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        pages.push(i);
      } else if (
        pages[pages.length - 1] !== "..." &&
        (i < left || i > right)
      ) {
        pages.push("...");
      }
    }
    return pages;
  };

  const pages = getPages();

  return (
     <div className="flex items-center justify-between gap-1 mt-4">
     
      {/* LEFT : Page info */}
      <div className="justify-right text-sm text-gray-600">
        Page <span className="font-semibold">{currentPage}</span> of{" "}
        <span className="font-semibold">{totalPages}</span>
      </div>

      <div>
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
              p === currentPage ? " themeColor text-white" : "bg-gray-200"
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
