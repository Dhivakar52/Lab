import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal, Eye, Send } from "lucide-react";
import axios from "axios";
import type { Feed } from "../../dataTypes/nomination";
import { useAuth } from "../ContextAPI/AuthContext";
import PostFeedModal from "./PostFeedModal";

interface PostCardProps {
  posts: Feed[];
  setPosts: React.Dispatch<React.SetStateAction<Feed[]>>;
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

const PostCard: React.FC<PostCardProps> = ({ posts, setPosts }) => {
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState<{ [key: number]: string }>({});
  const [selectedPost, setSelectedPost] = useState<Feed | null>(null);
const [showModal, setShowModal] = useState(false);

  const { authToken, userId, username } = useAuth();

  const apiUrl = import.meta.env.VITE_API_URL;

  // Load liked posts
  useEffect(() => {
    const liked = posts
      .filter((p) => p.LikedBy?.some((like: any) => like.UserID === userId))
      .map((p) => p.NominationID);

    setLikedPosts(liked);
  }, [posts, userId]);

  // Load comments from API
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/nominationcomments`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
        setComments(res.data);
        console.log("Comments", res.data)
      } catch (err) {
        console.error("❌ Error fetching comments:", err);
      }
    };

    fetchComments();
  }, []);

  // LIKE / UNLIKE
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
          `${apiUrl}/api/nominationlike`,
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

        const newLikeId =
          response?.data?.NominationLikeID ||
          response?.data?.nominationLikeId ||
          Date.now();

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

      // UNLIKE
      const likeRecords = post.LikedBy?.filter(
        (like: any) => like.UserID === userId
      );

      for (const like of likeRecords) {
        await axios.delete(
          `${apiUrl}/api/nominationlike/${like.NominationLikeID}`,
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

  // COMMENT POST API
const handleAddComment = async (post: Feed) => {
  const text = commentText[post.NominationID]?.trim();
  if (!text) return;

  try {
    const res = await axios.post(
      `http://172.16.5.106:5195/api/nominationcomments`,
      {
        nominationID: post.NominationID,
        commentedBy: userId,
        commentsText: text,
        active: true,
        submittedBy: userId,
      },
      {
        params: {
          id: post.NominationID, // required by API
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const newID = res.data; // API returns numeric ID

    // 👌 match your filteredComments structure
    const newComment = {
      NominationCommentsID: newID,
      NominationID: post.NominationID,
      CommentedBy: username,
      CommentsText: text,
      CommentedAt: new Date().toISOString(),
    };

    // Add into main comment list (used by filteredComments)
    setComments((prev) => [...prev, newComment]);

    // Update post comment count
    setPosts((prev) =>
      prev.map((p) =>
        p.NominationID === post.NominationID
          ? { ...p, Comments: p.Comments + 1 }
          : p
      )
    );

    // Clear text box
    setCommentText((prev) => ({ ...prev, [post.NominationID]: "" }));

    // ⭐ keep section open after posting
    setShowComments((prev) => ({
      ...prev,
      [post.NominationID]: true,
    }));

  } catch (err) {
    console.error("❌ Error posting comment:", err);
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
          const isCommentOpen = showComments[NominationID] || false;

          const filteredComments = comments.filter(
            (c) => c.NominationID === post.NominationID
          );

          return (
            <div
              key={NominationID}
              className="p-4 sm:p-6 bg-white border-b-2 border-b-gray-100 hover:shadow-md transition"
            >
              <div className="flex space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  {post.Nominee?.charAt(0).toUpperCase()}
                </div>

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

                   <MoreHorizontal
  className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer"
  onClick={() => {
    setSelectedPost(post);
    setShowModal(true);
  }}
/>
                  </div>

                  <p className="text-gray-800 mt-2 text-sm leading-relaxed">
                    {post.Description}
                  </p>

                  <div className="flex justify-between border-b-1 border-gray-200 mt-3 py-3">
                    <span className="text-sm font-medium">
                      {getLikeText(post.LikedBy, userId)}
                    </span>
                  </div>

                  <div className="flex justify-between mt-3 pt-3">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => handleLike(post)}
                        className={`flex items-center space-x-2 ${
                          isLiked
                            ? "text-red-500"
                            : "text-gray-500 hover:text-red-500"
                        }`}
                      >
                        <Heart className="w-4 h-4" fill={isLiked ? "red" : "none"} />
                        <span className="text-sm font-medium">
                          {post.LikedBy?.length || 0} Likes
                        </span>
                      </button>

                      <button
                        onClick={() => toggleComments(NominationID)}
                        className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {post.Comments} Comments
                        </span>
                      </button>

                      <button className="text-gray-500 hover:text-gray-700">
                        <Share className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center text-gray-500 text-sm">
                      <Eye className="w-4 h-4 mr-1" />
                      <span>{post.Views} Views</span>
                    </div>
                  </div>

                  {isCommentOpen && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                          {username?.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 relative">
                          <textarea
                            placeholder="Add a comment..."
                            rows={1}
                            value={commentText[NominationID] || ""}
                            onChange={(e) =>
                              setCommentText((prev) => ({
                                ...prev,
                                [NominationID]: e.target.value,
                              }))
                            }
                            className="
                              w-full px-4 py-2 pr-20 border border-gray-300 rounded-md
                              text-sm resize-none focus:outline-none focus:border-blue-500
                              focus:ring-1 focus:ring-blue-500 overflow-hidden
                            "
                            style={{ minHeight: "38px" }}
                            onInput={(e) => {
                              const target = e.target as HTMLTextAreaElement;
                              target.style.height = "38px";
                              target.style.height = target.scrollHeight + "px";
                            }}
                          />

                          <div className="absolute right-3 top-[10px]">
                            <button
                              onClick={() => handleAddComment(post)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>

{filteredComments.length === 0 ? (
  <p className="text-center text-gray-500 text-xs mt-4">
    No comments yet. Be the first to comment!
  </p>
) : (
  <div className="mt-4">

    {/* Show first 5 comments normally */}
    {filteredComments.slice(0, 5).map((c) => (
      <div
        key={c.NominationCommentsID}
        className="bg-gray-50 p-3 rounded-md border border-gray-200 flex space-x-3 mb-2"
      >
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
          {c.CommentedBy?.charAt(0).toUpperCase()}
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800">{c.CommentedBy}</p>
          <p className="text-sm text-gray-700 mt-1">{c.CommentsText}</p>
          <p className="text-[10px] text-gray-400 mt-1">
            {new Date(c.CommentedAt).toLocaleString()}
          </p>
        </div>
      </div>
    ))}

    {/* Remaining comments inside scroll box */}
    {filteredComments.length > 5 && (
      <div className="max-h-40 overflow-y-auto pr-1 mt-2 space-y-2 border border-gray-200 rounded-md p-2 bg-gray-50">

        {filteredComments.slice(5).map((c) => (
          <div
            key={c.NominationCommentsID}
            className="bg-white p-3 rounded-md border border-gray-200 flex space-x-3"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
              {c.CommentedBy?.charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800">{c.CommentedBy}</p>
              <p className="text-sm text-gray-700 mt-1">{c.CommentsText}</p>
              <p className="text-[10px] text-gray-400 mt-1">
                {new Date(c.CommentedAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}

      </div>
    )}

  </div>
)}

                    </div>
                  )}
                </div>
              </div>
              <PostFeedModal
  post={selectedPost}
  open={showModal}
  onClose={() => setShowModal(false)}
/>
            </div>
            
          );
        })
      )}
    </div>
  );
};

export default PostCard;
