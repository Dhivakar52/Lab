import React from "react";

interface LikeListPopupProps {
  likedBy: any[];
  onClose: () => void;
}

const FeedLikePop: React.FC<LikeListPopupProps> = ({ likedBy, onClose }) => {

    console.log(likedBy)
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[999]" onClick={onClose}>
      <div className="bg-white w-80 rounded-xl shadow-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Liked by</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
          {likedBy.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">
              No likes yet
            </p>
          ) : (
            likedBy.map((v , index) => (
             <div
  key={index}
  className="flex items-start gap-3 bg-gray-50 p-3 rounded"
>
  <div className="w-9 h-9 bg-green-200 text-green-800 rounded-full flex items-center justify-center font-semibold">
    {v.UserName?.charAt(0).toUpperCase()}
  </div>

  <div className="flex flex-col">
    <span className="text-gray-900 text-sm font-semibold">
      {v.UserName}
    </span>

    
    <span className="text-gray-600 text-xs">
      {v.Department}
    </span>


    <span className="text-gray-800 text-sm font-medium">
      {v.Tenant}
    </span>

    {/* <span className="text-gray-500 text-xs">
      {new Date(v.ViewedAt).toLocaleString()}
    </span> */}
  </div>
</div>

            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedLikePop;
