// src/components/PostDetailsModal.tsx
import React from "react";
import type { Feed } from "../../dataTypes/nomination";

interface Props {
  post: Feed | null;
  open: boolean;
  onClose: () => void;
}

const PostFeedModal: React.FC<Props> = ({ post, open, onClose }) => {
  if (!open || !post) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-11/12 sm:w-2/3 lg:w-1/2 p-6 relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-3">{post.Nominee}</h2>

        <p className="text-gray-600 mb-2">
          <strong>Tenant:</strong> {post.Tenant}
        </p>

        <p className="text-gray-600 mb-2">
          <strong>Award:</strong> {post.AwardCategory}
        </p>

        <p className="text-gray-700 leading-relaxed mt-4">
          {post.Description}
        </p>

        <div className="mt-4 text-sm text-gray-500">
          <p>👍 Likes: {post.LikedBy?.length || 0}</p>
          <p>💬 Comments: {post.Comments}</p>
          <p>👁 Views: {post.Views}</p>
        </div>

      </div>
    </div>
  );
};

export default PostFeedModal;
