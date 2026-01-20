import React, { useEffect, useState, useReducer, useMemo, useRef, useCallback } from "react";
import { useAuth } from "../ContextAPI/AuthContext";
import axios from "axios";
import homelogo from "../../assets/images/home_bg.png";
import TabsSection from "./TabsSection";
import PostCard from "./PostCard";
import ProfileCard from "./ProfileCard";
import NominationStats from "./NominationStats";
import TopPerformers from "./TopPerformers";
import ListCard from "./ListCard";
import BusinessCard from "./BusinessCard";
import type { Feed } from "../../dataTypes/nomination";

import {
  filterReducer,
  initialFilterState,
} from "../../dataTypes/feedfilter";
import FilterFeed from "./FilterFeed";

const HomeComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"Feeds" | "My Lists"|"My Business">("Feeds");
  const [posts, setPosts] = useState<Feed[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tenants, setTenants] = useState<string[]>([]);

  const [list, setList] = useState<Feed[]>([]);
  const [business, setBusiness] = useState<Feed[]>([]);
  const [profile, setProfile] = useState([]);
  
  const { authToken, userId ,tenantname } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [userDetail, setUserDetail] = useState<any>(null);
  const apiUrl = import.meta.env.VITE_API_URL;


  const [feedsState, feedsDispatch] = useReducer(filterReducer, initialFilterState);
  const [listsState, listsDispatch] = useReducer(filterReducer, initialFilterState);
  const [businessState, businessDispatch] = useReducer(
  filterReducer,
  initialFilterState
);

 
  const filterRef = useRef<HTMLDivElement>(null);

  // ✅ TAB CHANGE → FILTER RESET
  useEffect(() => {
    setShowDropdown(false);

    if (activeTab === "Feeds") feedsDispatch({ type: "RESET" });
    if (activeTab === "My Lists") listsDispatch({ type: "RESET" });
    if (activeTab === "My Business") businessDispatch({ type: "RESET" });
  }, [activeTab]);

  
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
      setShowDropdown(false);
    }
  }, []);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/nominationfeeds`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
        
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
        console.log("profileDetails", fetchUserDetail.data);

       
       const businesstenant = await axios.get(
          `${apiUrl}/api/nominationfeeds?searchText=${tenantname}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        setBusiness(businesstenant.data);

        

        const cat = [...new Set(res.data.map((x: any) => x.AwardCategory))] as string[];
        setCategories(cat);

        const ten = [...new Set(res.data.map((x: any) => x.Tenant))] as string[];
        setTenants(ten);

        const filtered = res.data.filter((feed: any) => feed.UserID === userId);
        console.log("Feed", res.data);

        setPosts(res.data);
        setProfile(filtered);
        
        const listCard = await axios.get(`${apiUrl}/api/nomiantionmylist`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        setList(listCard.data);
        console.log("List ", listCard.data);

      } catch (err) {
        console.error("❌ Error fetching feeds:", err);
      }
    };

    fetchFeeds();
  }, [authToken, apiUrl, userId,tenantname]);

  const filteredPosts = useMemo(() => {
    let data = [...posts];

    if (feedsState.search) {
      data = data.filter((p) =>
        p.Nominee.toLowerCase().includes(feedsState.search.toLowerCase())
      );
    }
    if (feedsState.category) {
      data = data.filter((p) => p.AwardCategory === feedsState.category);
    }
    if (feedsState.tenant) {
      data = data.filter((p) => p.Tenant === feedsState.tenant);
    }

    switch (feedsState.sortBy) {
      case "likes": data.sort((a, b) => b.Likes - a.Likes); break;
      case "comments": data.sort((a, b) => b.Comments - a.Comments); break;
      case "views": data.sort((a, b) => b.Views - a.Views); break;
      case "nominated": data.sort((a, b) => b.NominatedCount - a.NominatedCount); break;
      case "name": data.sort((a, b) => a.Nominee.localeCompare(b.Nominee)); break;
      case "category": data.sort((a, b) => a.AwardCategory.localeCompare(b.AwardCategory)); break;
      default: break;
    }
    return data;
  }, [feedsState, posts]);

  // ⭐ LISTS FILTER WITH EMPTY CHECK
  const filteredList = useMemo(() => {
    let data = [...list];

    if (listsState.search) {
      data = data.filter((p) =>
        p.Nominee.toLowerCase().includes(listsState.search.toLowerCase())
      );
    }
    if (listsState.category) {
      data = data.filter((p) => p.AwardCategory === listsState.category);
    }
    if (listsState.tenant) {
      data = data.filter((p) => p.Tenant === listsState.tenant);
    }

    switch (listsState.sortBy) {
      case "likes": data.sort((a, b) => b.Likes - a.Likes); break;
      case "comments": data.sort((a, b) => b.Comments - a.Comments); break;
      case "views": data.sort((a, b) => b.Views - a.Views); break;
      case "nominated": data.sort((a, b) => b.NominatedCount - a.NominatedCount); break;
      case "name": data.sort((a, b) => a.Nominee.localeCompare(b.Nominee)); break;
      case "category": data.sort((a, b) => a.AwardCategory.localeCompare(b.AwardCategory)); break;
      default: break;
    }
    return data;
  }, [listsState, list]);

  const filteredBusiness = useMemo(() => {
  let data = [...business];

  if (businessState.search) {
    data = data.filter((p) =>
      p.Nominee.toLowerCase().includes(businessState.search.toLowerCase())
    );
  }

  if (businessState.category) {
    data = data.filter((p) => p.AwardCategory === businessState.category);
  }

  if (businessState.tenant) {
    data = data.filter((p) => p.Tenant === businessState.tenant);
  }

  switch (businessState.sortBy) {
    case "likes": data.sort((a, b) => b.Likes - a.Likes); break;
    case "comments": data.sort((a, b) => b.Comments - a.Comments); break;
    case "views": data.sort((a, b) => b.Views - a.Views); break;
    case "nominated": data.sort((a, b) => b.NominatedCount - a.NominatedCount); break;
    case "name": data.sort((a, b) => a.Nominee.localeCompare(b.Nominee)); break;
    case "category": data.sort((a, b) => a.AwardCategory.localeCompare(b.AwardCategory)); break;
  }

  return data;
}, [businessState, business]);


  // OUTSIDE CLICK EFFECT
  useEffect(() => {
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown, handleClickOutside]);

  const getFilterProps = () => {
    if (activeTab === "Feeds")
      return { ...feedsState, dispatch: feedsDispatch };
    if (activeTab === "My Lists")
      return { ...listsState, dispatch: listsDispatch };
    return { ...businessState, dispatch: businessDispatch };

    //  if (activeTab === "My Business")
    //   return { ...businessState, dispatch: businessDispatch };
  };

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
        {/* <div className="px-4 sm:px-6 lg:px-8 -mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-10"> */}
               <div className="px-4 sm:px-6 lg:px-8 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-10 h-full">
            
            {/* Main Content */}
          <div className="lg:col-span-8 h-full  pr-2">

            {/* <div className="lg:col-span-8"> */}
              <div className="bg-white rounded-lg shadow-sm relative">
                
                <TabsSection 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                  onFilterClick={() => setShowDropdown((prev) => !prev)} 
                />

                {/* {showDropdown && (
                  <div ref={filterRef} className="absolute top-[42px] right-4 mt-2 z-50 w-72">
                    <FilterFeed
                      {...(activeTab === "Feeds" 
                        ? {
                            search: feedsState.search,
                            category: feedsState.category,
                            tenant: feedsState.tenant,
                            sortBy: feedsState.sortBy,
                            dispatch: feedsDispatch
                          }
                        : {
                            search: listsState.search,
                            category: listsState.category,
                            tenant: listsState.tenant,
                            sortBy: listsState.sortBy,
                            dispatch: listsDispatch
                          }
                      )}
                      categories={categories}
                      tenants={tenants}
                    />
                  </div>
                )} */}

               {showDropdown && (
                <div
                  ref={filterRef}
                  className="absolute top-[42px] right-4 mt-2 z-50 w-72"
                >
                  <FilterFeed
                    {...getFilterProps()}
                    categories={categories}
                    tenants={tenants}
                  />
                </div>
              )}



                <div className="divide-y divide-gray-100">

                  {/* ⭐ FEEDS TAB WITH NO DATA MESSAGE */}
                  {activeTab === "Feeds" && (
                    filteredPosts.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="text-gray-500 text-lg font-medium mb-2">
                          No matching data found
                        </div>
                        <div className="text-gray-400 text-sm">
                          Try adjusting your filters
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-y-auto h-[550px] min-h-screen">
                      <PostCard posts={filteredPosts} setPosts={setPosts} />
                      </div>
                    )
                  )}

                  {/* ⭐ MY LISTS TAB WITH NO DATA MESSAGE */}
                  {activeTab === "My Lists" && (
                    filteredList.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="text-gray-500 text-lg font-medium mb-2">
                          No matching data found
                        </div>
                        <div className="text-gray-400 text-sm">
                          Try adjusting your filters
                        </div>
                      </div>
                    ) : (
                       <div className="overflow-y-auto h-[550px] min-h-screen">
                      <ListCard list={filteredList} setList={setList}/>
                       </div>
                    )
                  )}

                  
                  {/* {activeTab === "My Business" && (
                    <div className="overflow-y-auto h-[550px] min-h-screen">
                      <BusinessCard />
                    </div>
                  )} */}
                 {activeTab === "My Business" && (
                  <BusinessCard
                    business={filteredBusiness}
                    setBusiness={setBusiness}
                  />
                )}


                                  
                </div>
              </div>
            </div>

            {/* Sidebar */}
             
            <div className="lg:col-span-4 space-y-6 mt-6 lg:mt-0 ">
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
