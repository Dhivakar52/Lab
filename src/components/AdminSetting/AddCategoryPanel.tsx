import React, { useEffect } from "react";
import { X } from "lucide-react";



interface Props {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  setCategoryName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  categoryCode: string;
  setCategoryCode: (v: string) => void;
  onSave: () => void;
}

const AddCategoryPanel: React.FC<Props> = ({
  isOpen,
  onClose,
  categoryName,
  setCategoryName,
  categoryCode,
  description,
  setDescription,
  setCategoryCode,
  onSave,
}) => {
  useEffect(() => {
    if (isOpen) {
      // When the panel is opened, focus the first input field
      document.getElementById("categoryName")?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        role="button"
        aria-label="Close panel"
      />

      {/* Side Panel */}
      <div className="fixed top-0 right-0 h-full w-[400px] bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Add Category</h2>
          
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 flex-1">
          <div>
            <label htmlFor="categoryName" className="block text-sm font-medium mb-1">
              Category Name<span className="text-red-600">*</span>
            </label>
            <input
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full  border rounded-md px-3 py-2 text-sm"
              placeholder="Enter category name"
              required
            />
          </div>
           <div>
            <label htmlFor="categorycode" className="block text-sm font-medium mb-1">
              Category Code<span className="text-red-600"></span>
            </label>
            <input
              id="categoryCode"
              value={categoryCode}
              onChange={(e) => setCategoryCode(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Enter category code"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Enter description"
              required
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md"
            aria-label="Save category"
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default AddCategoryPanel;
