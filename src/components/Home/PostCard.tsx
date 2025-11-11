import React from "react";
import { Heart, MessageCircle, Share, MoreHorizontal, Eye } from "lucide-react";
import type { Feed } from "../../dataTypes/nomination";


interface PostCardProps {
  posts: Feed[];
  setPosts: React.Dispatch<React.SetStateAction<Feed[]>>;
}

const PostCard: React.FC<PostCardProps> = ({ posts, setPosts }) => {
//   const { authToken } = useAuth();
//   const apiUrl = import.meta.env.VITE_API_URL;

  return (
    <div className="space-y-6">
      {posts.length === 0 ? (
        <p className="text-gray-500 text-sm text-center">Loading feeds...</p>
      ) : (
        posts.map((post, index) => (
          <div
            key={index}
            className="p-4 sm:p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition"
          >
            <div className="flex space-x-3">
              {/* Avatar */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                {post.Nominee.charAt(0).toUpperCase()}
              </div>

              {/* Post Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {post.Nominee}
                      </h3>
                      <div className="flex flex-wrap gap-1 sm:gap-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          👥 {post.NominatedCount}  Nominated
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          🏆 {post.AwardCategory}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">
                      {post.Tenant}
                    </p>
                  </div>
                  <MoreHorizontal className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>

                {/* Description */}
                <p className="text-gray-800 mt-2 sm:mt-3 text-sm leading-relaxed">
                  {post.Description}
                </p>

                {/* Stats */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 sm:mt-4 pt-3 space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-4 sm:space-x-6">
                    <button
                      className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
                      onClick={() => {
                        // Example like button logic
                        const updatedPosts = posts.map((p, i) =>
                          i === index ? { ...p, Likes: p.Likes + 1 } : p
                        );
                        setPosts(updatedPosts);
                      }}
                    >
                      <Heart className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {post.Likes} Likes
                      </span>
                    </button>

                    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {post.Comments} Comments
                      </span>
                    </button>

                    <button className="text-gray-500 hover:text-gray-700 transition-colors">
                      <Share className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center text-gray-500 text-sm">
                    <Eye className="w-4 h-4 mr-1" />
                    <span>{post.Views} Views</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PostCard;
