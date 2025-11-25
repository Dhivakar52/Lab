import React from "react";
import { Eye, MessageCircle } from "lucide-react";
import FeedLikeComponent from "./FeedLikeComponent";
import FeedComment from "./FeedComment";

interface Props {
  post: any;
  open: boolean;
  onClose: () => void;

  // NEW props passed from PostCard
  onLike: (post: any) => void;
  onComment: (post: any) => void;
onReply: (postId: number, text: string, parentId: number) => Promise<void>;


  comments: any[];
  commentText: any;
  setCommentText: any;

  userId: number | null;
  likeList: any[];
}

const getLikeText = (likedByList: any[], currentUserId: number | null) => {
  if (!likedByList || likedByList.length === 0) return "0 Likes";

  const isLikedByYou = likedByList.some(l => l.UserID === currentUserId);

  if (isLikedByYou) {
    const others = likedByList.length - 1;
    if (others === 0) return "You liked this";
    return `You & ${others} others`;
  }

  const firstUser = likedByList[0]?.UserName || "Someone";
  const others = likedByList.length - 1;

  if (others <= 0) return `${firstUser} liked this`;
  return `${firstUser} & ${others} others`;
};

const PostFeedModal: React.FC<Props> = ({
  post,
  open,
  onClose,

  onLike,
  onComment,
  onReply,

  comments,
  commentText,
  setCommentText,
  userId
}) => {
  if (!open || !post) return null;

  const isLiked = post.LikedBy?.some((l: any) => l.UserID === userId);

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-11/12 sm:w-3/4 lg:w-1/2 p-6 relative overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex space-x-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
            {post.Nominee?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">
              {post.Nominee}
            </h3>
            <p className="text-sm text-gray-600">{post.Tenant}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-800 mt-4 text-sm leading-relaxed">
          {post.Description}
        </p>

        {/* Like text line */}
        <div className="flex justify-between border-b border-gray-200 mt-4 py-3">
          <span className="text-sm font-medium">
            {getLikeText(post.LikedBy || [], userId)}
          </span>
        </div>

        {/* Like / Comment / Views EXACT same UI */}
        <div className="flex justify-between mt-4 pt-3">
          <div className="flex items-center space-x-6">
            <FeedLikeComponent
              post={post}
              isLiked={isLiked}
              onLike={() => onLike(post)}
            />

            <button
              className="flex items-center space-x-2 text-gray-500"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.Comments} Comments</span>
            </button>
          </div>

          <div className="flex items-center text-gray-500">
            <Eye className="w-4 h-4 mr-1" />
            <span>{post.Views || 0} Views</span>
          </div>
        </div>

        {/* Comments Section SAME LIKE POST CARD */}
        <FeedComment
          post={post}
          username={post.username}
          comments={comments}
          commentText={commentText[post.NominationID] || ""}
          setCommentText={(v: string) =>
            setCommentText((prev: any) => ({
              ...prev,
              [post.NominationID]: v
            }))
          }
          handleAddComment={() => onComment(post)}
          handleReply={onReply}
        />
      </div>
    </div>
  );
};

export default PostFeedModal;
