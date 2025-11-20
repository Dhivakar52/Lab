import React, { useEffect, useState, useReducer, useMemo } from "react";
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

import {
  filterReducer,
  initialFilterState,
} from "../../dataTypes/feedfilter";
import FilterFeed from "./FilterFeed";

const HomeComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"Feeds" | "My Lists">("Feeds");
  const [posts, setPosts] = useState<Feed[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
const [tenants, setTenants] = useState<string[]>([]);

  const [list, setList] = useState<Feed[]>([]);
  const [profile, setProfile] = useState([]);
  const { authToken, userId } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
const loadMoreRef = React.useRef<HTMLDivElement | null>(null);
  const [state, dispatch] = useReducer(filterReducer, initialFilterState);
  const apiUrl = import.meta.env.VITE_API_URL;

  // ⭐ ADD FILTER REDUCER HERE









  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/nominationfeeds`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

 const cat = [...new Set(res.data.map((x: any) => x.AwardCategory))] as string[];
setCategories(cat);

const ten = [...new Set(res.data.map((x: any) => x.Tenant))] as string[];
setTenants(ten);



        const filtered = res.data.filter((feed: any) => feed.UserID === userId);
        console.log("Feed", res.data)

        setPosts(res.data);
        setProfile(filtered);

        // List Card
        const listCard = await axios.get(`${apiUrl}/api/nomiantionmylist`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        setList(listCard.data);

      } catch (err) {
        console.error("❌ Error fetching feeds:", err);
      }
    };

    fetchFeeds();
  }, [authToken, apiUrl]);

const filteredPosts = useMemo(() => {
  let data = [...posts];

  // Search
  if (state.search) {
    data = data.filter((p) =>
      p.Nominee.toLowerCase().includes(state.search.toLowerCase())
    );
  }

  // Category
  if (state.category) {
    data = data.filter((p) => p.AwardCategory === state.category);
  }

  // Tenant
  if (state.tenant) {
    data = data.filter((p) => p.Tenant === state.tenant);
  }

  // Sort by selected option
  switch (state.sortBy) {
    case "likes":
      data.sort((a, b) => b.Likes - a.Likes);
      break;

    case "comments":
      data.sort((a, b) => b.Comments - a.Comments);
      break;

    case "views":
      data.sort((a, b) => b.Views - a.Views);
      break;

    case "nominated":
      data.sort((a, b) => b.NominatedCount - a.NominatedCount);
      break;

    case "name":
      data.sort((a, b) => a.Nominee.localeCompare(b.Nominee));
      break;

    case "category":
      data.sort((a, b) => a.AwardCategory.localeCompare(b.AwardCategory));
      break;

    default:
      break;
  }

  return data;
}, [state, posts]);

  

useEffect(() => {
  if (!loadMoreRef.current) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => prev + 5); 
      }
    },
    { threshold: 0.5 }
  );

  observer.observe(loadMoreRef.current);

  return () => observer.disconnect();
}, [filteredPosts]);


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
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-10">
            
            {/* Main Content */}
            <div className="xl:col-span-9 lg:col-span-8">
              <div className="bg-white rounded-lg shadow-sm relative">

                <TabsSection activeTab={activeTab} setActiveTab={setActiveTab} 
                onFilterClick={() => setShowDropdown((prev) => !prev)}  />
{showDropdown && (
  <div className="absolute top-[42px] right-4 mt-2 z-50 w-72">
    <FilterFeed
      search={state.search}
      category={state.category}
      tenant={state.tenant}
      sortBy={state.sortBy}
      categories={categories}
      tenants={tenants}
      dispatch={dispatch}
    />
  </div>
)}


<div className="divide-y divide-gray-100 pb-3 overflow-visible">
  {activeTab === "Feeds" ? (
    <>

      <PostCard
        posts={filteredPosts.slice(0, visibleCount)}
        setPosts={setPosts}
      />

      {visibleCount < filteredPosts.length ? (
        <div
          ref={loadMoreRef}
          className="h-16 flex items-center justify-center"
        >
          <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full" />
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="py-6 text-center text-gray-400 text-sm">
           No more Details
        </div>
      ) : null}
    </>
  ) : (
    <ListCard list={list} />
  )}
</div>


              </div>
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-3 lg:col-span-4 space-y-6 mt-6 lg:mt-0 ">
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
