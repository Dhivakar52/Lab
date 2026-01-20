import React from "react";
import PostCard from "./PostCard";
import type { Feed } from "../../dataTypes/nomination";

interface BusinessCardProps {
  business: Feed[];
  setBusiness?: React.Dispatch<React.SetStateAction<Feed[]>>;
}

const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  setBusiness,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      {business.length === 0 ? (
        <p className="text-center text-gray-500 py-6">
          No business feeds found
        </p>
      ) : (
        <PostCard
          posts={business}
          setPosts={setBusiness ?? (() => {})}
        />
      )}
    </div>
  );
};

export default BusinessCard;
