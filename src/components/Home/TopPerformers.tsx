import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../ContextAPI/AuthContext";
import axios from "axios";
 
interface Performer {
  CategoryName: string;
  Name: string;
  Likes: number;
  Comments: number;
  Views?: number;
}
 
const TopPerformers: React.FC = () => {
  const { authToken } = useAuth();
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
 
  const ITEMS_PER_PAGE = 1; // one category per slide
  const apiUrl = import.meta.env.VITE_API_URL;
 
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/topperformers`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
        debugger;
        setPerformers(res.data);
        console.log("Top Performers:", res.data);
      } catch (err) {
        console.error("Error fetching performers:", err);
      }
    };
 
    fetchUser();
  }, [authToken, apiUrl]);
 
  // ✅ Group by category and take top 3
  // const groupedPerformers1 = useMemo(() => {
  //   const grouped: Record<string, Performer[]> = {};
 
  //   performers.forEach((item) => {
  //     if (!grouped[item.CategoryName]) {
  //       grouped[item.CategoryName] = [];
  //     }
  //     grouped[item.CategoryName].push(item);
  //   });
 
  //   // Sort each category and keep top 3
  //   Object.keys(grouped).forEach((category) => {
  //     grouped[category] = grouped[category]
  //       .sort((a, b) => b.Likes - a.Likes)
  //       .slice(0, 3);
  //   });
 
  //   return grouped;
  // }, [performers]);
  const groupedPerformers = useMemo(() => {
  const grouped: Record<string, Performer[]> = {};

  performers.forEach((item) => {
    // ❌ Skip if Likes = 0
    if (item.Likes === 0) return;

    if (!grouped[item.CategoryName]) {
      grouped[item.CategoryName] = [];
    }
    grouped[item.CategoryName].push(item);
  });

  // Sort each category and keep top 3
  Object.keys(grouped).forEach((category) => {
    grouped[category] = grouped[category]
      .sort((a, b) => b.Likes - a.Likes)
      .slice(0, 3);
  });

  return grouped;
}, [performers]);
 
  const categories = Object.keys(groupedPerformers);
  const totalPages = categories.length;
 
  const currentCategory = categories[currentPage];
  const currentPerformers = groupedPerformers[currentCategory] || [];
 
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 mb-4 text-lg">
        Top 3 Performers in Each Category
      </h3>
 
      {/* {currentCategory && (
        <>
          <h4 className="font-semibold text-gray-900 mb-4">
            {currentCategory}
          </h4>
 
          <div className="space-y-3 min-h-[120px]">
            {currentPerformers.map((person, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-700 text-sm font-medium">
                  {person.Name.trim()}
                </span>
                <span className="text-blue-600 font-semibold text-sm">
                  {person.Likes} Likes
                </span>
              </div>
            ))}
          </div>
        </>
      )} */}
       {categories.length > 0 && (
      <>
        {/* ✅ Category Name at Top */}
        <h4 className="font-semibold text-green-700 mb-4 text-md">
          {currentCategory}
        </h4>

        {/* ✅ Performers List */}
        <div className="space-y-3 min-h-[120px]">
          {currentPerformers.map((person, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-gray-700 text-sm font-medium">
                {person.Name.trim()}
              </span>
              <span className="text-blue-600 font-semibold text-sm">
                {person.Likes} Likes
              </span>
            </div>
          ))}
        </div>
      </>
    )}

 
      {/* Pagination dots */}
      <div className="flex justify-center gap-2 mt-6">
        {categories.map((_, i) => (
          <span
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`h-2 w-2 rounded-full cursor-pointer transition-all ${
              i === currentPage ? "bg-green-700 w-6" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
 
export default TopPerformers;