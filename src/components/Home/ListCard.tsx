import React from "react";
import { Heart, MessageCircle, Share, MoreHorizontal, Eye } from "lucide-react";
import type { Feed } from "../../dataTypes/nomination";

interface ListCardProps {
  list: Feed[];
}

const ListCard: React.FC<ListCardProps> = ({ list }) => {
  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full">
      {list.length === 0 ? (
        <p className="text-gray-500 text-sm text-center">No items found.</p>
      ) : (
        list.map((item: any, index: number) => {
          const feed = item.feed ?? item;

          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex gap-3">

                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                  {feed.Nominee?.charAt(0)?.toUpperCase()}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{feed.Nominee}</h3>

                      {/* CHIPS */}
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs">
                          🏆 {feed.AwardCategory}
                        </span>

                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs">
                          👥 {feed.NominatedCount} Nominated
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mt-1">{feed.Tenant}</p>
                    </div>

                    <MoreHorizontal className="text-gray-400" />
                  </div>

                  {/* Description */}
                  <p className="mt-2 text-gray-700 text-sm">{feed.Description}</p>

                  {/* Footer */}
                  <div className="flex justify-between items-center mt-4 pt-3 border-t">
                    <div className="flex items-center gap-6 text-gray-500 text-sm">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4" /> {feed.Likes} Likes
                      </span>

                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4" /> {feed.Comments} Comments
                      </span>

                      <Share className="w-4 cursor-pointer" />
                    </div>

                    <div className="flex items-center text-gray-500 text-xs">
                      <Eye className="w-4 mr-1" /> {feed.Views} Views
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ListCard;
