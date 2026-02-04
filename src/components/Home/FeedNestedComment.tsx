import React, { useState } from "react";
import { Send } from "lucide-react";

interface CommentType {
  NominationCommentsID: number;
  NominationID: number;
  CommentedBy: string;
  CommentsText: string;
  CommentedAt: string;
  ParentCommentID: number | null;
  ChildComments: CommentType[];
}

interface FeedNestedCommentProps {
  comment: CommentType;
  postId: number;
  handleReply: (postId: number, text: string, parentId: number) => Promise<void>;
}

const FeedNestedComment: React.FC<FeedNestedCommentProps> = ({
  comment,
  postId,
  handleReply,
}) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [openChildren, setOpenChildren] = useState(false);

  const hasChildren = (comment.ChildComments?.length || 0) > 0;



  return (
    <div className="space-x-2">

      {/* Single Comment */}
      <div className="flex items-start space-x-3 bg-white py-1 rounded-md">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
          {comment.CommentedBy?.charAt(0).toUpperCase()}
          
        </div>

        <div className="w-full">
           {/* Name + Date */}
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-800 text-sm">
              {comment.CommentedBy}
            </p>

            <p className="text-xs text-gray-500">
              {comment.CommentedAt}
            </p>
          </div>
          {/* <p className="font-semibold text-gray-800 text-sm">
            {comment.CommentedBy}
          </p> */}
         

          <p className="text-gray-700 text-sm">{comment.CommentsText}</p>
         

          <div className="flex items-center space-x-3 mt-1">

            {/* Reply button */}
            <button
              className="text-xs text-blue-600"
              onClick={() => setShowReply(!showReply)}
            >
              Reply
            </button>

            {/* Accordion toggle */}
            {/* {hasChildren && (
              <button
                className="text-xs text-gray-600"
                onClick={() => setOpenChildren(!openChildren)}
              >
                {openChildren ? "Hide Replies ▲" : `View Replies (${comment.ChildComments?.length}) ▼`}
              </button>
            )} */}
            {hasChildren && (
  <button
    className="text-xs text-gray-600"
    onClick={() => setOpenChildren(!openChildren)}
  >
    {openChildren
      ? "Hide Replies ▲"
      : `View Replies (${comment.ChildComments.length}) ▼`}
  </button>
)}

          </div>

          {/* Reply input UI */}
          {showReply && (
//             <div className="mt-2">
//               <textarea
//                 value={replyText}
//                 onChange={(e) => setReplyText(e.target.value)}
//                  className="
//               w-full px-4 py-2 pr-20 border border-gray-300 rounded-md
//               text-sm resize-none focus:outline-none focus:border-blue-500
//               focus:ring-1 focus:ring-blue-500 overflow-hidden
//             "
//                 placeholder="Write a reply..."
//               />
//               <button
//                 className="mt-1 bg-blue-600 text-white px-2 py-1 rounded text-xs"
//                 onClick={async () => {
//   await handleReply(postId, replyText, comment.NominationCommentsID);
//   setReplyText("");
//   setShowReply(false);
// }}

//               >
//                 Send
//               </button>
//             </div>


 <div className="flex-1 relative mt-2">
          <textarea
            rows={1}
           value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="
              w-full px-4 py-2 pr-20 border border-gray-300 rounded-md
              text-sm resize-none focus:outline-none focus:border-blue-500
              focus:ring-1 focus:ring-blue-500 overflow-hidden
            "
             placeholder="Write a reply..."
            style={{ minHeight: "38px" }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "38px";
              t.style.height = t.scrollHeight + "px";
            }}
          />

          <div className="absolute right-3 top-[10px]">
            <button
             onClick={async () => {
  await handleReply(postId, replyText, comment.NominationCommentsID);
  setReplyText("");
  setShowReply(false);
}}
              className="text-gray-400 hover:text-gray-600"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>








          )}
        </div>
      </div>

      {/* Accordion - Nested Comments */}
      {/* {openChildren && hasChildren && (
        <div className="mt-2 ml-3 border-l-2 border-gray-300 pl-3">
          {comment.ChildComments?.map((child) => (
            <FeedNestedComment
              key={child.NominationCommentsID}
              comment={child}
              postId={postId}
              handleReply={handleReply}
            />
          ))}
        </div>
      )} */}
      {openChildren && hasChildren && (
  <div className="mt-2 ml-3 pl-3">
    {comment.ChildComments.map((child,index) => (
      <FeedNestedComment
        // key={child.NominationCommentsID}
         key={`${child.NominationCommentsID}-${index}`} 
        comment={child}
        postId={postId}
        handleReply={handleReply}
      />
    ))}
  </div>
)}

    </div>
  );
};

export default FeedNestedComment;
