 
import { Building, FileText, MoveRight, User } from "lucide-react";
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
};
 
type Nomination= {
  NominationID: number;
  Nominee: string;
  Tenant: string;
  NominatedBy: string;
  AwardCategory: string;
  Descriptions:string;
};
 
interface NotificationDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notification: any;
}
 
const NotificationDetailPanel: React.FC<NotificationDetailPanelProps> = ({ isOpen, onClose, notification }) => {
  if (!isOpen || !notification) return null;
 
  const dateString = notification.CreatedAt;
  const date = new Date(dateString);

  const formattedDate = date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, 
  });

  return (
    <div className="fixed inset-0 flex justify-start z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={onClose}
      ></div>
 
      {/* Side Panel */}
      <div className={`relative w-150 bg-white h-full shadow-xl p-6 overflow-y-auto rounded-l-2xl transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300`}>
        <h2 className="text-xl font-semibold mb-4">Notification Details</h2>
 
        <div className="space-y-3">
            <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '8px' }}><FileText/></span>
          <span>{notification.Title}</span>
        </div> 
        <p>Received {formattedDate}</p>

<br></br>
        <p><strong>REQUESTER INFORMATION</strong> </p>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '8px' }}><User/></span>
          <span>{notification.Nomination[0].Nominee}</span>
        </div>
         <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '8px' }}><Building/></span>
          <span>{notification.Nomination[0].Tenant}</span>
        </div>
        <br></br>
        <p><strong>REQUEST DETAILS</strong> </p>
         <p><strong>Category:</strong> {notification.Nomination[0].AwardCategory}</p>
          <p><strong>Message:</strong> {notification.NotificationContent}</p>
 
        </div>
 
        <button
          onClick={onClose}
          className="absolute top-5  right-3 px-6 py-1  text-sm font-medium text-white-800 border hover:text-white-700 rounded-md transition-colors"
          style={{ display: 'flex', alignItems: 'center' }}
        >
           <span >Back </span><MoveRight size={13}/>

        </button>
        
      </div>
    </div>
  );
};
 
export default NotificationDetailPanel;
 
 