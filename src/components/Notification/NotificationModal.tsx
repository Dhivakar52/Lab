import React, { useState, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Bell, X, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../ContextAPI/AuthContext";
import axios from "axios";
import NotificationDetailPanel from './NotificationDetailPanel';

interface Notification {
  NotificationID: number;
  ReferenceIdPK?: number;
  NominationID?: number;
  Type?: string;
  Title: string;
  NotificationContent: string;
  Time?: string;
  IsRead?: boolean;
  FromUser?: string;
  ToUser?: string;
  CreatedAt?: string;
  Nomination?: {
    NominationID: number;
    Nominee: string;
    AwardCategory: string;
  } | null;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  notificationcount: any;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications = [],
  notificationcount,
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedNominee, setSelectedNominee] = useState<Notification | null>(null);
  
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const { authToken, userId } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const clickProcessed = useRef(false);

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
      console.log("Marking notification as read:", notificationID);
      
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
    } catch (error) {
      console.error("Notification Read error:", error);
    }
  };

  const handleMarkAllRead = async () => {
    const headers = {
      Accept: "text/plain",
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    try {
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

      await Promise.all(requests);
      await notificationcount();
      onClose();
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (clickProcessed.current) {
      console.log("Already processing, ignoring...");
      return;
    }
    clickProcessed.current = true;
    
    console.log("🔔 Clicked notification:", notification);
    console.log("Type:", notification.Type);
    console.log("ReferenceIdPK:", notification.ReferenceIdPK);
    console.log("NominationID:", notification.NominationID);
    
    await handleSingleRead(notification.NotificationID);
    
    const isSeekingRequest = notification.Type === "Seeking Request";
    
    if (isSeekingRequest) {
      // Use NominationID first, fallback to ReferenceIdPK
      const postId = notification.NominationID || notification.ReferenceIdPK;
      
      if (postId) {
        console.log("✅ SEEKING REQUEST - Navigating to post ID:", postId);
        sessionStorage.setItem('scrollToPost', postId.toString());
        sessionStorage.setItem('scrollToPostSource', 'notification');
        onClose();
        navigate(`/home?postId=${postId}&scrollTo=post`);
      } else {
        console.log("No post ID found - showing side panel");
        handleSidePanelView(notification);
      }
    } 
    else {
      console.log("REGULAR NOTIFICATION - Showing side panel");
      handleSidePanelView(notification);
    }
    
    setTimeout(() => {
      clickProcessed.current = false;
    }, 1000);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />

        <Dialog.Content className="fixed top-0 right-0 h-full  w-[30%] bg-white shadow-2xl border-l border-gray-200 overflow-y-auto z-50">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex items-center space-x-4">
              <Bell className="w-5 h-5 text-gray-600" />
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Notifications 
              </Dialog.Title>
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <Dialog.Close ref={closeBtnRef} className="p-1 rounded-md hover:bg-gray-100">
              <X size={20} className="text-gray-500" />
            </Dialog.Close>
          </div>

          <div className="flex flex-col pb-16">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.NotificationID}
                  className={`px-6 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !n.IsRead ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        n.Type === "Seeking Request" ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        <FileText className={`w-4 h-4 ${
                          n.Type === "Seeking Request" ? 'text-green-600' : 'text-blue-600'
                        }`} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`text-sm mb-1 ${!n.IsRead ? 'font-bold text-gray-900' : 'font-medium text-gray-500'}`}>
                          {n.Title}
                        </h4>
                        <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                          {n.Time || n.CreatedAt}
                        </span>
                      </div>
                      {/* <p className="text-xs text-gray-600 mt-1">{n.NotificationContent}</p> */}
                      {n.FromUser && (
                        <p className="text-xs text-gray-400 mt-1">From: {n.FromUser}</p>
                      )}
                      {n.Type === "Seeking Request" && (
                        <p className="text-xs text-green-600 mt-1 font-medium">
                          📍 Click to view post
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-10">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                No notifications
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 fixed bottom-0 w-full">
            <div className="text-center">
              <button onClick={handleView} className="text-sm font-medium text-blue-600 hover:underline">
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