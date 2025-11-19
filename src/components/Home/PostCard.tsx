import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal, Eye, Send, Image } from "lucide-react";
import axios from "axios";
import type { Feed } from "../../dataTypes/nomination";
import { useAuth } from "../ContextAPI/AuthContext";

interface PostCardProps {
  posts: Feed[];
  setPosts: React.Dispatch<React.SetStateAction<Feed[]>>;
}

// 🔥 Remove duplicate likes by UserID
const removeDuplicateLikes = (likes: any[]) => {
  const map = new Map();
  likes?.forEach((l) => map.set(l.UserID, l));
  return Array.from(map.values());
};

const getLikeText = (likedByList: any[], currentUserId: number | null) => {
  if (!likedByList || likedByList.length === 0) return "0 Likes";

  // Check if current user already liked this post
  const isLikedByYou = likedByList.some(user => user.UserID === currentUserId);

  if (isLikedByYou) {
    const others = likedByList.length - 1;
    if (others === 0) return "You liked this";
    return `You & ${others} others`;
  }

  // Not liked by you — show normal text
  const firstUser = likedByList[0]?.UserName || "Someone";
  const others = likedByList.length - 1;

  if (others <= 0) return `${firstUser} liked this`;
  return `${firstUser} & ${others} others`;
};


const PostCard: React.FC<PostCardProps> = ({ posts, setPosts }) => {
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});
  const { authToken, userId ,username } = useAuth();

  useEffect(() => {
    const liked = posts
      .filter((p) =>
        p.LikedBy?.some((like: any) => like.UserID === userId)
      )
      .map((p) => p.NominationID);

    setLikedPosts(liked);
  }, [posts, userId]);

  const handleLike = async (post: Feed) => {
    const NominationID = post.NominationID;
    const isLiked = likedPosts.includes(NominationID);

    const headers = {
      Accept: "text/plain",
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    try {
      if (!isLiked) {
        const response = await axios.post(
          "http://172.16.5.106:5195/api/nominationlike",
          null,
          {
            params: {
              NominationID,
              LikedBy: userId,
              Active: true,
              SubmittedBy: userId,
            },
            headers,
          }
        );

        // API sometimes missing LikeID → fallback
        const newLikeId =
          response?.data?.NominationLikeID ||
          response?.data?.nominationLikeId ||
          Date.now();

        // Update UI
        setPosts((prev) =>
          prev.map((p) =>
            p.NominationID === NominationID
              ? {
                  ...p,
                  LikedBy: [
                    ...(p.LikedBy || []),
                    {
                      NominationLikeID: newLikeId,
                      UserID: userId,
                      UserName: "You",
                    },
                  ],
                }
              : p
          )
        );

        setLikedPosts((prev) => [...prev, NominationID]);
        return;
      }
      const likeRecords = post.LikedBy?.filter(
        (like: any) => like.UserID === userId
      );

      if (!likeRecords || likeRecords.length === 0) {
        console.warn("No like record found for this user.");
        return;
      }

      // Delete ALL duplicate Like records for the same user
      for (const like of likeRecords) {
        await axios.delete(
          `http://172.16.5.106:5195/api/nominationlike/${like.NominationLikeID}`,
          {
            headers,
            data: {
              nominationID: post.NominationID,
              likedBy: userId,
              active: false,
              submittedBy: userId,
            },
          }
        );
      }

      // Update UI
      setPosts((prev) =>
        prev.map((p) =>
          p.NominationID === NominationID
            ? {
                ...p,
                LikedBy: p.LikedBy?.filter(
                  (like: any) => like.UserID !== userId
                ),
              }
            : p
        )
      );

      setLikedPosts((prev) => prev.filter((id) => id !== NominationID));
    } catch (err) {
      console.error("❌ Error in like/unlike:", err);
    }
  };

  const toggleComments = (nominationId: number) => {
    setShowComments((prev) => ({
      ...prev,
      [nominationId]: !prev[nominationId],
    }));
  };

  return (
    <div>
      {posts.length === 0 ? (
        <p className="text-gray-500 py-3 text-sm text-center">
          Loading feeds...
        </p>
      ) : (
        posts.map((post) => {
          const NominationID = post.NominationID;
          const isLiked = likedPosts.includes(NominationID);
          const likeCount = post.LikedBy?.length || 0;
          const isCommentOpen = showComments[NominationID] || false;

          return (
            <div
              key={NominationID}
              className="p-4 sm:p-6 bg-white border-b-2 border-b-gray-100 hover:shadow-md transition"
            >
              <div className="flex space-x-3">
                {/* Avatar */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  {post.Nominee?.charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {post.Nominee}
                        </h3>

                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          👥 {post.NominatedCount} Nominated
                        </span>

                        <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                          🏆 {post.AwardCategory}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 mb-1">
                        {post.Tenant}
                      </p>
                    </div>

                    <MoreHorizontal className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                  </div>

                  {/* Description */}
                  <p className="text-gray-800 mt-2 text-sm leading-relaxed">
                    {post.Description}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:justify-between border-b-1 border-gray-200 mt-3 py-3">
                    <div className="flex items-center space-x-6">
                      <span className="text-sm font-medium">
                        {getLikeText(post.LikedBy, userId)}
                      </span>
                    </div>

                    {/* VIEWS */}
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col sm:flex-row sm:justify-between mt-3 pt-3">
                    <div className="flex items-center space-x-6">
                      {/* LIKE BUTTON */}
                      <button
                        onClick={() => handleLike(post)}
                        className={`flex items-center space-x-2 ${
                          isLiked
                            ? "text-red-500"
                            : "text-gray-500 hover:text-red-500"
                        }`}
                      >
                        <Heart
                          className="w-4 h-4"
                          fill={isLiked ? "red" : "none"}
                        />
                        <span className="text-sm font-medium">
                          {likeCount} Likes
                        </span>
                      </button>

                      {/* COMMENTS */}
                      <button
                        onClick={() => toggleComments(NominationID)}
                        className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {post.Comments} Comments
                        </span>
                      </button>

                      {/* SHARE */}
                      <button className="text-gray-500 hover:text-gray-700">
                        <Share className="w-4 h-4" />
                      </button>
                    </div>

                    {/* VIEWS */}
                    <div className="flex items-center text-gray-500 text-sm mt-3 sm:mt-0">
                      <Eye className="w-4 h-4 mr-1" />
                      <span>{post.Views} Views</span>
                    </div>
                  </div>

                  {/* COMMENT SECTION - Shows when clicked */}
                  {isCommentOpen && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {/* Comment Input */}
                      <div className="flex space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                          {username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 relative">
  <textarea
    placeholder="Add a comment..."
    rows={1}
    className="
      w-full px-4 py-2 pr-20
      border border-gray-300 rounded-md
      text-sm resize-none
      focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
      overflow-hidden    
    "
    style={{ minHeight: "38px" }}
    onInput={(e) => {
      const target = e.target as HTMLTextAreaElement;
      target.style.height = "38px"; 
      target.style.height = target.scrollHeight + "px"; 
    }}
  />

  <div className="absolute right-[6%] top-[10px] flex space-x-2">
    <button className="text-gray-400 hover:text-gray-600">
      <Send className="w-5 h-5" />
    </button>
  </div>
</div>

                      </div>
                        {post.Comments === 0 && (
                        <p className="text-center text-gray-500 text-xs mt-4">
                          No comments yet. Be the first to comment!
                        </p>
                      )}
                      
                      {post.Comments > 0 && (
                        <div className="mt-4 space-y-3">
                          <p className="text-xs text-gray-500 text-center">
                            {post.Comments} comment{post.Comments !== 1 ? "s" : ""}
                          </p>
                          {/* You can map actual comments here when you have comment data */}
                        </div>
                      )}

                      
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default PostCard;