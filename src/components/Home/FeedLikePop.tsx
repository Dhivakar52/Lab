import React from "react";

interface LikeListPopupProps {
  likedBy: any[];
  onClose: () => void;
}

const FeedLikePop: React.FC<LikeListPopupProps> = ({ likedBy, onClose }) => {
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
            likedBy.map((u) => (
              <div
                key={u.NominationLikeID}
                className="flex items-center p-2  bg-gray-50"
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  {u.UserName?.charAt(0).toUpperCase()}
                </div>
                <span className="ml-3 text-sm font-medium text-gray-800">
                  {u.UserName}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedLikePop;
