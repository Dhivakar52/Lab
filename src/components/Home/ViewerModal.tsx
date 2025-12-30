import React from "react";

import {Trophy } from "lucide-react";  

interface Viewer {
  NominationID: number;
  Department: string;
  Tenant : string;
  TotalRowCount: number;
  ViewedBy: string;
  ViewedAt: string;
}

interface ViewersModalProps {
  open: boolean;
  onClose: () => void;
  viewers: Viewer[];
  post: any;
  item:any;
}

const ViewerModal: React.FC<ViewersModalProps> = ({ open, onClose, viewers, post , item }) => {

  if (!open || !post) return null;
  return (
    <div
      className={`${open ? "fixed" : "hidden"} inset-0 bg-black/30 flex items-center justify-center z-[999]`}
      onClick={onClose}
    >
      <div
        className="bg-white w-80 rounded-xl shadow-lg p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            {post.Nominee || item.Nominee } - <span className="mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                          <Trophy size={14} /> {post.AwardCategory || item.AwardCategory}
                        </span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
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
  className="flex items-start gap-3 bg-gray-50 p-3 rounded"
>
  <div className="w-9 h-9 bg-green-200 text-green-800 rounded-full flex items-center justify-center font-semibold">
    {v.ViewedBy?.charAt(0).toUpperCase()}
  </div>

  <div className="flex flex-col">
    <span className="text-gray-900 text-sm font-semibold">
      {v.ViewedBy}
    </span>

    
    <span className="text-gray-600 text-xs">
      {v.Department}
    </span>


    <span className="text-gray-800 text-sm font-medium">
      {v.Tenant}
    </span>

    <span className="text-gray-500 text-xs">
      {new Date(v.ViewedAt).toLocaleString()}
    </span>
  </div>
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
