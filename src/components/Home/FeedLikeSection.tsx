import React from "react";
import { Heart } from "lucide-react";

interface Props {
  isLiked: boolean;
  likeCount: number;
  likeText: string;
  onLike: () => void;
}

const FeedLikeSection: React.FC<Props> = ({ isLiked, likeCount, likeText, onLike }) => {
  return (
    <div className="flex items-center space-x-6">
      <span className="text-sm font-medium">{likeText}</span>

      <button
        onClick={onLike}
        className={`flex items-center space-x-2 ${
          isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
        }`}
      >
        <Heart className="w-4 h-4" fill={isLiked ? "red" : "none"} />
        <span className="text-sm font-medium">{likeCount} Likes</span>
      </button>
    </div>
  );
};

export default FeedLikeSection;
