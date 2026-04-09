import React, { useEffect, useState, useReducer, useMemo, useRef, useCallback } from "react";
import { useAuth } from "../ContextAPI/AuthContext";
import { useLocation } from "react-router-dom";
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

declare global {
  interface Window {
    scrollTimeout: number | undefined;
  }
}

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
  const deepLinkProcessed = useRef(false);
  const location = useLocation();

  // ========== SCROLL TO POST FUNCTION ==========
  const scrollToPost = useCallback((postId: number) => {
    console.log("📜 scrollToPost called once for postId:", postId);
    
    if (window.scrollTimeout) {
      clearTimeout(window.scrollTimeout);
    }
    
    let retryCount = 0;
    const maxRetries = 25;
    let found = false;
    
    const attemptScroll = () => {
      if (found) return;
      
      const postElement = document.querySelector(`[data-post-id="${postId}"]`);
      
      if (postElement) {
        found = true;
        console.log(`✅ Found post ${postId}, scrolling...`);
        
        postElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        
        postElement.classList.add('highlight-pulse');
        setTimeout(() => {
          postElement.classList.remove('highlight-pulse');
        }, 3000);
        
        // Clear sessionStorage after successful scroll
        sessionStorage.removeItem('scrollToPost');
        sessionStorage.removeItem('scrollToPostSource');
      } else if (retryCount < maxRetries) {
        const delay = Math.min(200 * Math.pow(1.1, retryCount), 3000);
        console.log(`⏳ Post ${postId} not found, retry ${retryCount + 1} in ${delay}ms`);
        retryCount++;
        window.scrollTimeout = setTimeout(attemptScroll, delay);
      } else {
        console.error(`❌ Failed to find post ${postId} after ${maxRetries} attempts`);
        sessionStorage.removeItem('scrollToPost');
        sessionStorage.removeItem('scrollToPostSource');
      }
    };
    
    window.scrollTimeout = setTimeout(attemptScroll, 500);
  }, []);

  // ========== DEEP LINK HANDLER FOR URL PARAMS ==========
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const postId = params.get('postId');
    const scrollTo = params.get('scrollTo');
    
    console.log("🔍 HomeComponent - URL params:", { postId, scrollTo, processed: deepLinkProcessed.current });
    
    if (postId && scrollTo === 'post' && !deepLinkProcessed.current) {
      deepLinkProcessed.current = true;
      const postIdNumber = parseInt(postId, 10);
      if (!isNaN(postIdNumber)) {
        console.log("🎯 Found postId in URL, scrolling to:", postIdNumber);
        
        // Clean URL without reload
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
        
        // Switch to Feeds tab if needed
        if (activeTab !== "Feeds") {
          setActiveTab("Feeds");
          setTimeout(() => scrollToPost(postIdNumber), 800);
        } else {
          scrollToPost(postIdNumber);
        }
      }
    }
  }, [location.search, activeTab, scrollToPost]);

  // ========== SESSION STORAGE CHECK (Backup Method) ==========
  useEffect(() => {
    let checked = false;
    
    const checkSessionStorage = () => {
      if (checked) return;
      
      const postId = sessionStorage.getItem('scrollToPost');
      const source = sessionStorage.getItem('scrollToPostSource');
      
      console.log("📱 Checking sessionStorage:", { postId, source, processed: deepLinkProcessed.current });
      
      if (postId && source === 'notification' && !deepLinkProcessed.current) {
        checked = true;
        deepLinkProcessed.current = true;
        console.log("📱 Processing sessionStorage deep link for post:", postId);
        
        sessionStorage.removeItem('scrollToPost');
        sessionStorage.removeItem('scrollToPostSource');
        
        const postIdNumber = parseInt(postId, 10);
        
        if (activeTab !== "Feeds") {
          setActiveTab("Feeds");
          setTimeout(() => scrollToPost(postIdNumber), 800);
        } else {
          scrollToPost(postIdNumber);
        }
      }
    };
    
    const timer = setTimeout(() => {
      if (posts.length > 0) {
        checkSessionStorage();
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [posts, activeTab, scrollToPost]);

  // ========== CLEAN URL ON MOUNT ==========
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has('postId') || params.has('scrollTo')) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, []);

  // ========== RESET FILTERS ON TAB CHANGE ==========
  useEffect(() => {
    setShowDropdown(false);

    if (activeTab === "Feeds") feedsDispatch({ type: "RESET" });
    if (activeTab === "My Lists") listsDispatch({ type: "RESET" });
    if (activeTab === "My Business") businessDispatch({ type: "RESET" });
  }, [activeTab]);

  // ========== CLICK OUTSIDE HANDLER ==========
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
      setShowDropdown(false);
    }
  }, []);

  // ========== LOADER COMPONENT ==========
  const Loader = () => (
    <div className="flex justify-center items-center h-[300px]">
      <div className="h-10 w-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  // ========== FETCH FEEDS ==========
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

        const listCard = await axios.get(`${apiUrl}/api/nomiantionmylist/0`, {
          params: { userId: userId },
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

  // ========== FETCH BUSINESS ==========
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

  // ========== SORTING FUNCTIONS ==========
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
      default:
        return sorted;
    }
  };

  // ========== FILTERED DATA ==========
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

  // ========== DROPDOWN CLICK OUTSIDE ==========
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

  // ========== GET FILTER PROPS ==========
  const getFilterProps = () => {
    if (activeTab === "Feeds")
      return { ...feedsState, dispatch: feedsDispatch };
    if (activeTab === "My Lists")
      return { ...listsState, dispatch: listsDispatch };
    return { ...businessState, dispatch: businessDispatch };
  };

  // ========== DEBUG BUTTON (Remove in production) ==========
  const addTestNotification = () => {
    const firstPostId = posts[0]?.NominationID;
    if (!firstPostId) {
      alert("No posts loaded yet!");
      return;
    }
    
    const test = {
      NotificationID: Date.now(),
      Title: "DEBUG TEST - Click to see post",
      NotificationContent: `Test seeking notification for post: ${posts[0]?.Nominee}`,
      Type: "Seeking Request",
      ReferenceIdPK: firstPostId,
      DeepLink: `/home?postId=${firstPostId}&scrollTo=post`,
      IsRead: false,
      Time: new Date().toLocaleString()
    };
    const existing = JSON.parse(localStorage.getItem('mock_notifications') || '[]');
    existing.push(test);
    localStorage.setItem('mock_notifications', JSON.stringify(existing));
    alert(`Test notification added for post ID: ${firstPostId}! Check bell icon`);
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

      {/* Debug Button - Remove in production */}
      {/* <button 
        onClick={addTestNotification}
        className="fixed bottom-20 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded shadow-lg hover:bg-red-700 text-sm"
      >
        Add Test Notification
      </button> */}
    </div>
  );
};

export default HomeComponent;