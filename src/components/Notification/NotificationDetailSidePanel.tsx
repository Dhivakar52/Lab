 
import { Building, FileText, User } from "lucide-react";
import React from "react";
 
 
type Notification= {
  TotalRowCount: number;
  NotificationID: number;
  ReferenceIdPK: number;
  FromUser: string;
  ToUser: string;
  Title: string;
  NotificationContent: string;
  DeviceID: string | null;
  DeviceToken: string | null;
  IsSent: boolean;
  SentAt: string | null;
  IsRead: boolean | null;
  ReadAt: string | null;
  CreatedAt:string;
  Nomination: Nomination[];
}
 
type Nomination= {
  NominationID: number;
  Nominee: string;
  Tenant: string;
  NominatedBy: string;
  AwardCategory: string;
  Descriptions:string;
}
 
interface NotificationDetailSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  notification: any;
}
 
const NotificationDetailSidePanel: React.FC<NotificationDetailSidePanelProps> = ({ isOpen, onClose, notification }) => {
  if (!isOpen || !notification) return null;
 
  const dateString = notification.CreatedAt;
  console.log(dateString);
  const date = new Date(dateString);

  const formattedDate = date.toLocaleString('en-US', {
    //weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, 
  });

  return (
    <div className="fixed inset-0 flex justify-end z-1000">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={onClose}
      ></div>
 
      {/* Side Panel */}
      <div className="relative w-96 bg-white h-full shadow-xl p-6 overflow-y-auto rounded-l-2xl">
        <h2 className="text-xl font-semibold mb-4">Notification Details</h2>
 
        <div className="space-y-3">
            <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '8px' }}><FileText/></span>
          <span>{notification.Title}</span>
        </div> 
        <p>Received {formattedDate}</p>

       <br></br>
                {notification.Nomination && notification.Nomination.length > 0 ? (
                 <>
                  <p><strong>REQUESTER INFORMATION</strong> </p>
                   <div style={{ display: 'flex', alignItems: 'center' }}>

                  <span style={{ marginRight: '8px' }}>
                     <User />
                   </span>
                   <span>
                     {notification.Nomination[0].Nominee}
                   </span>
                   </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                   <span style={{ marginRight: '8px' }}>
                     <Building />
                   </span>
                   <span>
                     {notification.Nomination[0].Tenant}
                   </span>
                   </div>
                   <br></br>
                 </>
               ) : (
                 ''
               )}


               <p><strong>REQUEST DETAILS</strong> </p>
               {notification.Nomination && notification.Nomination.length > 0 ? (
                 <>
                   <p><strong>Category:</strong>
                {notification.Nomination && notification.Nomination.length > 0
                 ? notification.Nomination[0].AwardCategory
                 : ''}
               </p>
                 </>
               ) : (
                 ''
               )}
          <p><strong>Message:</strong> {notification.NotificationContent}</p>
 
        </div>
 
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
 
export default NotificationDetailSidePanel;
 
 