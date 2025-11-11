import React , {useState ,useEffect} from 'react';
import { 
  Bell , 
  Menu, 
} from 'lucide-react';
import NotificationModal from './Notification/NotificationModal';
import { useAuth } from './ContextAPI/AuthContext';
import axios from 'axios';

// Header Component
interface HeaderProps {
  onMobileMenuToggle: () => void;
}

interface Notification {
  onMobileMenuToggle: () => void;
}


const apiUrl = import.meta.env.VITE_API_URL;
const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {

 const [isNotificationOpen, setIsNotificationOpen] = useState(false);
 const [notificationCount, setNotificationCount]= useState<any[]>([]);
const {username, email, userId}= useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token found");

        const res = await axios.get(`${apiUrl}/api/notificationcount/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setNotificationCount(res.data[0]);
        console.log("Notification", res.data)
      } catch (err) {
        console.error("❌ Error fetching notifications:", err);
      } finally {
       
      }
    };

    fetchNotifications();
  }, []);






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
          Nomination Management
        </h1>
      </div>
      
      <div className="flex items-center space-x-3 sm:space-x-5">
        <div className="relative cursor-pointer"  onClick={() => setIsNotificationOpen(true)}>
          <Bell size={20} className="text-gray-600" />
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {notificationCount.UnReadCount}
          </span>
        </div>
        
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 px-2 sm:px-3 py-2 rounded-lg transition-colors">
          <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
  {username
    ? username.trim().charAt(0).toUpperCase()
    : "?"}
</div>
          <div className="text-sm hidden sm:block">
            <div className="font-semibold text-gray-800">{username}</div>
            <div className="text-gray-500 text-xs">{email}</div>
          </div>
        </div>
      </div>
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
};

export default Header;
