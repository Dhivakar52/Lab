import React from "react";
import type { FilterAction } from "../../dataTypes/feedfilter";

interface FilterFeedProps {
  search: string;
  category: string;
  tenant: string;
  sortBy: string;
  categories: string[];
  tenants: string[];
  dispatch: React.Dispatch<FilterAction>;
}

const FilterFeed: React.FC<FilterFeedProps> = ({
  search,
  category,
  tenant,
  sortBy,
  categories,
  tenants,
  dispatch,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg space-y-4">
      {/* Search */}
      <input
        type="text"
        placeholder="Search by nominee..."
        value={search}
        onChange={(e) =>
          dispatch({ type: "SET_SEARCH", payload: e.target.value })
        }
        className="w-full border px-3 py-2 rounded"
      />

      {/* Category */}
      <select
        value={category}
        onChange={(e) =>
          dispatch({ type: "SET_CATEGORY", payload: e.target.value })
        }
        className="w-full border px-3 py-2 rounded"
      >
        <option value="">All Categories</option>
        {categories.map((cat, index) => (
          <option key={index} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Tenant */}
      <select
        value={tenant}
        onChange={(e) =>
          dispatch({ type: "SET_TENANT", payload: e.target.value })
        }
        className="w-full border px-3 py-2 rounded"
      >
        <option value="">All Tenants</option>
        {tenants.map((tenantItem, index) => (
          <option key={index} value={tenantItem}>
            {tenantItem}
          </option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={sortBy}
        onChange={(e) =>
          dispatch({ type: "SET_SORT", payload: e.target.value })
        }
        className="w-full border px-3 py-2 rounded"
      >
        <option value="">Sort By</option>
        <option value="likes">Likes</option>
        <option value="comments">Comments</option>
        <option value="views">Views</option>
        {/* <option value="nominated">Nominated Count</option>
        <option value="name">Name</option>
        <option value="category">Category</option> */}
      </select>

      {/* Reset */}
      <button
        onClick={() => dispatch({ type: "RESET" })}
        className="w-full bg-gray-200 py-2 rounded font-medium"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default FilterFeed;