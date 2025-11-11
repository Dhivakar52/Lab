import React, { useEffect, useState } from "react";
import { useAuth } from "../ContextAPI/AuthContext";
import axios from "axios";
import homelogo from "../../assets/images/home_bg.png";
import TabsSection from "./TabsSection";
import PostCard from "./PostCard";
import ProfileCard from "./ProfileCard";
import NominationStats from "./NominationStats";
import TopPerformers from "./TopPerformers";
import ListCard from "./ListCard";
import type { Feed } from "../../dataTypes/nomination";



const HomeComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"Feeds" | "My Lists">("Feeds");
  const [posts, setPosts] = useState<Feed[]>([]);
    const [list, setList] = useState<Feed[]>([]);
  const [profile,setProfile]=useState([]);
  const { authToken , userId} = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/nominationfeeds`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

         const filtered = res.data.filter((feed: any) => feed.UserID === userId);

        setPosts(res.data);
        setProfile(filtered);
        console.log("✅ Feeds:", res.data);


// List Card
 const listCard = await axios.get(`${apiUrl}/api/nomiantionmylist`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        setList(listCard.data)
        console.log("List Card", listCard.data);









      } catch (err) {
        console.error("❌ Error fetching feeds:", err);
      }
    };

    fetchFeeds();
  }, [authToken, apiUrl]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        style={{
          backgroundImage: `url(${homelogo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "200px",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-10">
            {/* Main Content */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-lg shadow-sm">
                <TabsSection activeTab={activeTab} setActiveTab={setActiveTab} />
                <div className="divide-y divide-gray-100">
                  {activeTab === "Feeds" ? (
                    <PostCard posts={posts} setPosts={setPosts} />
                  ) : (
                    <ListCard list={list}  />
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6 mt-6 lg:mt-0">
              <ProfileCard profile={profile} />
              <NominationStats />
              <TopPerformers />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeComponent;
