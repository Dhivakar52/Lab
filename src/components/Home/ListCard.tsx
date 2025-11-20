import React, { useEffect, useState } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal, Eye, Send } from "lucide-react";
import axios from "axios";
import type { Feed } from "../../dataTypes/nomination";
import { useAuth } from "../ContextAPI/AuthContext";

interface ListCardProps {
  list: Feed[] | null | undefined;
}

const getLikeText = (likedByList: any[] = [], currentUserId: number | null) => {
  if (!likedByList || likedByList.length === 0) return "0 Likes";

  const isLikedByYou = likedByList.some((l) => l.UserID === currentUserId);

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

const ListCard: React.FC<ListCardProps> = ({ list }) => {
  const safeList = list ?? []; // 💥 MAIN FIX
  const { authToken, userId, username } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});
  const [commentText, setCommentText] = useState<{ [key: number]: string }>({});
  const [comments, setComments] = useState<any[]>([]);

  // Load liked posts
  useEffect(() => {
    const liked = safeList
      .filter((p) => p.LikedBy?.some((like: any) => like.UserID === userId))
      .map((p) => p.NominationID);

    setLikedPosts(liked);
  }, [safeList, userId]);

  // Load comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/nominationcomments`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setComments(res.data);
      } catch (err) {
        console.error("Comments error:", err);
      }
    };

    fetchComments();
  }, []);

  const handleLike = async (item: Feed) => {
    const NominationID = item.NominationID;
    const isLiked = likedPosts.includes(NominationID);

    const headers = {
      Accept: "text/plain",
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    try {
      // LIKE
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

        item.LikedBy = item.LikedBy ?? [];
        item.LikedBy.push({
          NominationLikeID: newLikeId,
          UserID: userId,
          UserName: "You",
        });

        setLikedPosts((p) => [...p, NominationID]);
        return;
      }

      // UNLIKE
      const likeRecords = item.LikedBy?.filter((l: any) => l.UserID === userId) ?? [];

      for (const like of likeRecords) {
        await axios.delete(`${apiUrl}/api/nominationlike/${like.NominationLikeID}`, {
          headers,
          data: {
              nominationID: item.NominationID,
              likedBy: userId,
              active: false,
              submittedBy: userId,
            },
        });
      }

      item.LikedBy = (item.LikedBy ?? []).filter((l: any) => l.UserID !== userId);

      setLikedPosts((p) => p.filter((id) => id !== NominationID));
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleAddComment = async (item: Feed) => {
    const text = commentText[item.NominationID]?.trim();
    if (!text) return;

    try {
      const res = await axios.post(
        `${apiUrl}/api/nominationcomments`,
        {
          nominationID: item.NominationID,
          commentedBy: userId,
          commentsText: text,
          active: true,
          submittedBy: userId,
        },
        {
          params: { id: item.NominationID },
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const newComment = {
        NominationCommentsID: res.data,
        NominationID: item.NominationID,
        CommentedBy: username,
        CommentsText: text,
        CommentedAt: new Date().toISOString(),
      };

      setComments((prev) => [...prev, newComment]);
      item.Comments = (item.Comments ?? 0) + 1;

      setCommentText((prev) => ({ ...prev, [item.NominationID]: "" }));
      setShowComments((prev) => ({ ...prev, [item.NominationID]: true }));
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  const toggleComments = (id: number) => {
    setShowComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {safeList.length === 0 ? (
        <p className="text-gray-500 text-sm text-center">No items in your list.</p>
      ) : (
        safeList.map((item) => {
          const NominationID = item.NominationID;
          const isLiked = likedPosts.includes(NominationID);
          const filteredComments = comments.filter((c) => c.NominationID === NominationID);

          return (
            <div
              key={NominationID}
               className="p-4 sm:p-6 bg-white border-b-2 border-b-gray-100 hover:shadow-md transition"
            >
              <div className="flex space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  {item.Nominee?.charAt(0)}
                </div>

                <div className="flex-1 flex-1 min-w-0">
                  <div className="flex  items-start justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {item.Nominee}
                      </h3>
                       <div className="flex flex-wrap gap-1 sm:gap-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          👥 {item.NominatedCount}  Nominated
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          🏆 {item.AwardCategory}
                        </span>
                      </div>
                    </div>

                    <MoreHorizontal className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                  </div>

                  <p className="text-gray-800 mt-2 text-sm">{item.Description}</p>

                  <div className="flex justify-between border-b-1 border-gray-200 mt-3 py-3">
                    <span className="text-sm font-medium">
                      {getLikeText(item.LikedBy ?? [], userId)}
                    </span>
                  </div>

                  <div className="flex justify-between mt-3">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => handleLike(item)}
                        className={`flex items-center space-x-2 ${
                          isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                        }`}
                      >
                        <Heart className="w-4 h-4" fill={isLiked ? "red" : "none"} />
                        <span className="text-sm font-medium">
                          {(item.LikedBy ?? []).length} Likes
                        </span>
                      </button>

                      <button
                        onClick={() => toggleComments(NominationID)}
                        className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {item.Comments ?? 0} Comments
                        </span>
                      </button>

                      <button className="text-gray-500 hover:text-gray-700">
                        <Share className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center text-gray-500 text-sm">
                      <Eye className="w-4 h-4 mr-1" />
                      {item.Views ?? 0} Views
                    </div>
                  </div>

                  {/* COMMENT SECTION */}
                  {showComments[NominationID] && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {username?.charAt(0)}
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
                          />

                          <button
                            onClick={() => handleAddComment(item)}
                            className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* COMMENTS LIST */}
                      {(filteredComments ?? []).length === 0 ? (
                        <p className="text-center text-gray-500 text-xs mt-4">
                          No comments yet.
                        </p>
                      ) : (
                        <div className="mt-4">
                          {(filteredComments ?? [])
                            .slice(0, 5)
                            .map((c) => (
                              <div
                                key={c.NominationCommentsID}
                                className="bg-gray-50 p-3 rounded-md border border-gray-200 flex space-x-3 mb-2"
                              >
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                  {c.CommentedBy?.charAt(0)}
                                </div>

                                <div className="ml-3">
                                  <p className="text-sm font-semibold">{c.CommentedBy}</p>
                                  <p className="text-sm">{c.CommentsText}</p>
                                  <p className="text-[10px] text-gray-400">
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
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ListCard;
