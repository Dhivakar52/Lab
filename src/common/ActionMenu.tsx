import { useState, useEffect, useRef } from "react";
import { Menu } from "lucide-react";

type ActionMenuProps<T> = {
  item: T;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
};

export function ActionMenu<T>({
  item,
  onView,
  onEdit,
  onDelete,
}: ActionMenuProps<T>) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const menuRef = useRef<HTMLDivElement>(null);

  // ✅ CLOSE ON OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();

    setPosition({
      top: rect.bottom + 5,
      left: rect.right - 140,
    });

    setOpen((prev) => !prev);
  };

  const handleAction = (cb?: (item: T) => void) => {
    cb?.(item);
    setOpen(false);
  };

  return (
    <div ref={menuRef} className="menu-container">
      {/* BUTTON */}
      <button
        onClick={handleToggle}
        className="p-2 rounded hover:bg-gray-100"
      >
        <Menu size={18} />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div
          className="fixed w-36 bg-white border border-blue-500/20 rounded-lg shadow-lg z-[9999]"
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          {onView && (
            <button
              onClick={() => handleAction(onView)}
              className="block w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
            >
              View
            </button>
          )}

          {onEdit && (
            <button
              onClick={() => handleAction(onEdit)}
              className="block w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
            >
              Edit
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => handleAction(onDelete)}
              className="block w-full px-3 py-2 text-left hover:bg-red-50 text-red-600 text-sm"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}