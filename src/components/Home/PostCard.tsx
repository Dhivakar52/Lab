import React, { useState, useEffect } from "react";
import { X, MessageCircle, MoreHorizontal, Send, Trophy, UsersRound } from "lucide-react";
import axios from "axios";
import type { Feed } from "../../dataTypes/nomination";
import { useAuth } from "../ContextAPI/AuthContext";
import PostFeedModal from "./PostFeedModal";
import FeedLikeComponent from "./FeedLikeComponent";
import FeedLikePop from "./FeedLikePop";
import FeedComment from "./FeedComment";
import ReactionsModal from "./ReactionsModal";

interface PostCardProps {
  posts: Feed[];
  setPosts: React.Dispatch<React.SetStateAction<Feed[]>>;
}

const PostCard: React.FC<PostCardProps> = ({ posts, setPosts }) => {
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState<{ [key: number]: string }>({});
  const [selectedPost, setSelectedPost] = useState<Feed | null>(null);
  const [viewsMap, setViewsMap] = useState<{ [key: number]: number }>({});
  const [_showViewers, setShowViewers] = useState(false);
  const [viewerList, setViewerList] = useState<any[]>([]);
  const [viewed, setViewed] = useState<{ [key: number]: boolean }>({});
  const [showLikePopup, setShowLikePopup] = useState(false);
  const [likeList, setLikeList] = useState<any[]>([]);
  const [expandedDesc, setExpandedDesc] = useState<Record<number, boolean>>({});
  const [showModal, setShowModal] = useState(false);
  const [seekingOpen, setSeekingOpen] = useState(false);
  const [seekingUsers, setSeekingUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  type ReactionTab = "likes" | "comments" | "views";
  const [reactionOpen, setReactionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ReactionTab>("likes");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [seekingCountMap, setSeekingCountMap] = useState<{ [key: number]: number }>({});

  const { authToken, userId, username } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const liked = posts
      .filter((p) => p.LikedBy?.some((like: any) => like.UserID === userId))
      .map((p) => p.NominationID);
    setLikedPosts(liked);
  }, [posts, userId]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/nominationcomments`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = res.data;
        setComments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Error fetching comments:", err);
      }
    };
    fetchComments();
  }, []);

  const toggleDescription = (id: number) => {
    setExpandedDesc(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getInitial = (name?: string) => {
    if (!name || typeof name !== "string") return "?";
    return name.trim().charAt(0).toUpperCase();
  };

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

        const newLikeId = response?.data?.NominationLikeID || response?.data?.nominationLikeId || Date.now();

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
                      UserName: username,
                    },
                  ],
                }
              : p
          )
        );
        setLikedPosts((prev) => [...prev, NominationID]);
        if (selectedPost?.NominationID === NominationID) {
          setSelectedPost({
            ...selectedPost,
            LikedBy: [
              ...(selectedPost.LikedBy || []),
              {
                NominationLikeID: newLikeId,
                UserID: userId,
                UserName: username,
              },
            ],
          });
        }
      } else {
        const likeRecords = post.LikedBy?.filter((like: any) => like.UserID === userId);
        for (const like of likeRecords) {
          await axios.delete(`${apiUrl}/api/nominationlike/${like.NominationLikeID}`, {
            headers,
            data: {
              nominationID: post.NominationID,
              likedBy: userId,
              active: false,
              submittedBy: userId,
            },
          });
        }
        setPosts((prev) =>
          prev.map((p) =>
            p.NominationID === NominationID
              ? {
                  ...p,
                  LikedBy: p.LikedBy?.filter((like: any) => like.UserID !== userId),
                }
              : p
          )
        );
        setLikedPosts((prev) => prev.filter((id) => id !== NominationID));
        if (selectedPost?.NominationID === NominationID) {
          setSelectedPost({
            ...selectedPost,
            LikedBy: selectedPost.LikedBy?.filter((like: any) => like.UserID !== userId),
          });
        }
      }
    } catch (err) {
      console.error("❌ Error in like/unlike:", err);
    }
  };

  const handleAddComment = async (post: Feed) => {
    const text = commentText[post.NominationID]?.trim();
    if (!text) return;
    try {
      const tempId = crypto.randomUUID();
      const newComment = {
        NominationCommentsID: tempId,
        NominationID: post.NominationID,
        CommentedBy: username,
        CommentsText: text,
        CommentedAt: new Date().toISOString(),
      };
      setComments((prev) => [...prev, newComment]);
      setPosts((prev) =>
        prev.map((p) =>
          p.NominationID === post.NominationID ? { ...p, Comments: p.Comments + 1 } : p
        )
      );
      setCommentText((prev) => ({ ...prev, [post.NominationID]: "" }));
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

  const fetchViews = async (nominationId: number) => {
    try {
      const res = await axios.get(`${apiUrl}/api/nominationview/${nominationId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
      const total = res.data?.[0]?.TotalRowCount;
      const list = Array.isArray(res.data) ? res.data : res.data?.data && Array.isArray(res.data.data) ? res.data.data : [];
      setViewerList(list);
      setViewsMap((prev) => ({
        ...prev,
        [nominationId]: total !== undefined && total !== null ? total : prev[nominationId],
      }));
    } catch (err) {
      console.error("❌ Error fetching views:", err);
    }
  };

  const addView = async (nominationId: number) => {
    try {
      await axios.post(`${apiUrl}/api/nominationview`, null, {
        params: {
          NominationID: nominationId,
          Active: true,
          ViewedBy: userId,
          SubmittedBy: userId,
        },
        headers: {
          Accept: "text/plain",
          Authorization: `Bearer ${authToken}`,
        },
      });
    } catch (err) {
      console.error("❌ Error adding view:", err);
    }
  };

  useEffect(() => {
    posts.forEach((p) => {
      fetchViews(p.NominationID);
      fetchSeekingUsercount(p.NominationID);
    });
  }, [posts]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const fetchSeekingUsers = async (NominationID: number) => {
    try {
      const res = await axios.get(`${apiUrl}/api/users`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setSeekingUsers(Array.isArray(res.data) ? res.data : []);
      fetchSeekingUsercount(NominationID);
    } catch (err) {
      console.error("Seeking users load failed", err);
    }
  };

  const sendSeekingUser = async () => {
    if (selectedUsers.length === 0) {
      alert("Select at least one user");
      return;
    }

    try {
      for (const id of selectedUsers) {
        const payload = {
          nominationID: selectedPost?.NominationID,
          seekingUserID: id,
          active: true,
          submittedBy: userId,
        };

        await axios.post(`${apiUrl}/api/seeking`, payload, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const mockNotification = {
          NotificationID: Date.now() + Math.random() * 1000,
          Title: "Post shared with you",
          // NotificationContent: `${username} shared "${selectedPost?.Nominee}" with you`,
          Type: "Seeking Request",
          ReferenceIdPK: selectedPost?.NominationID,
          DeepLink: `/home?postId=${selectedPost?.NominationID}&scrollTo=post`,
          IsRead: false,
          Time: new Date().toLocaleString(),
        };

        const existingNotifications = JSON.parse(localStorage.getItem('mock_notifications') || '[]');
        existingNotifications.push(mockNotification);
        localStorage.setItem('mock_notifications', JSON.stringify(existingNotifications));
        
        console.log('📝 Mock notification created:', mockNotification);
      }

      if (selectedPost?.NominationID) {
        await fetchSeekingUsercount(selectedPost.NominationID);
      }

      setSuccessMsg(`Shared with ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}!`);
      setSelectedUsers([]);
      setSearch("");
      setSeekingOpen(false);

    } catch (err) {
      console.error("Error:", err);
      alert("Failed to share");
    }
  };

  const resetSeekingPopup = () => {
    setSeekingOpen(false);
    setSearch("");
    setSelectedUsers([]);
  };

  const fetchSeekingUsercount = async (NominationID: number) => {
    try {
      const res = await axios.get(`${apiUrl}/api/seeking/${NominationID}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      let list: any[] = [];
      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (res.data?.Seeking) {
        list = JSON.parse(res.data.Seeking);
      }
      const count = list.length > 0 ? list[0]?.TotalRowCount || 0 : 0;
      setSeekingCountMap(prev => ({
        ...prev,
        [NominationID]: count,
      }));
    } catch (err) {
      console.error("Seeking count load failed", err);
    }
  };

  const handleReply = async (postId: number, text: string, parentId: number) => {
    if (!text.trim()) return;
    const tempId = crypto.randomUUID();
    const newComment = {
      NominationCommentsID: tempId,
      NominationID: postId,
      ParentCommentID: parentId,
      CommentedBy: username,
      CommentsText: text,
      CommentedAt: new Date().toISOString(),
      ChildComments: [],
    };
    setComments((prev) => [...prev, { ...newComment, ChildComments: [] }]);
    try {
      const res = await axios.post(
        `${apiUrl}/api/nominationcomments`,
        {
          nominationID: postId,
          commentedBy: userId,
          commentsText: text,
          parentCommentID: parentId,
          active: true,
          submittedBy: userId,
        },
        {
          params: { id: postId },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const newId = res.data;
      setComments((prev) =>
        prev.map((comment) =>
          comment.NominationCommentsID === newComment.NominationCommentsID
            ? { ...comment, NominationCommentsID: newId }
            : comment
        )
      );
    } catch (err) {
      console.error("Error posting reply:", err);
    }
  };

  return (
    <div>
      {posts.length === 0 ? (
        <p className="text-gray-500 py-3 text-sm text-center">Loading feeds...</p>
      ) : (
        posts.map((post, index) => {
          const NominationID = post.NominationID;
          const isLiked = likedPosts.includes(NominationID);
          const isCommentOpen = showComments[NominationID] || false;

          return (
            <div
              key={index}
              data-post-id={post.NominationID}
              className="p-4 sm:p-4 bg-white border-b-2 border-b-gray-100 hover:shadow-md transition"
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
                        <span className="px-2 py-1 rounded-full text-xs bg-[#EDF4FF] text-[#213048] flex items-center">
                          <Trophy size={16} />
                          <span className="ms-1">{post.AwardCategory}</span>
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-[#EDF4FF] text-[#213048] flex items-center">
                          <UsersRound size={16} />
                          <span className="ms-1">{post.NominatedCount}</span>
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">{post.Tenant}</p>
                    </div>
                    <MoreHorizontal
                      className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                        if (!viewed[post.NominationID]) {
                          await addView(post.NominationID);
                          setViewed((prev) => ({ ...prev, [post.NominationID]: true }));
                        }
                        await fetchViews(post.NominationID);
                        setShowViewers(false);
                        setSelectedPost(post);
                        setShowModal(true);
                      }}
                    />
                  </div>
                  <p
                    className={`text-gray-800 mt-2 text-sm leading-relaxed transition-all duration-300 ${
                      expandedDesc[NominationID] ? "" : "line-clamp-2"
                    }`}
                  >
                    {post.Description}
                  </p>
                  {post.Description?.length > 120 && (
                    <button
                      type="button"
                      onClick={() => toggleDescription(NominationID)}
                      className="text-blue-600 text-xs mt-1 hover:underline font-medium"
                    >
                      {expandedDesc[NominationID] ? "Show less" : "Show more"}
                    </button>
                  )}

                  <div className="flex justify-between border-b-1 border-gray-200 mt-1 py-1">
                    <span
                      className="text-sm font-medium cursor-pointer hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLikeList(post.LikedBy || []);
                        setShowLikePopup(true);
                        setSelectedPost(post);
                      }}
                    />
                  </div>

                  <div className="flex justify-between mt-1 pt-1">
                    <div className="flex items-center space-x-2">
                      <FeedLikeComponent post={post} isLiked={isLiked} onLike={() => handleLike(post)} />
                      <button
                        onClick={() => toggleComments(NominationID)}
                        className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      <div className="relative inline-flex items-center">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            setSelectedPost(post);
                            await fetchSeekingUsers(post.NominationID);
                            setSeekingOpen(true);
                          }}
                          className="p-1 rounded-full hover:bg-gray-100 transition"
                          title="Send"
                        >
                          <Send size={17} className="text-gray-600 hover:text-black" />
                        </button>
                        <span className="absolute -right-5 top-1/2 -translate-y-1/2 min-w-[15px] h-[15px] px-2 flex items-center justify-center rounded-full bg-gradient-to-r from-gray-400 to-gray-400 text-white text-[11px] font-semibold shadow">
                          {seekingCountMap[post.NominationID] || 0}
                        </span>
                      </div>
                    </div>

                    <div
                      className="flex items-center text-gray-500 text-sm cursor-pointer"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                        await fetchViews(post.NominationID);
                        setShowViewers(true);
                        setSelectedPost(post);
                      }}
                    >
                      <div className="flex items-center mt-3 text-sm text-gray-500">
                        <span
                          className="cursor-pointer hover:text-blue-600"
                          onClick={() => {
                            setSelectedPost(post);
                            setLikeList(post.LikedBy || []);
                            setActiveTab("likes");
                            setReactionOpen(true);
                          }}
                        >
                          {post.LikedBy?.length || 0} Likes
                        </span>
                        <span className="px-2 text-[18px] text-[#9CA3AF] leading-none">•</span>
                        <span
                          className="cursor-pointer hover:text-blue-600"
                          onClick={() => {
                            setSelectedPost(post);
                            setLikeList(post.LikedBy || []);
                            setActiveTab("comments");
                            setReactionOpen(true);
                          }}
                        >
                          {post.Comments} Comments
                        </span>
                        <span className="px-2 text-[18px] text-[#9CA3AF] leading-none">•</span>
                        <span
                          className="cursor-pointer hover:text-blue-600"
                          onClick={async () => {
                            await fetchViews(post.NominationID);
                            setSelectedPost(post);
                            setLikeList(post.LikedBy || []);
                            setActiveTab("views");
                            setReactionOpen(true);
                          }}
                        >
                          {viewsMap[post.NominationID] || 0} Views
                        </span>
                      </div>
                    </div>
                  </div>

                  {isCommentOpen && (
                    <FeedComment
                      post={post}
                      username={username || ""}
                      commentText={commentText[NominationID] || ""}
                      setCommentText={(v) =>
                        setCommentText((prev) => ({ ...prev, [NominationID]: v }))
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {showLikePopup && (
        <FeedLikePop
          likedBy={likeList}
          onClose={() => setShowLikePopup(false)}
          post={selectedPost}
          item
        />
      )}

      {successMsg && (
        <div className="fixed top-5 right-5 z-[9999] bg-green-600 text-white px-5 py-3 rounded-lg shadow-xl text-sm font-medium animate-slide-in">
          <span>{successMsg}</span>
        </div>
      )}

      {seekingOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
          <div className="bg-white w-[680px] h-[500px] rounded-xl shadow-xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-6 h-[56px] border-b border-gray-300">
              <h3 className="font-medium text-[15px] text-gray-800">Send To</h3>
              <button onClick={resetSeekingPopup}>
                <X size={18} className="text-gray-600" />
              </button>
            </div>

            <div className="px-6 pt-4 pb-2">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {seekingUsers
                .filter((u) => u.UserName.toLowerCase().includes(search.toLowerCase()))
                .map((u) => (
                  <div
                    key={u.UserID}
                    className="flex items-center justify-between px-6 h-[64px] border-b border-gray-300 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedUsers((prev) =>
                        prev.includes(u.UserID) ? prev.filter((id) => id !== u.UserID) : [...prev, u.UserID]
                      );
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold themeColor">
                        {u.UserName.charAt(0).toUpperCase()}
                      </div>
                      <div className="leading-tight">
                        <div className="text-sm font-medium text-gray-800">
                          {u.UserName} <span className="text-xs text-gray-500">- {u.TenantName}</span>
                        </div>
                        <div className="text-xs text-gray-500">{u.DeptName} | {u.Email}</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(u.UserID)}
                      readOnly
                      className="w-4 h-4 border-gray-400 accent-gray-700"
                    />
                  </div>
                ))}
            </div>

            <div className="px-6 py-4 border-t border-gray-300">
              <button onClick={sendSeekingUser} className="w-full py-2.5 rounded-md btn-theme">
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <PostFeedModal
        viewers={viewerList}
        post={selectedPost}
        open={showModal}
        onClose={() => setShowModal(false)}
        onLike={handleLike}
        onComment={handleAddComment}
        onReply={handleReply}
        comments={comments.filter(c => c.NominationID === selectedPost?.NominationID)}
        commentText={commentText}
        setCommentText={setCommentText}
        userId={userId}
        likeList={likeList}
        likedPosts={likedPosts}
      />

      <ReactionsModal
        open={reactionOpen}
        onClose={() => setReactionOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        likeList={likeList}
        comments={comments}
        viewerList={viewerList}
        selectedPost={selectedPost}
        getInitial={getInitial}
      />
    </div>
  );
};

export default PostCard;