import React, { useState, useEffect , useMemo } from "react";
import { X, Heart, MessageCircle,HeartHandshake, Share, MoreHorizontal,MessageCircleMore, Eye, Send ,Trophy ,UsersRound} from "lucide-react";  
import axios from "axios";
import type { Feed } from "../../dataTypes/nomination";
import { useAuth } from "../ContextAPI/AuthContext";
import PostFeedModal from "./PostFeedModal";
import FeedLikeComponent from "./FeedLikeComponent";
import FeedLikePop from "./FeedLikePop";
import FeedComment from "./FeedComment";
import ViewerModal from "./ViewerModal";
import { data } from "react-router-dom";

interface PostCardProps {
  posts: Feed[];
  setPosts: React.Dispatch<React.SetStateAction<Feed[]>>;
}

const getLikeText = (likedByList: any[], currentUserId: number | null ,username : any) => {
  if (!likedByList || likedByList.length === 0) return "0 Likes";

  const isLikedByYou = likedByList.some(l => l.UserID === currentUserId);

  if (isLikedByYou) {
    const others = likedByList.length - 1;
    if (others === 0) return "You liked this";
    return `${username} & ${others} others`;
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
  const [expandedDesc, setExpandedDesc] = useState<Record<number, boolean>>({});
  const [showModal, setShowModal] = useState(false);
   //home module//
    const [seekingOpen, setSeekingOpen] = useState(false);
    const [seekingUsers, setSeekingUsers] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    type ReactionTab = "likes" | "comments" | "views";

    const [reactionOpen, setReactionOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<ReactionTab>("likes");

  //end home module//
  const { authToken, userId, username } = useAuth();

  const apiUrl = import.meta.env.VITE_API_URL;
  
  const normalizeUserList = (list: any[] = []) => {
  return list.filter(
    (u) =>
      u &&
      typeof u === "object" &&
      u.UserID &&
      u.UserName
  );
};

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
           const data = res.data;
       setComments(Array.isArray(data) ? data : []);
      console.log("Comments",res.data)
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

      // Update the post in the state to reflect the like immediately
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

      // Trigger modal to update the like count
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

      // Update the post in the state to reflect the un-like immediately
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

      // Trigger modal to update the like count
      if (selectedPost?.NominationID === NominationID) {
        setSelectedPost({
          ...selectedPost,
          LikedBy: selectedPost.LikedBy?.filter(
            (like: any) => like.UserID !== userId
          ),
        });
      }
    }
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
          id: post.NominationID, 
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const newID = res.data; 

const tempId = crypto.randomUUID();
    const newComment = {
      NominationCommentsID: tempId,
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

   const list = Array.isArray(res.data)
    ? res.data
    : res.data?.data && Array.isArray(res.data.data)
      ? res.data.data
      : [];

    setViewerList(list);
    console.log("view data",list)

    //setViewerList(res.data);

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
          ViewedBy:userId,
          SubmittedBy: userId,
        },
        headers: {
          Accept: "text/plain",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
 
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

    const fetchSeekingUsers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/users`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
  
      setSeekingUsers(res.data || []);
      console.log("seek data",res.data)
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
          submittedBy: userId
        };
  
        await axios.post(`${apiUrl}/api/seeking`, payload, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
      }
  
      setSelectedUsers([]);
      setSearch("");
      setSeekingOpen(false);
  
    } catch (err) {
      alert("Save failed");
    }
  };
const resetSeekingPopup = () => {
  setSeekingOpen(false);

  setSearch("");              // clear search text
  setSelectedUsers([]);       // clear selected users

  // optional — reload full list again
  // fetchSeekingUsers();
};

// const buildCommentTree = (flatComments: any[]) => {
//   const map: Record<number, any> = {};
//   const roots: any[] = [];

//   flatComments.forEach((c) => {
//     // ensure ChildComments array exists for easier recursion
//     map[c.NominationCommentsID] = { ...c, ChildComments: c.ChildComments || [] };
//   });

//   flatComments.forEach((c) => {
//     if (c.ParentCommentID && map[c.ParentCommentID]) {
//       map[c.ParentCommentID].ChildComments.push(map[c.NominationCommentsID]);
//     } else {
//       roots.push(map[c.NominationCommentsID]);
//     }
//   });

//   return roots;
// };



const buildCommentTree = (flatComments: any[]) => {
  // First, remove any duplicates
  const uniqueComments = flatComments.filter((comment, index, self) =>
    index === self.findIndex(c => 
      c.NominationCommentsID === comment.NominationCommentsID
    )
  );

  const map: Record<number, any> = {};
  const roots: any[] = [];

  uniqueComments.forEach((c) => {
    map[c.NominationCommentsID] = { ...c, ChildComments: c.ChildComments || [] };
  });

  uniqueComments.forEach((c) => {
    if (c.ParentCommentID && map[c.ParentCommentID]) {
      // Check if child is not already in the array
      const existingChild = map[c.ParentCommentID].ChildComments.find(
        (child: any) => child.NominationCommentsID === c.NominationCommentsID
      );
      if (!existingChild) {
        map[c.ParentCommentID].ChildComments.push(map[c.NominationCommentsID]);
      }
    } else {
      // Check if root is not already in the array
      const existingRoot = roots.find(
        root => root.NominationCommentsID === c.NominationCommentsID
      );
      if (!existingRoot) {
        roots.push(map[c.NominationCommentsID]);
      }
    }
  });

  return roots;
};


const handleReply = async (postId: number, text: string, parentId: number) => {
  if (!text.trim()) return;
const tempId = crypto.randomUUID();
  // Optimistically update the UI to show the new reply
  const newComment = {
    NominationCommentsID: tempId, // Temporarily use the current timestamp as ID (optimistic approach)
    NominationID: postId,
    ParentCommentID: parentId,
    CommentedBy: username, 
    CommentsText: text,
    CommentedAt: new Date().toISOString(),
    ChildComments: [], 
  };

  // Update the state to include the new reply immediately
  setComments((prev) => [
    ...prev,
    {
      ...newComment,
      ChildComments: [], // Empty initially
    },
  ]);

  try {
    // Make the API call to persist the new comment
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

    // Get the actual comment ID from the response
    const newId = res.data;

    // Update the comment ID and other details once the response is received
    setComments((prev) =>
      prev.map((comment) =>
        comment.NominationCommentsID === newComment.NominationCommentsID
          ? { ...comment, NominationCommentsID: newId }
          : comment
      )
    );
    
  } catch (err) {
    console.error("Error posting reply:", err);
    // Optionally, you could revert the optimistic update here in case of an error
  }
};

  return (
    <div>
      {posts.length === 0 ? (
        <p className="text-gray-500 py-3 text-sm text-center">
          Loading feeds...
        </p>
      ) : (
        posts.map((post ,index) => {
          const NominationID = post.NominationID;
          const isLiked = likedPosts.includes(NominationID);
          const isCommentOpen = showComments[NominationID] || false;

        //  const filteredFlat = (comments || []).filter(c => c.NominationID === post.NominationID);
       
        const filteredFlat = (comments || [])
  .filter(c => c.NominationID === post.NominationID)
  // Remove duplicates by creating a Map
  .reduce((acc: any[], current) => {
    const existing = acc.find(item => 
      item.NominationCommentsID === current.NominationCommentsID
    );
    if (!existing) {
      acc.push(current);
    }
    return acc;
  }, []);
const nestedComments = buildCommentTree(filteredFlat);

          return (
            <div
              key={index}
              className="p-4 sm:p-6 bg-white border-b-2 border-b-gray-100 hover:shadow-md transition">
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
                          <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 flex items-center">
                           <Trophy size={16}/>  <span className="ms-1"> {post.AwardCategory}</span>
                        </span>
                         <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 flex items-center">
                           <UsersRound size={16}/>  <span className="ms-1"> {post.NominatedCount}</span>
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">
                        {post.Tenant}
                      </p>
                    </div>
                  <MoreHorizontal
                    className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                      // Add the view if not already viewed
                      if (!viewed[post.NominationID]) {
                        await addView(post.NominationID);  // Add view on backend
                        setViewed((prev) => ({ ...prev, [post.NominationID]: true }));
                      }
                      await fetchViews(post.NominationID);
                      setShowViewers(false);
                      setSelectedPost(post);
                      setShowModal(true);
                    }}/>
                  </div>
                   <p
                    className={`text-gray-800 mt-2 text-sm leading-relaxed transition-all duration-300 ${
                      expandedDesc[NominationID] ? "" : "line-clamp-2" }`}>
                    {post.Description}
                  </p>
                  {post.Description?.length > 120 && (
                    <button
                      type="button"
                      onClick={() => toggleDescription(NominationID)}
                      className="text-blue-600 text-xs mt-1 hover:underline font-medium">
                      {expandedDesc[NominationID] ? "Show less" : "Show more"}
                    </button>
                  )}

                <div className="flex justify-between border-b-1 border-gray-200 mt-3 py-3">
                  <span
                    className="text-sm font-medium cursor-pointer hover:text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLikeList(post.LikedBy || []);
                      setShowLikePopup(true);
                       setSelectedPost(post);
                        }}>
                    {/* {getLikeText(post.LikedBy, userId, username )} */}
                  </span>
                </div>
                  <div className="flex justify-between mt-3 pt-3">
                    <div className="flex items-center space-x-2">
                      <FeedLikeComponent
                        post={post}
                        isLiked={isLiked}
                        onLike={() => handleLike(post)}/>
                       <button
                        onClick={() => toggleComments(NominationID)}
                        className="flex items-center space-x-2 text-gray-500 hover:text-blue-500">
                        <MessageCircle className="w-4 h-4" />
                        {/* <span className="text-sm font-medium">
                          {post.Comments} Comments
                        </span> */}
                      </button>
                       <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPost(post);
                            fetchSeekingUsers();
                            setSeekingOpen(true);
                          }}
                          className="p-1"
                          title="Send"  >
                           <Send size={18} className="text-gray-600 hover:text-black" />
                        </button>
                    </div>
                    <div
                      className="flex items-center text-gray-500 text-sm cursor-pointer"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                      // if (!viewed[post.NominationID]) {
                      //   await addView(post.NominationID);
                      //   setViewed(prev => ({ ...prev, [post.NominationID]: true }));
                      // }

                      await fetchViews(post.NominationID);
                      setShowViewers(true) ;
                      setSelectedPost(post);
                    }} >
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

                    {/* 💬 Comments */}
                    <span
                      className="cursor-pointer hover:text-blue-600"
                      onClick={() => {
                        setSelectedPost(post);
                        setActiveTab("comments");
                        setReactionOpen(true);
                      }}
                    >
                      {post.Comments} Comments
                    </span>

                    <span className="px-2 text-[18px] text-[#9CA3AF] leading-none">•</span>

                    {/* 👁 Views */}
                    <span
                      className="cursor-pointer hover:text-blue-600"
                      onClick={async () => {
                        await fetchViews(post.NominationID);
                        setSelectedPost(post);
                        setActiveTab("views");
                        setReactionOpen(true);
                      }}
                    >
                      {viewsMap[post.NominationID] || 0} Views
                    </span>

                  </div>

                  {/* <span className="text-sm font-medium">
                    {post.Comments} Comments
                  </span>
                  {post.LikedBy?.length || 0} Likes
                  <Eye className="w-4 h-4 mr-1" />
                  <span>{viewsMap[post.NominationID] || 0} Views</span> */}
                </div>
                  </div>
                   {isCommentOpen && (
                    <FeedComment
                      post={post}
                      username={username || ""}
                      comments={nestedComments}        
                      commentText={commentText[NominationID] || ""}
                      setCommentText={(v) =>
                        setCommentText((prev) => ({ ...prev, [NominationID]: v }))
                      }
                      handleAddComment={() => handleAddComment(post)}
                      handleReply={handleReply}        
                    />)}
                </div>
              </div>
            </div>
          );
        })
      )}

{/* Like Modal */}
          {showLikePopup && (
            <FeedLikePop
              likedBy={likeList}
              onClose={() => setShowLikePopup(false)}
              post={selectedPost}
              item
            />
          )}
          {seekingOpen && (
            <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
              <div className="bg-white w-[680px] rounded-xl shadow-xl overflow-hidden">
                <div className="flex justify-between items-center px-6 h-[56px] border-b border-gray-300">
                  <h3 className="font-medium text-[15px] text-gray-800">
                    Send To
                  </h3>
                  <button onClick={resetSeekingPopup}>
                  {/* <button onClick={() => setSeekingOpen(false)}> */}
                    <X size={18} className="text-gray-600" />
                  </button>
                </div>
                <div className="px-6 pt-4 pb-2">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"
                      viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input type="text" placeholder="Search" value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm text-gray-700
                        placeholder-gray-400 focus:outline-none focus:border-gray-400"/>
                  </div>
                </div>
                <div className="max-h-[360px] overflow-y-auto">
                  {seekingUsers
                    .filter(u =>
                      u.UserName.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((u) => (
                      <div
                        key={u.UserID}
                        className="flex items-center justify-between px-6 h-[64px] border-b border-gray-300
                          hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedUsers(prev =>
                            prev.includes(u.UserID)
                              ? prev.filter(id => id !== u.UserID)
                              : [...prev, u.UserID]
                          );}}>
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold themeColor">
                            {u.UserName.charAt(0).toUpperCase()}
                          </div>
                          <div className="leading-tight">
                            <div className="text-sm font-medium text-gray-800">
                              {u.UserName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {u.TenantName}
                            </div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(u.UserID)}
                          readOnly
                          className="w-4 h-4 border-gray-400 accent-gray-700"/>
                      </div>
                    ))}
                </div>
                <div className="px-6 py-4 border-t border-gray-300">
                  <button
                    onClick={sendSeekingUser}
                    className="w-full py-2.5 rounded-md btn-theme">
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
          {reactionOpen && (
            <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
              <div className="bg-white w-[520px] rounded-xl shadow-xl overflow-hidden">
                <div className="px-6 pt-4 border-b">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-[15px] font-medium text-gray-800">
                      Reactions
                    </h3>
                    <button onClick={() => setReactionOpen(false)}>
                      <X size={18} className="text-gray-500" />
                    </button>
                  </div>
                  <div className="flex gap-8 relative">
                    <button
                      onClick={() => setActiveTab("likes")}
                      className="relative flex items-center gap-1 pb-3 text-sm">
                      <Heart
                        size={16}
                        className={
                          activeTab === "likes"
                            ? "text-red-500 fill-red-500"
                            : "text-gray-500"
                        }/>
                      <span>{likeList.length}</span>

                      {activeTab === "likes" && (
                        <div className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-green-600 rounded-full" />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab("comments")}
                      className="relative flex items-center gap-1 pb-3 text-sm">
                      <MessageCircle
                        size={16}
                        className={
                          activeTab === "comments"
                            ? "text-blue-600"
                            : "text-gray-500"
                        } />
                      <span>
                        {
                          comments.filter(
                            c => c.NominationID === selectedPost?.NominationID
                          ).length
                        }
                      </span>
                      {activeTab === "comments" && (
                        <div className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-green-600 rounded-full" />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab("views")}
                      className="relative flex items-center gap-1 pb-3 text-sm">
                      <Eye
                        size={16}
                        className={
                          activeTab === "views"
                            ? "text-blue-600"
                            : "text-gray-500"
                        }/>
                      <span>{viewerList.length}</span>
                      {activeTab === "views" && (
                        <div className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-green-600 rounded-full" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="max-h-[420px] overflow-y-auto">
                  {activeTab === "likes" &&
                    likeList.map((u: any, i: number) => (
                      <div
                        key={u.UserID ?? i}
                        className="flex items-center gap-4 px-6 h-[64px]
                                  border-b border-gray-100 last:border-b-0">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full themeColor
                                          text-white flex items-center justify-center
                                          text-sm font-semibold">
                            {getInitial(u.UserName)}
                          </div>
                          <div className="absolute -bottom-1 -right-1
                                          w-4 h-4 bg-white rounded-full
                                          flex items-center justify-center shadow-sm">
                            <Heart size={11} className="text-red-500" />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">
                            {u.UserName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {u.Tenant}
                          </div>
                        </div>
                      </div>
                    ))}
                  {activeTab === "comments" &&
                    comments
                      .filter(
                        c => c.NominationID === selectedPost?.NominationID
                      )
                      .map((c: any) => (
                        <div
                          key={c.NominationCommentsID}
                          className="px-6 py-4 border-b border-gray-100"
                        >
                          <div className="flex gap-3 items-center mb-1">
                            <div className="relative">
                              <div className="w-8 h-8 rounded-full themeColor
                                text-white flex items-center justify-center text-xs font-semibold">
                                {getInitial(c.CommentedBy)}
                              </div>

                              <div className="absolute -bottom-1 -right-1
                                w-4 h-4 bg-white rounded-full
                                flex items-center justify-center shadow-sm">
                                <MessageCircle size={11} className="text-blue-600" />
                              </div>
                            </div>

                            <span className="text-sm font-medium text-gray-800">
                              {c.CommentedBy || "Unknown User"}
                            </span>
                          </div>
                          <p className="ml-11 text-sm text-gray-700">
                            {c.CommentsText}
                          </p>
                        </div>
                  ))}
                  {activeTab === "views" &&
                    viewerList.map((v: any, i: number) => (
                      <div
                        key={v.UserID ?? i}
                        className="flex items-center gap-4 px-6 h-[64px]
                          border-b border-gray-100 last:border-b-0"
                      >
                        <div className="relative">
                          <div
                            className="w-9 h-9 rounded-full bg-teal-600
                              text-white flex items-center justify-center
                              text-sm font-semibold"
                          >
                            {getInitial(v.UserName || v.ViewedBy)}
                          </div>

                          <div className="absolute -bottom-1 -right-1
                            w-4 h-4 bg-white rounded-full
                            flex items-center justify-center shadow-sm">
                            <Eye size={11} className="text-blue-600" />
                          </div>
                        </div>

                        <div className="text-sm font-medium text-gray-800">
                          {v.UserName || v.ViewedBy || "Unknown User"}
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            </div>
          )}

 {/* View Modal */}
      {/* <ViewerModal
      item
      post={selectedPost}
              open={showViewers}
              viewers={viewerList}
              onClose={() => setShowViewers(false)}
            /> */}
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

export default PostCard;
