import React, { useState, useEffect } from "react";
import { Bell, Menu } from "lucide-react";
import NotificationModal from "./Notification/NotificationModal";
import { useAuth } from "./ContextAPI/AuthContext";
import { useLocation } from "react-router-dom";
import axios from "axios";

// Header Component
interface HeaderProps {
  onMobileMenuToggle: () => void;
}

interface NotificationCount {
  UnReadCount: number;
  TotalRowCount?: number;
  UserID?: number;
}

const apiUrl = import.meta.env.VITE_API_URL;

const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationCount, setNotificationCount] =
    useState<NotificationCount | null>(null);
  const [headerNotification, setHeaderNotification] = useState<any[]>([]);
  const { userId } = useAuth();

  const username = localStorage.getItem("username");
  const email = localStorage.getItem("email");
  const location = useLocation();

  // ----------------------------
  // FETCH NOTIFICATIONS
  // ----------------------------
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token found");

      const res = await axios.get(
        `${apiUrl}/api/notificationcount/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotificationCount(res.data[0]);

      // Notification List API
      const notificationList = await axios.get(
        `${apiUrl}/api/notificationlog/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setHeaderNotification(notificationList.data);
      console.log("All Notifications:", notificationList.data);
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
    }
  };
//  useEffect(() => {
//    fetchNotifications();
//   }, []);
  // Run only when userId is available (NO infinite loop)
  useEffect(() => {
    if (userId) 
    {
      fetchNotifications();
    }
  }, [userId]);

const headerTitleMap: Record<string, string> = {
  "my-nominations": "My Nomination Details",
  "other-nominations": "Other Nomination Details",
  "referral-approval": "Referral Approval Details",
  "approvals": "Manager Approval Details",
  "business-jury": "Business Jury Review",
  "president-level": "President Jury Review",
  "president-unit": "President Unit Review",
};
  // ----------------------------
  // HEADER TITLE HANDLER
  // ----------------------------
  const getHeaderTitle = () => {
  const from = location.state?.from;

    if (from && headerTitleMap[from]) {
      return headerTitleMap[from];
    }

    switch (location.pathname) {
      case "/home":
        return "Dashboard";
      case "/notifications":
        return "Notifications";
      case "/self-nominations":
        return "Self Nominate Form";
      case "/self-nominations/:nominationId":
        return "Self Nominate Form";  
      case "/my-nominations":
        return "My Nominations";
      case "/referral-approval":
      case "/referral-detail":
        return "Referral Approval";
     case "/nomination-detail":
        return "Nomination Details";
     case "/approve-detail":
        return "Manager Approval";
     case "/approvals":
        return "Manager Approval";
      case "/other-nomination":
        return "Other Nomination"; 
      case "/business-jury":
        return "Business Jury";
      case "/president-unit":
        return "President Unit";
      case "/president-level":
        return "President Level";
      case "/award-management":
        return "Award Management";
      case "/admin-setting":
        return "Admin Settings";
      case "/my-nominations/add-nomination":
        return "Others Nominate Form";
      case "/my-nominations/:nominationId":
        return "Others Nominate Form";  
      default:
        return "Nomination Management";
    }
  };

  return (
    <div className="bg-white shadow-lg z-1 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
      {/* Mobile Menu Button */}
      <div className="flex items-center">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden mr-4 p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          {getHeaderTitle()}
        </h1>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-5">
        {/* Notification Icon */}
        <div
          className="relative cursor-pointer"
          onClick={() => setIsNotificationOpen(true)}
        >
         
            <Bell size={20} className="text-gray-600" />
            {notificationCount?.UnReadCount && notificationCount.UnReadCount > 0 && (
              <span className="absolute -top-2 -right-3 w-6 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notificationCount.UnReadCount > 99 ? "99+" : notificationCount.UnReadCount}
              </span>
            )}

        </div>

        {/* Profile Section */}
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 px-2 sm:px-3 py-2 rounded-lg transition-colors">
          <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {username ? username.trim().charAt(0).toUpperCase() : "?"}
          </div>
          <div className="text-sm hidden sm:block">
            <div className="font-semibold text-gray-800">{username}</div>
            <div className="text-gray-500 text-xs">{email}</div>
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={headerNotification}
        notificationcount={fetchNotifications} // fix part 
        // notificationcount={fetchNotifications()} 
      />
    </div>
  );
};

export default Header;
