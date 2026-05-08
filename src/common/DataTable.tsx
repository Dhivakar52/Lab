import React from "react";
import { flexRender } from "@tanstack/react-table";
import type { Table as TanTable } from "@tanstack/react-table";
import { ChevronUp, ChevronDown } from "lucide-react";

interface DataTableProps<T> {
  table: TanTable<T>;
  columns: any[];
  loading?: boolean;
  tableWrapperRef?: React.RefObject<HTMLDivElement | null>;
}

export function DataTable<T>({
  table,
  columns,
  loading = false,
  tableWrapperRef
}: DataTableProps<T>) {

  const skeletonRows = Array.from({ length: 5 });

  return (
    <div ref={tableWrapperRef} className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">

        {/* Header */}
        <thead className="bg-gray-50">
          <tr>
            {table.getHeaderGroups()[0].headers.map((header) => (
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

                  {header.column.getIsSorted() === "asc" && <ChevronUp size={14} />}
                  {header.column.getIsSorted() === "desc" && <ChevronDown size={14} />}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-gray-100">

          {/* Skeleton */}
          {loading ? (
            skeletonRows.map((_, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-4">
                    <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                  </td>
                ))}
              </tr>
            ))
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-6">
                No data found
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-4 text-sm cursor-pointer select-none">
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
    </div>
  );
}