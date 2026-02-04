import React from "react";
import { Heart, MessageCircle, Eye } from "lucide-react";

const leaderboardData = [
  { rank: 1, name: "Rajesh Kumar", org: "SRM Global Hospital", likes: 250, comments: 128, views: 440 },
  { rank: 2, name: "Rajesh Kumar", org: "SRM Global Hospital", likes: 245, comments: 122, views: 410 },
  { rank: 3, name: "Rajesh Kumar", org: "SRM Global Hospital", likes: 235, comments: 118, views: 400 },
  { rank: 4, name: "Rajesh Kumar", org: "SRM Global Hospital", likes: 189, comments: 98, views: 390 },
  { rank: 5, name: "Rajesh Kumar", org: "SRM Global Hospital", likes: 169, comments: 90, views: 380 },
];

const Leader = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-xl font-semibold mb-6">Leaderboard</h1>

        {/* TOP 3 */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <TopCard rank="1st" name="Ravi Kumar" org="SRM Global Hospital" />
          <TopCard rank="2nd" name="Vijay Kumar" org="SRM University - AP" />
          <TopCard rank="3rd" name="Santhosh Narayanan" org="SRM Tech" />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">#Rank</th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-center">Likes</th>
                <th className="px-6 py-3 text-center">Comments</th>
                <th className="px-6 py-3 text-center">Views</th>
              </tr>
            </thead>

            <tbody>
              {leaderboardData.map((u) => (
                <tr
                  key={u.rank}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  <td className="px-6 py-4">{u.rank}</td>

                  {/* NAME + AVATAR */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full themeColor text-white flex items-center justify-center font-semibold">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.org}</div>
                      </div>
                    </div>
                  </td>

                  {/* LIKE */}
                   <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1">
                      <Heart size={16} className="text-red-500" />
                      <span className="text-black">{u.likes}</span>
                    </span>
                  </td>
                  {/* COMMENT */}
                   <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle size={16} className="text-blue-500" />
                      <span className="text-black">{u.comments}</span>
                    </span>
                  </td>
                  {/* VIEW */}
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-black">
                      <Eye size={16} className="text-gray-600" />
                      {u.views}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Leader;

/* ---------- TOP CARD ---------- */

const TopCard = ({
  rank,
  name,
  org,
}: {
  rank: string;
  name: string;
  org: string;
}) => (
  <div className="rounded-xl p-5 text-white bg-gradient-to-r btn-theme flex items-center gap-4">
    {/* WHITE RING AVATAR */}
    <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center">
      <div className="w-10 h-10 rounded-full themeColor text-white flex items-center justify-center font-bold">
        {name.charAt(0)}
      </div>
    </div>

    <div>
      <div className="text-sm opacity-80">{rank}</div>
      <div className="font-semibold">{name}</div>
      <div className="text-xs opacity-80">{org}</div>
    </div>
  </div>
);
