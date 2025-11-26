import React, { useEffect, useRef } from "react";
import { Send } from "lucide-react";
import FeedNestedComment from "./FeedNestedComment";

interface CommentSectionProps {
  post: any;
  username: string;
  comments: any[];
  commentText: string;
  setCommentText: (v: string) => void;
  handleAddComment: () => void;
  handleReply: (postId: number, text: string, parentId: number) => Promise<void>;
}

const FeedComment: React.FC<CommentSectionProps> = ({
  post,
  username,
  comments,
  commentText,
  setCommentText,
  handleAddComment,
  handleReply 
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when comments increase
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);
 console.log(post)
  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      {/* Typing Box */}
      <div className="flex space-x-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
          {username?.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 relative">
          <textarea
            placeholder="Add a comment..."
            rows={1}
            value={commentText || ""}
            onChange={(e) => setCommentText(e.target.value)}
            className="
              w-full px-4 py-2 pr-20 border border-gray-300 rounded-md
              text-sm resize-none focus:outline-none focus:border-blue-500
              focus:ring-1 focus:ring-blue-500 overflow-hidden
            "
            style={{ minHeight: "38px" }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "38px";
              t.style.height = t.scrollHeight + "px";
            }}
          />

          <div className="absolute right-3 top-[10px]">
            <button
              onClick={handleAddComment}
              className="text-gray-400 hover:text-gray-600"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}


      <div className="mt-3">
      {comments.map((c) => (
        <FeedNestedComment
          key={c.NominationCommentsID}
          comment={c}
          postId={post.NominationID}
          handleReply={handleReply}
        />
      ))}
    </div>
    </div>
  );
};

export default FeedComment;
