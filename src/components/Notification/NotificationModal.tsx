import React,{useState} from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Bell, X, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../ContextAPI/AuthContext";
import axios from "axios";
import NotificationDetailPanel from './NotificationDetailPanel';

interface Notification {
  id: string;
  type: 'referral' | 'approval' | 'approved';
  title: string;
  message: string;
  time: string;
  IsRead?: boolean;
  NotificationID: number;
  Title: string;
  NotificationContent: string;
  Time: string;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  notificationcount:any;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications = [],
  notificationcount,
}) => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
      const [selectedNominee, setSelectedNominee] = useState<Notification | null>(null);
        const [data, setData] = useState<Notification[]>([]);
      
    
    const { authToken, userId } = useAuth();
    const apiUrl = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

  const handleView = () => {
     onClose();   
    navigate("/notifications");
  };
   const handleSidePanelView = (notification: Notification) => {
    setSelectedNominee(notification);
    setIsPanelOpen(true);
  };

  const handleSingleRead = async (notificationID: number) => {
      try {
        await axios.put(
          `${apiUrl}/api/notificationread/notification`,
          {
           LogID: notificationID,
           SubmittedBy: userId,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
         await notificationcount(); 
        // Update UI instantly
        setData((prev) =>
          prev.map((item) =>
            item.NotificationID === notificationID ? { ...item} : item
          )
          
        );
      
      } catch (error) {
        console.error("Notification Read", error);
      }
    }

 

  const handleMarkAllRead = async () => {
  const headers = {
    Accept: "text/plain",
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };

  const requests = notifications.map((post) => {
    return axios.put(
      `${apiUrl}/api/notificationread/notification`,
      {
        LogID: post.NotificationID,
        SubmittedBy: userId,
      },
      { headers }
    );
  });

  try {
    await Promise.all(requests);
    console.log("✅ All notifications marked as read successfully.");
    await notificationcount();
    onClose();
  } catch (err) {
    console.error("❌ Error while Marking as Read:", err);
  }
};


  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />

        <Dialog.Content className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl border-l border-gray-200 overflow-y-auto z-50">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-gray-600" />
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Notifications
              </Dialog.Title>
            </div>

            <Dialog.Close className="p-1 rounded-md hover:bg-gray-100 transition-colors">
              <X size={20} className="text-gray-500" />
            </Dialog.Close>
          </div>

          <div className="flex flex-col pb-16">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.NotificationID}
                  className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                        handleSidePanelView(n);
                        handleSingleRead(n.NotificationID);
                      }}
                >
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4
                          className={`text-sm mb-1 ${
                            !n.IsRead
                              ? 'font-bold text-gray-900'
                              : 'font-medium text-gray-500'
                          }`}
                        >
                          {n.Title}
                        </h4>

                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {n.Time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-10">
                No notifications found
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 fixed bottom-0 w-full max-w-md">
            <div className="flex justify-between space-x-3">
         
          {notifications.length > 0 ? (
              <button
                onClick={handleMarkAllRead}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors"
              >
                Mark All Read
              </button>
 
           ): (
              <div className="text-center text-gray-500 py-2">
                All Notifications are Marked Read
              </div>
            )}
           
              <button
                onClick={handleView}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors"
              >
                View All
              </button>
            </div>
          </div>
 <NotificationDetailPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        notification={selectedNominee}
      />
        </Dialog.Content>
      </Dialog.Portal>
      
    </Dialog.Root>
  );
};

export default NotificationModal;
