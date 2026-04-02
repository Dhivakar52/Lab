 
import { Building, FileText, MoveRight, User } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
 
 
// type Notification= {
//   TotalRowCount: number;
//   NotificationID: number;
//   ReferenceIdPK: number;
//   FromUser: string;
//   ToUser: string;
//   Title: string;
//   NotificationContent: string;
//   DeviceID: string | null;
//   DeviceToken: string | null;
//   IsSent: boolean;
//   SentAt: string | null;
//   IsRead: boolean | null;
//   ReadAt: string | null;
//   CreatedAt:string;
//   Nomination: Nomination[];
// }
 
// type Nomination= {
//   NominationID: number;
//   Nominee: string;
//   Tenant: string;
//   NominatedBy: string;
//   AwardCategory: string;
//   Descriptions:string;
// }
 
interface NotificationDetailSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  notification: any;
}
 
const NotificationDetailSidePanel: React.FC<NotificationDetailSidePanelProps> = ({ isOpen, onClose, notification }) => {
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
   const linkStyle = {
    textDecoration: 'underline',  // Adds underline
    color: '#3498db',  // Highlighted color
    fontWeight: 'bold', // Optional: bold text
    transition: 'color 0.3s ease',  // Smooth transition effect
  };
// Handling hover effect with mouse enter and leave
  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.target as HTMLAnchorElement;  // Type assertion to HTMLAnchorElement
    target.style.color = '#e74c3c';  // Change color on hover
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.target as HTMLAnchorElement;  // Type assertion to HTMLAnchorElement
    target.style.color = '#3498db';  // Revert color after hover
  };
  const navigate = useNavigate(); // Hook to navigate programmatically

  const closeSidebarAndNavigate = (route: string) => {
    navigate(route); // Navigate to the route
    window.location.reload();  
  };

  return (
    <div className="fixed inset-0 flex justify-end z-1000">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={onClose}
      ></div>
 
      {/* Side Panel */}
      <div className="relative w-150 bg-white h-full shadow-xl p-6 overflow-y-auto rounded-l-2xl">
         <h2 className="text-xl font-semibold mb-4">Notification Details</h2>
 
        <div className="space-y-3">
            <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '8px' }}><FileText/></span>
          <span>{notification.Title}</span>
        </div> 
        <p>Received {formattedDate}</p>

         {notification.Nomination && notification.Nomination.length > 0 ? (
          <>
          <Link 
        to="#"
         style={linkStyle}
        onMouseEnter={handleMouseEnter}  // Add onMouseEnter event
        onMouseLeave={handleMouseLeave}  // Add onMouseLeave event
        onClick={() => closeSidebarAndNavigate(`/nomination-detail/${notification.Nomination[0].NominationID}`)}
        >
        View Nomination Details
        </Link>
        <br/><br/>
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
         <br/>
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
          className="absolute top-5  right-3 px-6 py-1  text-sm font-medium text-white-800 border hover:text-white-700 rounded-md transition-colors"
          style={{ display: 'flex', alignItems: 'center' }}
        >
           <span >Back </span><MoveRight size={13}/>

        </button>
      </div>
    </div>
  );
};
 
export default NotificationDetailSidePanel;
 
 