import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../ContextAPI/AuthContext";

interface NominationStatsType {
  "Nomination Others": number;
  "Self Nomination": number;
  "Pending Status": number;
  "Approved": number;
  "Rejected": number;
}

const NominationStats: React.FC = () => {
  const [stats, setStats] = useState<NominationStatsType | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  const { authToken, userId } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/nominationstats/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (res.data && res.data.length > 0) {
          setStats(res.data[0]);
        }
      } catch (err) {
        console.error("Error fetching nomination stats:", err);
      }
    };

    fetchStats();
  }, [apiUrl, userId]);

  return (
    <div className="bg-white shadow-md rounded-xl p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">
        Nomination Stats
      </h4>

      {!stats ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : (
        <div className="space-y-4 text-sm">

          {/* Nomination Others */}
          <div className="flex justify-between">
            <span className="text-gray-700">Nomination Others</span>
            <span className="font-bold text-blue-600">
              {stats["Nomination Others"]}
            </span>
          </div>

          {/* Self Nomination */}
          <div className="flex justify-between">
            <span className="text-gray-700">Self Nomination</span>
            <span className="font-bold text-blue-600">
              {stats["Self Nomination"]}
            </span>
          </div>

          {/* Pending */}
          <div className="flex justify-between">
            <span className="text-gray-700">Pending Status</span>
            <span className="font-bold text-orange-600">
              {stats["Pending Status"]}
            </span>
          </div>

          {/* Approved */}
          <div className="flex justify-between">
            <span className="text-gray-700">Approved</span>
            <span className="font-bold text-green-600">
              {stats["Approved"]}
            </span>
          </div>

         

        </div>
      )}
    </div>
  );
};

export default NominationStats;
