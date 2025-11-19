import React, { useEffect, useState } from "react";
import { useAuth } from "../ContextAPI/AuthContext";
import axios from "axios";

interface NomineeStats {
  "Nomination Others"?: number;
  "Self Nomination"?: number;
  "Pending Status"?: number;
  "Approved"?: number;
}

const NominationStats: React.FC = () => {
  const [nomineeStat, setNomineeStat] = useState<NomineeStats | null>(null);
  const { authToken, userId } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res2 = await axios.get(`${apiUrl}/api/nominationstats/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        // API returns an array with one object, so take the first one
        setNomineeStat(res2.data[0]);
        // console.log("✅ Nominee Stats:", res2.data[0]);
      } catch (err) {
        console.error("❌ Error fetching user:", err);
      }
    };

    fetchUser();
  }, [authToken, userId, apiUrl]);

  // Optional: Loading state
  if (!nomineeStat) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 text-center text-gray-500">
        Loading stats...
      </div>
    );
  }

  // Build the data dynamically
  const stats = [
    { label: "Nomination Others", value: nomineeStat["Nomination Others"] || 0, color: "text-blue-600" },
    { label: "Self Nomination", value: nomineeStat["Self Nomination"] || 0, color: "text-blue-600" },
    { label: "Pending Status", value: nomineeStat["Pending Status"] || 0, color: "text-orange-600" },
    { label: "Approved", value: nomineeStat["Approved"] || 0, color: "text-green-600" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <h3 className="font-semibold text-gray-900 mb-4 text-base sm:text-lg">
        Nomination Stats
      </h3>

      <div className="space-y-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">{stat.label}</span>
            <span className={`font-semibold text-lg ${stat.color}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NominationStats;
