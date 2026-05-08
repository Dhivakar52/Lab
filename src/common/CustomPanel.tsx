import React from "react";

interface CustomPanel {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
  saveLabel?: string;
}

const CustomPanel: React.FC<CustomPanel> = ({
  isOpen,
  title,
  onClose,
  onSave,
  children,
  saveLabel = "Save",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex justify-end"  onClick={onClose}>
      <div className="w-[560px] bg-white h-full shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center py-3 px-6 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400
                      hover:text-gray-600 hover:bg-gray-50 transition">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {children}
        </div>
        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 text-sm text-white rounded-lg themeColor">
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomPanel;