import React, { useEffect, useRef } from "react";
import { Send } from "lucide-react";

interface CommentSectionProps {
  post: any;
  username: string;
  comments: any[];
  commentText: string;
  setCommentText: (v: string) => void;
  handleAddComment: () => void;
}

const FeedComment: React.FC<CommentSectionProps> = ({
  post,
  username,
  comments,
  commentText,
  setCommentText,
  handleAddComment,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when comments increase
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

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
      {comments.length === 0 ? (
        <p className="text-center text-gray-500 text-xs mt-4">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="mt-4">

          {/* FIRST 5 COMMENTS */}
          {comments.slice(0, 5).map((c) => (
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

          {/* EXTRA COMMENTS IN SCROLL ZONE */}
          {comments.length > 5 && (
            <div
              ref={scrollRef}
              className="max-h-40 overflow-y-auto pr-1 mt-2 space-y-2 border border-gray-200 rounded-md p-2 bg-gray-50"
            >
              {comments.slice(5).map((c) => (
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
  );
};

export default FeedComment;
