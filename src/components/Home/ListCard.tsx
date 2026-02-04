import React from "react";
import PostCard from "./PostCard";
import type { Feed } from "../../dataTypes/nomination";

interface ListCardProps {
  list: Feed[];
  setList?: React.Dispatch<React.SetStateAction<Feed[]>>;
}

const ListCard: React.FC<ListCardProps> = ({
  list,
  setList,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      {list.length === 0 ? (
        <p className="text-center text-gray-500 py-6">
          No business feeds found
        </p>
      ) : (
        <PostCard
          posts={list}
          setPosts={setList ?? (() => {})}
        />
      )}
    </div>
  );
};

export default ListCard;;
