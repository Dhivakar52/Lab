import React, { useEffect, useState } from "react";
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Eye,
  Send,
} from "lucide-react";
import axios from "axios";
import type { Feed } from "../../dataTypes/nomination";
import { useAuth } from "../ContextAPI/AuthContext";
import FeedLikePop from "./FeedLikePop";
import ViewerModal from "./ViewerModal";
import PostFeedModal from "./PostFeedModal";
import FeedComment from "./FeedComment";
import FilterFeed from "./FilterFeed";

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
  const safeList = list ?? [];
  const { authToken, userId, username } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [commentText, setCommentText] = useState<{ [key: number]: string }>({});
  const [comments, setComments] = useState<any[]>([]);
  const [showLikePopup, setShowLikePopup] = useState(false);
  const [likeList, setLikeList] = useState<any[]>([]);
  const [viewerList, setViewerList] = useState<any[]>([]);
  const [viewsMap, setViewsMap] = useState<{ [key: number]: number }>({});
  const [showViewers, setShowViewers] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
   const [viewed, setViewed] = useState<{ [key:number]: boolean }>({});
  const [showModal, setShowModal] = useState(false);


  useEffect(() => {
    const liked = safeList
      .filter((p) => p.LikedBy?.some((like: any) => like.UserID === userId))
      .map((p) => p.NominationID);

    setLikedPosts(liked);
  }, [safeList, userId]);


  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/nominationcomments`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
       const data = res.data;
       setComments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Comments error:", err);
      }
    };
    fetchComments();
  }, []);
 const addView = async (nominationId: number) => {
  try {
    await axios.post(
      `${apiUrl}/api/nominationview`,
      null,
      {
        params: {
          NominationID: nominationId,
          Active: true,
          SubmittedBy: userId,
        },
        headers: {
          Accept: "text/plain",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    console.log("View added for: ", nominationId);
  } catch (err) {
    console.error("❌ Error adding view:", err);
  }
};

  // ---------------- FETCH VIEWS ----------------
  const fetchViews = async (nominationId: number) => {
    try {
      const res = await axios.get(
        `${apiUrl}/api/nominationview/${nominationId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const total = res.data?.[0]?.TotalRowCount;

      setViewerList(res.data);

      setViewsMap((prev) => ({
        ...prev,
        [nominationId]: total !== undefined ? total : prev[nominationId],
      }));
    } catch (err) {
      console.error("❌ Error fetching views:", err);
    }
  };

  useEffect(() => {
    safeList.forEach((p) => {
      if (!viewsMap[p.NominationID]) {
        fetchViews(p.NominationID);
      }
    });
  }, [safeList]);
const toggleComments = (id: number) => {
    setShowComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  // ---------------- LIKE HANDLER ----------------
  const handleLike = async (item: Feed) => {
    const NominationID = item.NominationID;
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

        item.LikedBy = item.LikedBy ?? [];
        item.LikedBy.push({
          NominationLikeID: newLikeId,
          UserID: userId,
          UserName: username,
        });

        setLikedPosts((p) => [...p, NominationID]);
        return;
      }

      const likeRecords =
        item.LikedBy?.filter((l: any) => l.UserID === userId) ?? [];

      for (const like of likeRecords) {
        await axios.delete(
          `${apiUrl}/api/nominationlike/${like.NominationLikeID}`,
          {
            headers,
            data: {
              nominationID: item.NominationID,
              likedBy: userId,
              active: false,
              submittedBy: userId,
            },
          }
        );
      }

      item.LikedBy = (item.LikedBy ?? []).filter((l: any) => l.UserID !== userId);

      setLikedPosts((p) => p.filter((id) => id !== NominationID));
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  // ---------------- COMMENT ADD ----------------
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

  // ---------------- REPLY COMMENT ----------------
  const handleReply = async (postId: any, text: any, parentId: any) => {
    if (!text.trim()) return;

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

      setComments((prev) => [
        ...prev,
        {
          NominationCommentsID: newId,
          NominationID: postId,
          ParentCommentID: parentId,
          CommentedBy: username,
          CommentsText: text,
          CommentedAt: new Date().toISOString(),
          ChildComments: [],
        },
      ]);
    } catch (err) {
      console.error("Reply failed:", err);
    }
  };

  const buildCommentTree = (flatComments: any[]) => {
  const map: Record<number, any> = {};
  const roots: any[] = [];

  flatComments.forEach((c) => {
    // ensure ChildComments array exists for easier recursion
    map[c.NominationCommentsID] = { ...c, ChildComments: c.ChildComments || [] };
  });

  flatComments.forEach((c) => {
    if (c.ParentCommentID && map[c.ParentCommentID]) {
      map[c.ParentCommentID].ChildComments.push(map[c.NominationCommentsID]);
    } else {
      roots.push(map[c.NominationCommentsID]);
    }
  });

  return roots;
};

  

  return (
    <div className="space-y-6">
      {safeList.map((item) => {
        const NominationID = item.NominationID;
        const isLiked = likedPosts.includes(NominationID);
        // const filteredComments = comments.filter(
        //   (c) => c.NominationID === NominationID
        // );
         const filteredFlat = (comments || []).filter(
          (c) => c.NominationID === NominationID
        );
       // const filteredFlat = comments.filter(c => c.NominationID === NominationID);
        const nestedComments = buildCommentTree(filteredFlat);

        return (
          <div
            key={NominationID}
            className="p-4 sm:p-6 bg-white border-b-2 border-b-gray-100 hover:shadow-md transition"
          >
            <div className="flex space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                {item.Nominee?.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {item.Nominee}
                      </h3>

                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        👥 {item.NominatedCount} Nominated
                      </span>

                      <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        🏆 {item.AwardCategory}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-600">
                      {item.Tenant}
                    </p>
                  </div>

                 <MoreHorizontal
                   className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer"
                   onClick={() => {
                     setSelectedPost(item);
                     setShowModal(true);
                   }}
                 />
                </div>

                <p className="text-gray-800 mt-2 text-sm">{item.Description}</p>

                {/* LIKE BAR */}
                <div
                  className="flex justify-between border-b-1 border-gray-200 mt-3 py-3 cursor-pointer"
                  onClick={() => {
                    setLikeList(item.LikedBy || []);
                    setShowLikePopup(true);
                    setSelectedPost(item)
                  }}
                >
                  <span className="text-sm font-medium">
                    {getLikeText(item.LikedBy ?? [], userId)}
                  </span>
                </div>

                {/* ACTIONS */}
                <div className="flex justify-between mt-3">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleLike(item)}
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

                    {/* <button className="text-gray-500 hover:text-gray-700">
                      <Share className="w-4 h-4" />
                    </button> */}
                  </div>

                  {/* <div
                    className="flex items-center text-gray-500 text-sm cursor-pointer"
                    onClick={() => {
                      fetchViews(item.NominationID);
                      setShowViewers(true);
                    }}
                  > */}
                   <div
                        className="flex items-center text-gray-500 text-sm cursor-pointer"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                        if (!viewed[item.NominationID]) {
                          await addView(item.NominationID);
                          setViewed(prev => ({ ...prev, [item.NominationID]: true }));
                        }

                        await fetchViews(item.NominationID);
                        setShowViewers(true);
                        setSelectedPost(item)
                      }}


                      >
                    <Eye className="w-4 h-4 mr-1" />
                    <span>{viewsMap[item.NominationID] || 0} Views</span>
                  </div>
                </div>

                {/* COMMENT SECTION */}
                {showComments[NominationID] && (
                  <div className="mt-4">
                    <FeedComment
                      post={item}
                      username={username || ""}
                      comments={nestedComments}
                      commentText={commentText[NominationID] || ""}
                      setCommentText={(v: any) =>
                        setCommentText((prev) => ({
                          ...prev,
                          [NominationID]: v,
                        }))
                      }
                      handleAddComment={() => handleAddComment(item)}
                      handleReply={handleReply}
                    />
                  </div>
                )}
                 {/* LIKE POPUP */}
      {showLikePopup && (
        <FeedLikePop
          likedBy={likeList}
          onClose={() => setShowLikePopup(false)}
          item= {selectedPost}
          post
        />
      )}
              </div>
            </div>
          </div>
        );
      })}

     

      {/* VIEWERS POPUP */}
      <ViewerModal
      post
        item= {selectedPost}
        open={showViewers}
        viewers={viewerList}
        onClose={() => setShowViewers(false)}
      />

      {/* POST FEED MODAL */}
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
    </div>
  );
};

export default ListCard;
