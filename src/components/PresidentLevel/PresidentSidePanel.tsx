import React, { useEffect, useState } from "react";
import { Trophy,X} from 'lucide-react'; 
import { useAuth } from "../ContextAPI/AuthContext";
import axios from "axios";
import type {PresidentLevelNominee} from "./PresidentLevel"
import StatusFlow from "../StatusFlow";

interface PresidentSidePanelProps {
    nominee: PresidentLevelNominee | null;
    isOpen: boolean;
    onClose: () => void;
}
 

const statusColors: Record<PresidentLevelNominee["Status"], string> = {
  Pending: "bg-orange-100 text-orange-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

const apiUrl = import.meta.env.VITE_API_URL;

const PresidentSidePanel: React.FC<PresidentSidePanelProps> = ({ 
  isOpen,
  onClose,
  nominee,

}) => {

   const [presidentLevelJuryComments, setPresidentLevelJuryComments] = useState('');
      const { authToken, userId } = useAuth();
      const [data, setData] = useState<PresidentLevelNominee[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(true); // Sidebar state
      const [commentError, setCommentError] = useState("");
    
  const baseClasses = "px-2 py-2 text-white rounded-md shadow transition flex items-center";
  const rejectClasses = `${baseClasses} bg-red-600 hover:bg-red-700`;
  const approveClasses = `${baseClasses} bg-green-600 hover:bg-green-700`;
  const containerClasses = "flex justify-around items-center gap-4 mt-4";
     
      useEffect(() => {
         if (nominee?.PresidentComments) {
           setPresidentLevelJuryComments(nominee.PresidentComments);
         } else {
           setPresidentLevelJuryComments("");
         }
       }, [nominee]);

     const validateComments = () => {
       if (!presidentLevelJuryComments.trim()) {
         setCommentError("Comments are required!");
         return false;
       }
       setCommentError("");
       return true;
     };
     

  const onApprove = async (JuryApprovalsID: number) => {
    setLoading(true);
      try {

        await axios.put(
          `${apiUrl}/api/presidentevaluation/${JuryApprovalsID}`,
          {
            JuryApprovalsID:JuryApprovalsID,
            NominationID:nominee?.NominationID,
            IsPresidentApproved: true,
            PresidentComments: presidentLevelJuryComments,
            PresidentScore:nominee?.PresidentScore,
            PresidentID: userId,
            submittedBy: userId,
            active: true,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        // Update UI instantly
        setData((prev) =>
          prev.map((item) =>
            item.JuryApprovalsID === JuryApprovalsID ? { ...item, Status: "Approved" } : item
          )
        );
      // setMessage("Business Jury Approved Successfully!");
      // setMessageType('success');

      } catch (error) {
        console.error("Approve Error:", error);
        alert("Approval failed");
      } finally{
       setLoading(false);
       setSidebarOpen(false);
       window.location.reload();  

      //  setTimeout(() => {
      //   setMessage('');
      // }, 3000);

      }
    };

    const onReject = async (JuryApprovalsID: number) => {
    setLoading(true);
      try {

        await axios.put(
          `${apiUrl}/api/presidentevaluation/${JuryApprovalsID}`,
          {
            JuryApprovalsID:nominee?.JuryApprovalsID,
            NominationID:nominee?.NominationID,
            IsPresidentApproved: false,
            PresidentComments: presidentLevelJuryComments,
            PresidentScore:nominee?.PresidentScore,
            PresidentID: userId,
            submittedBy: userId,
            active: true,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        // Update UI instantly
        setData((prev) =>
          prev.map((item) =>
            item.JuryApprovalsID === JuryApprovalsID ? { ...item, Status: "Rejected" } : item
          )
        );

      // setMessage("Business Jury Rejected Successfully!");
      // setMessageType('reject');
      } catch (error) {
        console.error("Reject Error:", error);
        alert("Reject failed");
      } finally{
       setLoading(false);
       setSidebarOpen(false);
       window.location.reload();  

      //  setTimeout(() => {
      //   setMessage('');
      // }, 3000);
      }
    };


  const ActionButtons = () => {
    if (!nominee) return null; // Safety check

    // Helper functions for specific buttons (using props from BusinessPanel scope)
    const RejectButton = () => (
      <button
        onClick={() => {
          onReject(nominee.JuryApprovalsID);
          onClose();
        }}
        className={rejectClasses}
      >
        ✖ Reject Nomination
      </button>
    );

    const ApproveButton = () => (
      <button
        onClick={() => {
          onApprove(nominee.JuryApprovalsID);
          onClose();
        }}
        className={approveClasses}
      >
        ✔ Approve Nomination
      </button>
    );
    
    // Switch logic for rendering the correct combination
    switch (nominee.Status) {
      case 'Pending':
        return (
          <div className={containerClasses}>
            <RejectButton />
            <ApproveButton />
          </div>
        );
      case 'Approved':
        // If approved, only the reject button should show up
        return (
          <div className={containerClasses}>
            <RejectButton />
          </div>
        );
      case 'Rejected':
        // If rejected, only the approve button should show up
        return (
          <div className={containerClasses}>
            <ApproveButton />
          </div>
        );
      default:
        return null;
    }
  };
   const approvalFlow = nominee?.ApprovalStatus?.map((a : any) => ({
  type: a.ApprovalType,
  status: a.Status
})) ?? [];
   return (
   <div
      className={`fixed top-0 right-0 h-full w-[600px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
       <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">President Evaluation Details</h2>
        <button
                  onClick={onClose}
                  className="p-1 rounded-md hover:bg-gray-100 transition"
                >
                  <X size={20} className="text-gray-500" />
                </button>
      </div>
    
      {/* Content */}
      {/* Side Panel */}
      <div className="p-5 overflow-y-auto h-[calc(100%-64px)]">
    {nominee ? (
          <div className="space-y-5 text-sm">

            {/* Row 1 */}
            <div className="grid grid-cols-3 gap-8">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Nominee</div>
                <div className="text-sm text-gray-600">{nominee.Nominee}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Award Category</div>
                <div className="text-sm text-gray-600">{nominee.CategoryName}</div>

              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Nominated By</div>
                <div className="text-sm text-gray-600">{nominee.NominatedBy}</div>
              </div>
            </div>

              {/* Row 2 */}
            <div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Descriptions</div>
                <div className="text-sm text-gray-600">{nominee.Descriptions}</div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-3 gap-8">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Submitted Date</div>
                <div className="text-sm text-gray-600"></div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Designation</div>
                <div className="text-sm text-gray-600">{nominee.Designation}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Department</div>
                <div className="text-sm text-gray-600">{nominee.Department}</div>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-3 gap-8">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Tenant</div>
                <div className="text-sm text-gray-600">{nominee.Tenant}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Reporting To</div>
                <div className="text-sm text-gray-600">{nominee.ManagerUserName}</div>
              </div>
               <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">President Score</div>
                <div className="text-sm text-gray-600">{nominee.PresidentScore}</div>
              </div>
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Nomination Status</div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[nominee.Status]}`} >
                    {nominee.Status}
                  </span>              
                </div>
             <div className="space-y-1">

                <div className="text-sm font-medium text-gray-900">Final Status</div>
              <div className="text-sm text-gray-600">
                  {nominee.FinalStatus === 'Winner' ? (
                      <span style={{ display: 'flex', alignItems: 'center' }} className="text-sm text-gray-600"><Trophy/> &nbsp; Winner </span>
                  ) : nominee.FinalStatus === 'Runner-Up' ? (
                      <span className="text-sm text-gray-600">Runner-Up</span>
                  ) : (
                      nominee.FinalStatus
                  )}
              </div>
              </div>
             
            </div>

            {/* Row 6 */}
             <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  {/* <div className="text-sm font-medium text-gray-900">Nomination Status Flow</div> */}
                  <StatusFlow steps={approvalFlow} />
                </div>
              </div>


         {nominee?.PresidentComments?.length > 0 ? (
            <div>
                 <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Approver's Comments</div>
                <div className="text-sm text-gray-600">{nominee.PresidentComments}</div>
               </div>
            </div>
       ) : (
       
     <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Reason <span className="text-red-600">*</span>
            </label>

            <textarea
              className={`w-full h-24 border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 ${
                commentError ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400"
              }`}
              placeholder="Enter your reason here..."
              value={presidentLevelJuryComments}
              onChange={(e) => {
                setPresidentLevelJuryComments(e.target.value);
                if (commentError) setCommentError("");
              }}
            ></textarea>

            {commentError && (
              <p className="text-red-600 text-sm">{commentError}</p>
            )}
         </div>
      )}
            <ActionButtons/>
          </div>
        ) : null}
        </div>
    </div>
  );
};

export default PresidentSidePanel;
