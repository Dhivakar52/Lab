import React ,{useState} from "react";
import { Eye, MessageCircle } from "lucide-react";
import FeedLikeComponent from "./FeedLikeComponent";
import FeedComment from "./FeedComment";
import { useAuth } from "../ContextAPI/AuthContext";

interface Props {
  post: any;
  open: boolean;
  onClose: () => void;
 likedPosts: number[];
viewers:any;
  onLike: (post: any) => void;
  onComment: (post: any) => void;
onReply: (postId: number, text: string, parentId: number) => Promise<void>;


  comments: any[];
  commentText: any;
  setCommentText: any;

  userId: number | null;
  likeList: any[];
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

const PostFeedModal: React.FC<Props> = ({
  post,
  open,
  onClose,
likedPosts,
  onLike,
  onComment,
  onReply,
  comments,
  commentText,
  setCommentText: updateCommentText,
  userId, viewers
}) => {

const [activeTab, setActiveTab] = useState("like");
 const {username}= useAuth();
 const [showFullDesc, setShowFullDesc] = useState(false);

  
 
 
 if (!open || !post) return null;
  const isLiked = likedPosts.includes(post.NominationID);


  return (
    <div
      className="fixed inset-0 bg-black/10 flex items-center justify-center z-[999] pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-sm w-11/12 sm:w-3/4 lg:w-1/2 p-6 relative  overflow-hidden  max-h-[90vh]"
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

        
        {/* Description with See More / See Less */}
      <div className="mt-4">
        <p
          className={`text-gray-800 text-sm leading-relaxed transition-all ${
            showFullDesc ? "" : "line-clamp-3"
          }`}
        >
          {post.Description}
        </p>

        {post.Description?.length > 150 && (
          <button
            onClick={() => setShowFullDesc(!showFullDesc)}
            className="text-blue-600 text-sm font-medium mt-1 hover:underline"
          >
            {showFullDesc ? "Show less" : "Show more"}
          </button>
        )}
      </div>


        {/* Like text line */}
        <div className="flex justify-between border-b border-gray-200 mt-4 py-3">
          <span className="text-sm font-medium">
            {getLikeText(post.LikedBy || [], userId , username)}
          </span>
        </div>

        {/* Like / Comment / Views EXACT same UI */}
        <div className="mt-4 pt-3">
 <div className="flex">

  {/* Like Tab */}
  <div
    className={`flex items-center space-x-2 pb-2 px-4 cursor-pointer 
      ${activeTab === "like" ? "border-b-2 border-blue-500 text-blue-600" : "border-b-2 border-transparent"}`}
    onClick={(e) => {
      e.stopPropagation();
      setActiveTab("like");
    }}
  >
    <FeedLikeComponent
      post={post}
      isLiked={isLiked}
      onLike={() => onLike(post)}
    />
  </div>

  {/* Comments Tab */}
  <div
    className={`flex items-center space-x-2 pb-2 px-4 cursor-pointer 
      ${activeTab === "comments" ? "border-b-2 border-blue-500 text-blue-600" : "border-b-2 border-transparent"}`}
    onClick={(e) => {
      e.stopPropagation();
      setActiveTab("comments");
    }}
  >
    <MessageCircle className="w-4 h-4" />
    <span>{post.Comments} Comments</span>
  </div>

  {/* Views Tab */}
  <div
    className={`flex items-center space-x-2 pb-2 px-4 cursor-pointer 
      ${activeTab === "views" ? "border-b-2 border-blue-500 text-blue-600" : "border-b-2 border-transparent"}`}
    onClick={(e) => {
      e.stopPropagation();
      setActiveTab("views");
    }}
  >
    <Eye className="w-4 h-4" />
    <span>{viewers.length || 0} Views</span>
  </div>

</div>


  {/* CONTENT AREA */}
  <div className="my-3 py-3 ">
   {activeTab === "like" && (
  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
    {(post.LikedBy?.length || 0) === 0 ? (
      <p className="text-gray-500 text-sm text-center py-6">
        No likes yet
      </p>
    ) : (
      post.LikedBy.map((v: any, index: number) => (
        <div
        key={v.UserID || `${v.UserName}-${index}`}

          className="flex items-start gap-3 bg-gray-50 p-3 rounded"
        >
          {/* Avatar */}
          <div className="w-9 h-9 bg-green-200 text-green-800 rounded-full flex items-center justify-center font-semibold">
            {v.UserName?.charAt(0).toUpperCase()}
          </div>

          {/* User Info */}
          <div className="flex flex-col">
            <span className="text-gray-900 text-sm font-semibold">
              {v.UserName}
            </span>

            <span className="text-gray-600 text-xs">
              {v.Department}
            </span>

            <span className="text-gray-800 text-sm font-medium">
              {v.Tenant}
            </span>
            <span className="text-gray-500 text-xs">
            {v.ViewedAt}
            </span>
          </div>
        </div>
      ))
    )}
  </div>
)}


    {activeTab === "comments" && (
      
<div className="overflow-y-scroll h-[250px]">
  {/* Comments Section SAME LIKE POST CARD */}
<FeedComment
  post={post}
  username={username || ""}
  comments={comments}
  commentText={commentText[post.NominationID] || ""}
  setCommentText={(v: string) =>
    updateCommentText((prev: any) => ({
      ...prev,
      [post.NominationID]: v,
    }))
  }
  handleAddComment={() => onComment(post)}
  handleReply={onReply}
/>

</div>



     
    )}

    {activeTab === "views" && (
      <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
          {viewers.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-4">
              No viewers yet
            </p>
          ) : (
            viewers.map((v : any, index : number) => (
              <div
  key={index}
  className="flex items-start gap-3 bg-gray-50 p-3 rounded"
>
  <div className="w-9 h-9 bg-green-200 text-green-800 rounded-full flex items-center justify-center font-semibold">
    {v.ViewedBy?.charAt(0).toUpperCase()}
  </div>

  <div className="flex flex-col">
    <span className="text-gray-900 text-sm font-semibold">
      {v.ViewedBy}
    </span>

    
    <span className="text-gray-600 text-xs">
      {v.Department}
    </span>


    <span className="text-gray-800 text-sm font-medium">
      {v.Tenant}
    </span>

    <span className="text-gray-500 text-xs">
      {/* {new Date(v.ViewedAt).toLocaleString()} */}
      {v.ViewedAt}
    </span>
  </div>
</div>

              
            ))
          )}
        </div>
    )}
  </div>
</div>

      

      </div>
    </div>
  );
};

export default PostFeedModal;
