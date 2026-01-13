import React, { useEffect, useState } from "react";
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
   editCategoryId: number | null;
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
   editCategoryId,
}) => {
  // Local validation state (safe)
  const [showError, setShowError] = useState(false);

  const [errors, setErrors] = useState({
  categoryName: false,
  categoryCode: false,
});

  useEffect(() => {
    if (isOpen) {
      document.getElementById("categoryName")?.focus();
      setShowError(false); // reset error when open
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Wrapper – onSave unchanged
  const handleSave1 = () => {
    if (!categoryName.trim() || !categoryCode.trim()) {
      setShowError(true);
      return;
    }

    setShowError(false);
    onSave(); // original save flow
  };
  const handleSave = () => {
  const newErrors = {
    categoryName: !categoryName.trim(),
    categoryCode: !categoryCode.trim(),
  };

  setErrors(newErrors);

  if (newErrors.categoryName || newErrors.categoryCode) {
    return;
  }

  onSave();
};

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
          <h2 className="text-lg font-semibold"> {editCategoryId ? "Edit Category" : "Add New Category"}</h2>
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
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Category Name<span className="text-red-600">*</span>
            </label>
            {/* <input
              id="categoryName"
              value={categoryName}
               maxLength={200}
               autoComplete="off"
              onChange={(e) => {
                setCategoryName(e.target.value);
                if (showError) setShowError(false);
              }}
              className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm 
                 focus:outline-none focus:ring-0 focus:border-gray-300 ${
                showError && !categoryName.trim()
                  ? "border-red-500"
                  : ""
              }`}
              placeholder="Enter category name"
            />
            {showError && !categoryName.trim() && (
              <p className="text-red-500 text-xs mt-1">
                Category Name is required
              </p>
            )} */}
            <input
                    id="categoryName"
                    value={categoryName}
                    maxLength={200}
                    autoComplete="off"
                    onChange={(e) => {
                        setCategoryName(e.target.value);
                        setErrors((prev) => ({ ...prev, categoryName: false }));
                    }}
                    className={`w-full border rounded-md px-3 py-2 text-sm
                        focus:outline-none focus:ring-0 focus:border-gray-300
                        ${errors.categoryName ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Enter category name"
                    />

                    {errors.categoryName && (
                    <p className="text-red-500 text-xs mt-1">
                        Category Name is required
                    </p>
                    )}

          </div>

          {/* Category Code */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Category Code<span className="text-red-600">*</span>
            </label>
            {/* <input
              id="categoryCode"
              value={categoryCode}
               maxLength={50}
               autoComplete="off"
              onChange={(e) => {
                setCategoryCode(e.target.value);
                if (showError) setShowError(false);
              }}
              className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                 focus:outline-none focus:ring-0 focus:border-gray-300 ${
                showError && !categoryCode.trim()
                  ? "border-red-500"
                  : ""
              }`}
              placeholder="Enter category code"
            />
            {showError && !categoryCode.trim() && (
              <p className="text-red-500 text-xs mt-1">
                Category Code is required
              </p>
            )} */}
            <input
                   id="categoryCode"
                    value={categoryCode}
                    maxLength={50}
                    autoComplete="off"
                    onChange={(e) => {
                        setCategoryCode(e.target.value);
                        setErrors((prev) => ({ ...prev, categoryCode: false }));
                    }}
                    className={`w-full border rounded-md px-3 py-2 text-sm
                        focus:outline-none focus:ring-0 focus:border-gray-300
                        ${errors.categoryCode ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Enter category code"
                    />

                    {errors.categoryCode && (
                    <p className="text-red-500 text-xs mt-1">
                        Category Code is required
                    </p>
                    )}

          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            {/* <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="Enter description"
            /> */}
             <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    maxLength={500}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                            focus:outline-none focus:ring-0 focus:border-gray-300"
                    placeholder="Enter description"
                />

                <div className="text-xs text-gray-500 text-left mt-1">
                    {description.length} / 500 characters
                </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4  bg-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm themeColor  text-white rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default AddCategoryPanel;
