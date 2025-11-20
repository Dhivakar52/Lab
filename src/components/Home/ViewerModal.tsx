import React from "react";

interface Viewer {
  NominationID: number;
  TotalRowCount: number;
  ViewedBy: string;
  ViewedAt: string;
}

interface ViewersModalProps {
  open: boolean;
  onClose: () => void;
  viewers: Viewer[];
}

const ViewerModal: React.FC<ViewersModalProps> = ({ open, onClose, viewers }) => {
  return (
    <div
      className={`${open ? "fixed" : "hidden"} inset-0 bg-black/30 flex items-center justify-center z-[999]`}
      onClick={onClose}   // CLOSE WHEN CLICKED OUTSIDE
    >
      <div
        className="bg-white w-80 rounded-xl shadow-lg p-4"
        onClick={(e) => e.stopPropagation()} // ❗ PREVENT CLOSE WHEN CLICK INSIDE
      >
        <h2 className="text-lg font-semibold mb-3">Viewed By</h2>

        {/* Scroll only here */}
        <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
          {viewers.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-4">
              No viewers yet
            </p>
          ) : (
            viewers.map((v, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-gray-50 p-2 rounded"
              >
                <div className="w-9 h-9 bg-green-200 text-green-800 rounded-full flex items-center justify-center font-semibold">
                  {v.ViewedBy?.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-800 text-sm font-medium">
                  {v.ViewedBy}
                </span>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-200 py-2 rounded-lg hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewerModal;
