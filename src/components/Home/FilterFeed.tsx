import React from "react";

interface FilterBarProps {
  search: string;
  category: string;
  tenant: string;
  sortBy: string;
  categories: string[];
  tenants: string[];
  dispatch: any;
}

const FilterFeed: React.FC<FilterBarProps> = ({
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
        placeholder="Search by name..."
        value={search}
        onChange={(e) => dispatch({ type: "SET_SEARCH", payload: e.target.value })}
        className="w-full border px-3 py-2 rounded"
      />

      {/* Category Filter */}
      <select
        value={category}
        onChange={(e) => dispatch({ type: "SET_CATEGORY", payload: e.target.value })}
        className="w-full border px-3 py-2 rounded"
      >
        <option value="">All Categories</option>
        {categories.map((c, i) => (
          <option key={i} value={c}>{c}</option>
        ))}
      </select>

      {/* Tenant Filter */}
      <select
        value={tenant}
        onChange={(e) => dispatch({ type: "SET_TENANT", payload: e.target.value })}
        className="w-full border px-3 py-2 rounded"
      >
        <option value="">All Tenants</option>
        {tenants.map((t, i) => (
          <option key={i} value={t}>{t}</option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={sortBy}
        onChange={(e) => dispatch({ type: "SET_SORT", payload: e.target.value })}
        className="w-full border px-3 py-2 rounded"
      >
        <option value="">Sort By</option>
        <option value="likes">Likes</option>
        <option value="comments">Comments</option>
        <option value="views">Views</option>
      </select>

      {/* Reset */}
      <button
        onClick={() => dispatch({ type: "RESET" })}
        className="bg-gray-300 w-full py-2 rounded font-medium"
      >
        Reset Filters
      </button>

    </div>
  );
};

export default FilterFeed;
