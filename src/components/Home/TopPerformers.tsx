import React, { useEffect, useState } from "react";
import { useAuth } from "../ContextAPI/AuthContext";
import axios from "axios";

interface Performer {
  CategoryName: string;
  Name: string;
  Likes: number;
  Comments: number;
}

const TopPerformers: React.FC = () => {
  // const [performer, setPerformer] = useState<Performer[]>([]);
  const { authToken } = useAuth();
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const ITEMS_PER_PAGE = 3;

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
        const topThree = res.data.sort(
          (a: Performer, b: Performer) => b.Likes - a.Likes
        );
        setPerformers(topThree);

        // const topThree = res.data
        //   .sort((a: Performer, b: Performer) => b.Likes - a.Likes)
        //   .slice(0, 3);

        // setPerformer(topThree);
        console.log(" Top 3 Performers:", topThree);
      } catch (err) {
        console.error("Error fetching performers:", err);
      }
    };

    fetchUser();
  }, [authToken, apiUrl]);
  const totalPages = Math.ceil(performers.length / ITEMS_PER_PAGE);

  const currentPerformers = performers.slice(
    currentPage * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4 text-lg">
          Top 3 Performers in Each Category
        </h3>

        <h4 className="font-semibold text-gray-900 mb-4">
          Customer Focus
        </h4>

        <div className="space-y-3 min-h-[120px]">
          {currentPerformers.map((person, index) => (
            <div
              key={index}
              className="flex justify-between items-center">
              <span className="text-gray-700 text-sm font-medium">
                {person.Name.trim()}
              </span>
              <span className="text-blue-600 font-semibold text-sm">
                {person.Likes} Likes
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <span
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`h-2 w-2 rounded-full cursor-pointer transition-all
                ${i === currentPage
                  ? "bg-green-700 w-6"
                  : "bg-gray-300"}
              `}/>
          ))}
        </div>
      </div>
);

};

export default TopPerformers;
