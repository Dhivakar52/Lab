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
   // ⭐ user profile detail (FIX)
  const [userDetail, setUserDetail] = useState<any>(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  // ⭐ ADD FILTER REDUCER HERE
  const [state, dispatch] = useReducer(filterReducer, initialFilterState);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/nominationfeeds`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
         //user profile card detail 
         const fetchUserDetail = await axios.get(
            `${apiUrl}/api/users?userId=${userId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

         setUserDetail(fetchUserDetail.data);
         console.log("profileDetails", fetchUserDetail.data)

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
        console.log("List ", listCard.data)

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

  
const filteredList = useMemo(() => {
  let data = [...list];

  if (state.search) {
    data = data.filter((p) =>
      p.Nominee.toLowerCase().includes(state.search.toLowerCase())
    );
  }

  if (state.category) {
    data = data.filter((p) => p.AwardCategory === state.category);
  }

  if (state.tenant) {
    data = data.filter((p) => p.Tenant === state.tenant);
  }

  return data;
}, [state, list]);

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


                <div className="divide-y divide-gray-100">
                  {/* {activeTab === "Feeds" ? (
                    <PostCard posts={filteredPosts} setPosts={setPosts} />
                  ) : (
                    <ListCard list={list} />
                  )}
                   */}
                    {/* TAB CONTENT FIXED */}
                

                  {activeTab === "Feeds" && (
                    <PostCard posts={filteredPosts} setPosts={setPosts} />
                  )}

                  {activeTab === "My Lists" && (
                    <ListCard list={filteredList} />
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6 mt-6 lg:mt-0 ">
              {/* <ProfileCard profile={profile} /> */}
              <ProfileCard profile={profile} userDetail={userDetail} />
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
