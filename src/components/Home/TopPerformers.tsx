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
  const [performer, setPerformer] = useState<Performer[]>([]);
  const { authToken } = useAuth();
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

        const topThree = res.data
          .sort((a: Performer, b: Performer) => b.Likes - a.Likes)
          .slice(0, 3);

        setPerformer(topThree);
        // console.log(" Top 3 Performers:", topThree);
      } catch (err) {
        console.error("Error fetching performers:", err);
      }
    };

    fetchUser();
  }, [authToken, apiUrl]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <h3 className="font-semibold text-gray-900 mb-4 text-base sm:text-lg">
        Top 3 Performers in Each Category
      </h3>

      <div className="mb-6">
        <h4 className="font-medium text-gray-800 text-sm mb-3">Top Performers</h4>
        <div className="space-y-2">
          {performer.length === 0 ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : (
            performer.map((person , index) => (
              <div
                key={index}
                className="flex justify-between items-center"
              >
                <span className="text-blue-600 text-sm font-medium">
                  {person.Name.trim()}
                </span>
                <span className="text-blue-600 font-semibold">
                  {person.Likes} Likes
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TopPerformers;
