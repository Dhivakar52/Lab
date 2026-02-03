// LikeSection.tsx
import React from "react";
import { Heart } from "lucide-react";

interface LikeSectionProps {
  post: any;
  isLiked: boolean;
  onLike: () => void;
}

const FeedLikeComponent: React.FC<LikeSectionProps> = ({ post, isLiked, onLike }) => {
  return (
    <button
      onClick={onLike}
      className={`flex items-center space-x-2 ${
        isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
      }`}
    >
      <Heart className="w-4 h-4" fill={isLiked ? "red" : "none"} />
      <span className="text-sm font-medium">
        {/* {post.LikedBy?.length || 0} Likes */}
      </span>
    </button>
  );
};

export default FeedLikeComponent;
