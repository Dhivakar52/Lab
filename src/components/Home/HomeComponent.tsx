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
  const [activeTab, setActiveTab] = useState<"Feeds" | "My Lists" | "My Business">("Feeds");
  const [posts, setPosts] = useState<Feed[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tenants, setTenants] = useState<string[]>([]);

  const [list, setList] = useState<Feed[]>([]);
  const [business, setBusiness] = useState<Feed[]>([]);
  const [profile, setProfile] = useState([]);

  const { authToken, userId, tenantname } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [userDetail, setUserDetail] = useState<any>(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  const [businessLoading, setBusinessLoading] = useState(false);

  const [feedsState, feedsDispatch] = useReducer(filterReducer, initialFilterState);
  const [listsState, listsDispatch] = useReducer(filterReducer, initialFilterState);
  const [businessState, businessDispatch] = useReducer(
    filterReducer,
    initialFilterState
  );

  const filterRef = useRef<HTMLDivElement>(null);

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

  const Loader = () => (
    <div className="flex justify-center items-center h-[300px]">
      <div className="h-10 w-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

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

        const cat = [...new Set(res.data.map((x: any) => x.AwardCategory))] as string[];
        setCategories(cat);

        const ten = [...new Set(res.data.map((x: any) => x.Tenant))] as string[];
        setTenants(ten);

        const filtered = res.data.filter((feed: any) => feed.UserID === userId);

        setPosts(res.data);
        setProfile(filtered);

        const listCard = await axios.get(`${apiUrl}/api/nomiantionmylist/${userId}`, {
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
  }, [authToken, apiUrl, userId, tenantname]);

  useEffect(() => {
    if (activeTab !== "My Business" || business.length > 0) return;

    const fetchBusiness = async () => {
      try {
        setBusinessLoading(true);
        const res = await axios.get(
          `${apiUrl}/api/nominationfeeds?searchText=${tenantname}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        setBusiness(res.data);
      } catch (err) {
        console.error("❌ Business load error:", err);
      } finally {
        setBusinessLoading(false);
      }
    };

    fetchBusiness();
  }, [activeTab, tenantname, authToken, apiUrl, business.length]);


  const sortFeeds = (data: Feed[], sortBy: string) => {
    const sorted = [...data];

    switch (sortBy) {
      case "likes":
        return sorted.sort(
          (a, b) => (b.LikedBy?.length || 0) - (a.LikedBy?.length || 0)
        );
      case "comments":
        return sorted.sort((a, b) => b.Comments - a.Comments);
      case "views":
        return sorted.sort((a, b) => b.Views - a.Views);
      // case "nominated":
      //   return sorted.sort((a, b) => b.NominatedCount - a.NominatedCount);
      // case "name":
      //   return sorted.sort((a, b) => a.Nominee.localeCompare(b.Nominee));
      // case "category":
      //   return sorted.sort((a, b) => a.AwardCategory.localeCompare(b.AwardCategory));
      default:
        return sorted;
    }
  };

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

    return sortFeeds(data, feedsState.sortBy);
  }, [feedsState, posts]);

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

    return sortFeeds(data, listsState.sortBy);
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

    return sortFeeds(data, businessState.sortBy);
  }, [businessState, business]);

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
        <div className="px-4 sm:px-6 lg:px-8 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-10 h-full">
            <div className="lg:col-span-8 h-full pr-2">
              <div className="bg-white rounded-lg shadow-sm relative">
                <TabsSection
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onFilterClick={() => setShowDropdown((prev) => !prev)}
                />

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
                  {activeTab === "Feeds" && (
                    filteredPosts.length === 0 ? (
                      <div className="p-8 text-center">No matching data found</div>
                    ) : (
                      <div className="overflow-y-auto h-[550px] min-h-screen">
                        <PostCard posts={filteredPosts} setPosts={setPosts} />
                      </div>
                    )
                  )}

                  {activeTab === "My Lists" && (
                    filteredList.length === 0 ? (
                      <div className="p-8 text-center">No matching data found</div>
                    ) : (
                      <div className="overflow-y-auto h-[550px] min-h-screen">
                        <ListCard list={filteredList} setList={setList} />
                      </div>
                    )
                  )}

                  {activeTab === "My Business" && (
                    businessLoading ? (
                      <Loader />
                    ) : (
                      <div className="overflow-y-auto h-[550px] min-h-screen">
                        <BusinessCard
                          business={filteredBusiness}
                          setBusiness={setBusiness}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6 mt-6 lg:mt-0">
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