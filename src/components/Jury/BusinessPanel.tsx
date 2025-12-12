import React, { useEffect, useState } from "react";
import { X, FileText } from "lucide-react";
import { useAuth } from "../ContextAPI/AuthContext";
import axios from "axios";
import type { BusinessJury } from "./BusinessJury";
import StatusFlow from "../StatusFlow";

interface NomineeSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  nominee: BusinessJury | null;
}

const statusColors: Record<BusinessJury["Status"], string> = {
  Pending: "bg-orange-100 text-orange-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

const apiUrl = import.meta.env.VITE_API_URL;

const BusinessPanel: React.FC<NomineeSidePanelProps> = ({
  isOpen,
  onClose,
  nominee,
}) => {
  const [businessJuryComments, setBusinessJuryComments] = useState('');
  const { authToken, userId } = useAuth();
  const [data, setData] = useState<BusinessJury[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true); // Sidebar state
  const [commentError, setCommentError] = useState("");
  const [score, setScore] = useState(90);
  const [error, setError] = useState('');


  const handleChange = (e:any) => {
    const value = e.target.value;
    setScore(value);
    
    // Clear the error message as the user types
    if (error) {
      setError('');
    }
  };
  
  const numScore = Number(score);

 
  const baseClasses = "px-2 py-2 text-white rounded-md shadow transition flex items-center";
  const rejectClasses = `${baseClasses} bg-red-600 hover:bg-red-700`;
  const approveClasses = `${baseClasses} bg-green-600 hover:bg-green-700`;
  const containerClasses = "flex justify-around items-center gap-4 mt-4";

  
  
    // ⭐ LOAD COMMENTS
    useEffect(() => {
      if (nominee?.BusinessJuryComments) {
        setBusinessJuryComments(nominee.BusinessJuryComments);
      } else {
        setBusinessJuryComments("");
      }
    }, [nominee]);

  
  
  const onApprove = async (JuryApprovalsID: number) => {
    setLoading(true);
      try {

        await axios.put(
          `${apiUrl}/api/businessjuryevaluation/${JuryApprovalsID}`,
          {
            NominationID:nominee?.NominationID,
            IsBusinessJuryApproved: true,
            BusinessJuryComments: businessJuryComments,
            BusinessJuryScore:numScore,
            BusinessJuryID: userId,
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
          `${apiUrl}/api/businessjuryevaluation/${JuryApprovalsID}`,
          {
            NominationID:nominee?.NominationID,
            IsBusinessJuryApproved: false,
            BusinessJuryComments: businessJuryComments,
            BusinessJuryScore:numScore,
            BusinessJuryID: userId,
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

   const isGeneralJuryApproved = (): boolean => {
     // Use .some() for efficiency. Return true if ANY entry matches the criteria.
     return nominee?.ApprovalStatus?.some(
       (statusEntry) => 
         statusEntry.ApprovalType === 'General Jury' && statusEntry.Status === 'Approved' // Ensure lowercase 'approved' if your backend uses it
     ) ?? false; // Default to false if nominee or ApprovalStatus is null/undefined
   };
   
   
   useEffect(() => {
    if (score === null) {
      setError('Error: Score cannot be empty.');
    } else if (numScore < 1 || numScore > 100) {
      setError('Error: The score must be between 1 and 100.');
    } else {
      setError('');
    }
  }, [numScore, score]);



  return (
    <div
      className={`fixed top-0 right-0 h-full w-[600px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
       <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Business Jury Review</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-100 transition"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
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
                <div className="text-sm text-gray-600">{nominee["Submitted On"]}</div>
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

            {/* Row 4*/}
            <div className="grid grid-cols-3 gap-8">              
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Tenant</div>
                <div className="text-sm text-gray-600">{nominee.Tenant}</div>
              </div>
                <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Reporting to</div>
                <div className="text-sm text-gray-600">{nominee.ManagerUserName}</div>
              </div>
          
    
              {(nominee.Status==="Approved") ? (
             <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Score (Out of 100)</div>
                <div className="text-sm text-gray-600">{nominee.BusinessJuryScore}</div>
             </div>
              ) : (
              <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-900">Score (Out of 100)</div>
                        <input
                          type="number"
                          value={score}
                          onChange={handleChange}
                          min="1"
                          max="100"
                          style={{border: '3px solid black'} }
                          required 
                        />
                        {/* Conditionally render the error message if the error state is set */}
                        {error && (
                          <p style={{ color: 'red', marginTop: '5px' }}>
                            {error}
                          </p>
                        )}
                </div>
              )}
               
            </div>

            {/* Row 6 */}
            <div className="grid grid-cols-2 gap-8">
              
             
               <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Nomination Status</div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[nominee.Status]}`}>
                  {nominee.Status}
                </span>
               </div>
            </div>

           {/* Row-7 Approval Status */}
        <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  {/* <div className="text-sm font-medium text-gray-900">Nomination Status Flow</div> */}
                  <StatusFlow steps={approvalFlow} />
                </div>
              </div>
             {/* Row 8 – Supporting Documents */}
            <div>
              <div className="font-medium">Supporting Documents</div>
              <div className="text-gray-600 space-y-1">
			  
                {nominee["Supporting Documents"]?.map((doc, i) => (
                <a
                  key={i}
                  href={doc.FilePath}   // replace with your download/view URL
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex my-3 items-center gap-2 text-blue-600 hover:underline"
                >
                  <FileText className="w-5 h-5 text-blue-600" />
                  {doc.OriginalFileName}
                </a>
              ))}
              </div>
            </div>
        {nominee?.BusinessJuryComments?.length > 0 ? (
            <div>
                 <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Approver Comments</div>
                <div className="text-sm text-gray-600">{nominee.BusinessJuryComments}</div>
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
              value={businessJuryComments}
              onChange={(e) => {
                setBusinessJuryComments(e.target.value);
                if (commentError) setCommentError("");
              }}
            ></textarea>

            {commentError && (
              <p className="text-red-600 text-sm">{commentError}</p>
            )}
         </div>
      )}
           {isGeneralJuryApproved() ? (
                    // ⭐ Condition Met: Hide buttons and show a message
                    <div>
                    </div>
                ) : (
                    // ⭐ Condition Not Met: Show the action buttons
                    <>

                      <ActionButtons />
                    </>
                )}

          </div>
        ) : null}
      </div>
      {/* Popup Message */}

      {/* {message && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            fontWeight: 'bold',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 9999,
            animation: 'fadeOut 3s forwards',
            backgroundColor: messageType === 'success' ? 'green' : 'red', // Change color based on message type
          }}
        >
          <span>{message}</span>
        </div>
      )} */}

      {/* {message && (
        <div
          className={`fixed  right-5 px-4 py-2 rounded-lg shadow-lg animate-slide-in z-[9999]
            ${messageType === "success" ? "bg-green-600" : "bg-red-600"} text-white`}
        >
          {message}
        </div>
      )} */}
    </div>
  );
};

export default BusinessPanel;
