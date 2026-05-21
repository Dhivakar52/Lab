import { useState, useEffect } from "react";
import type { Table } from "@tanstack/react-table";
import { Settings } from "lucide-react";

interface Props<T> {
  table: Table<T>;
}

export default function ColumnToggle<T>({ table }: Props<T>) {
  const [open, setOpen] = useState(false);

  // close on outside click
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      
      {/* Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
      >
        <Settings size={16} />
       Show / Hide Columns
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50 p-2 space-y-1">
          
          {table.getAllLeafColumns().map((column) => {
            if (column.id === "action") return null;

            return (
              <label
                key={column.id}
                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={column.getIsVisible()}
                  onChange={column.getToggleVisibilityHandler()}
                />
                {column.id}
              </label>
            );
          })}

        </div>
      )}
    </div>
  );
}