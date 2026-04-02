// src/components/PostCard/FeedComment.tsx - UPDATED VERSION
import React, { useEffect, useRef } from "react";
import { Send } from "lucide-react";
import FeedNestedComment from "./FeedNestedComment";
import { useComments, useAddComment } from "../../hooks/useComments"; 
import { useAuth } from "../ContextAPI/AuthContext";

interface CommentSectionProps {
  post: any;
  username: string;
  // comments prop removed - now using React Query
  commentText: string;
  setCommentText: (v: string) => void;
  handleAddComment?: () => void; // Made optional - now using React Query
  handleReply?: (postId: number, text: string, parentId: number) => Promise<void>; // Made optional
}

const FeedComment: React.FC<CommentSectionProps> = ({
  post,
  username,
  commentText,
  setCommentText,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { } = useAuth();
  
  // Use React Query hooks
  const { data: comments = [], isLoading, error } = useComments(post.NominationID);
  const { mutate: addComment, isPending } = useAddComment();

  // Auto-scroll to bottom when comments increase
  useEffect(() => {
    if (scrollRef.current && comments.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  // Handle adding comment with React Query
  const handleAddComment = () => {
    if (!commentText.trim()) return;
    
    addComment({
      nominationId: post.NominationID,
      text: commentText,
    }, {
      onSuccess: () => {
        setCommentText(""); // Clear input on success
      },
    });
  };

  // Handle reply with React Query
  const handleReply = async (postId: number, text: string, parentId: number) => {
    if (!text.trim()) return;
    
    addComment({
      nominationId: postId,
      text: text,
      parentCommentId: parentId,
    }, {
      onSuccess: () => {
        // Optionally clear any reply text state if you have it
      },
    });
  };

  // Build comment tree (same as before)
  const buildCommentTree = (flatComments: any[]) => {
    const uniqueComments = flatComments.filter((comment, index, self) =>
      index === self.findIndex(c => c.NominationCommentsID === comment.NominationCommentsID)
    );

    const map: Record<number, any> = {};
    const roots: any[] = [];

    uniqueComments.forEach((c) => {
      map[c.NominationCommentsID] = { ...c, ChildComments: c.ChildComments || [] };
    });

    uniqueComments.forEach((c) => {
      if (c.ParentCommentID && map[c.ParentCommentID]) {
        const existingChild = map[c.ParentCommentID].ChildComments.find(
          (child: any) => child.NominationCommentsID === c.NominationCommentsID
        );
        if (!existingChild) {
          map[c.ParentCommentID].ChildComments.push(map[c.NominationCommentsID]);
        }
      } else {
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

  const nestedComments = buildCommentTree(comments);

  // Show loading state
  if (isLoading) {
    return (
      <div className="py-3">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="py-3 text-center text-red-500 text-sm">
        Failed to load comments. Please try again.
      </div>
    );
  }

  return (
    <div>
      {/* Comments List */}
      <div className="py-3 max-h-96 overflow-y-auto" ref={scrollRef}>
        {nestedComments.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          nestedComments.map((c) => (
            <FeedNestedComment
              key={c.NominationCommentsID}
              comment={c}
              postId={post.NominationID}
              handleReply={handleReply}
            />
          ))
        )}
      </div>

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
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
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
              disabled={isPending || !commentText.trim()}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedComment;