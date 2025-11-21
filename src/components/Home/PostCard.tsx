import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal, Eye, Send } from "lucide-react";
import axios from "axios";
import type { Feed } from "../../dataTypes/nomination";
import { useAuth } from "../ContextAPI/AuthContext";
import PostFeedModal from "./PostFeedModal";
import FeedLikeComponent from "./FeedLikeComponent";
import FeedLikePop from "./FeedLikePop";
import FeedComment from "./FeedComment";
import ViewerModal from "./ViewerModal";

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
  const [viewsMap, setViewsMap] = useState<{ [key: number]: number }>({});
  const [showViewers, setShowViewers] = useState(false);
  const [viewerList, setViewerList] = useState<any[]>([]);
  const [viewed, setViewed] = useState<{ [key:number]: boolean }>({});
  const [showLikePopup, setShowLikePopup] = useState(false);
const [likeList, setLikeList] = useState<any[]>([]);

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
      `${apiUrl}/api/nominationcomments`,
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

    console.log("Views", res.data);

    setViewerList(res.data);

    setViewsMap((prev) => ({
      ...prev,
      [nominationId]:
        total !== undefined && total !== null ? total : prev[nominationId],
    }));
  } catch (err) {
    console.error("❌ Error fetching views:", err);
  }
};


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




useEffect(() => {
  posts.forEach((p) => {
    if (!viewsMap[p.NominationID]) {
      fetchViews(p.NominationID);
      //  addView(p.NominationID); 
    }
  });
}, [posts]);


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

                  <div
  className="flex justify-between border-b-1 border-gray-200 mt-3 py-3 cursor-pointer"
  onClick={() => {
    setLikeList(post.LikedBy || []);
    setShowLikePopup(true);
  }}
>
  <span className="text-sm font-medium">
    {getLikeText(post.LikedBy, userId)}
  </span>
</div>


                  <div className="flex justify-between mt-3 pt-3">
                    <div className="flex items-center space-x-6">
                      <FeedLikeComponent
  post={post}
  isLiked={isLiked}
  onLike={() => handleLike(post)}
/>

                      <button
                        onClick={() => toggleComments(NominationID)}
                        className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {post.Comments} Comments
                        </span>
                      </button>

                      {/* <button className="text-gray-500 hover:text-gray-700">
                        <Share className="w-4 h-4" />
                      </button> */}
                    </div>

                    <div
  className="flex items-center text-gray-500 text-sm cursor-pointer"
onClick={async (e) => {
  e.preventDefault();
  e.stopPropagation();
e.nativeEvent.stopImmediatePropagation();
  if (!viewed[post.NominationID]) {
     await addView(post.NominationID);
     setViewed(prev => ({ ...prev, [post.NominationID]: true }));
  }

  await fetchViews(post.NominationID);
  setShowViewers(true);
}}


>
  <Eye className="w-4 h-4 mr-1" />
  <span>{viewsMap[post.NominationID] || 0} Views</span>
</div>

                  </div>

                   {isCommentOpen && (
  <FeedComment
    post={post}
    username={username || ""}
    comments={filteredComments}
    commentText={commentText[NominationID] || ""}
    setCommentText={(v) =>
      setCommentText((prev) => ({ ...prev, [NominationID]: v }))
    }
    handleAddComment={() => handleAddComment(post)}
  />
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



    {/* Like Modal */}
      {showLikePopup && (
  <FeedLikePop
    likedBy={likeList}
    onClose={() => setShowLikePopup(false)}
  />
)}
 {/* View Modal */}
<ViewerModal
        open={showViewers}
        viewers={viewerList}
        onClose={() => setShowViewers(false)}
      />

    </div>
  );
};

export default PostCard;
