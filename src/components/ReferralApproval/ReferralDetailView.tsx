// ReferralDetailView.tsx
import React, { useState } from "react";
import { useLocation ,useNavigate} from "react-router-dom";
import { FileText ,ArrowLeft } from "lucide-react";
import { useAuth } from "../ContextAPI/AuthContext";
import axios from "axios";
import ReferralReasonPanel from "./ReferralReasonpanel";
//import {  useNavigate } from "react-router-dom";

import StatusFlow from "../StatusFlow";

interface ReferralDetail {
  NominationID: number;
  ReferralID: number;
  ReferralUserID: number;
  nominee: string | null;
  entity: string | null;
  contest: string | null;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
  AwardCategory: string;
  NominatedBy: string;
  SubmittedDate: string;
  ContestType: string;
  ManagerName: string;
  ManagerEmailID: string;
  Descriptions: string;
  Comments: string | null;
  "Referrals ID": {
    ReferralName: string;
    TenantName: string;
    DeptName: string;
    Email: string;
     ReferralStatus:string;
  }[];
  "Supporting Documents": {
    OriginalFileName: string;
    FileType: string;
    FileNameGUID: string;
    FilePath: string;
  }[];
   "ApprovalStatus": {
   Status: string;
  ApprovalType: string;
  }[];
  Department: string;
  BusinessJuryStatus: string;
}
type ApprovalFlowItem = {
  type: string;
  status: string;
  level: string;
  comments?: string;
};

const statusColors1: Record<ReferralDetail["status"], string> = {
  Pending: "bg-orange-100 text-orange-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};
const statusColors: Record<string, string> = {
  Pending: "bg-orange-100 text-orange-800 border-orange-300",
  Approved: "bg-green-100 text-green-800 border-green-300",
  Rejected: "bg-red-100 text-red-800 border-red-300",
  "Under Review": "bg-yellow-100 text-yellow-800 border-yellow-300",
};

const apiUrl = import.meta.env.VITE_API_URL;

const ReferralDetailView: React.FC = () => {
  const [reason, setReason] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  const { userId, authToken } = useAuth();
  const { state } = useLocation();
  const data = state as ReferralDetail;
   const navigate = useNavigate();

   const approvalFlow: ApprovalFlowItem[] = (data?.ApprovalStatus || []).map(
  (a: any) => ({
    type: a.ApprovalType,
    status: a.Status,
    level: a.ApprovalFlow,
    comments: a.ApprovalComments,
  })
);

  const handleBackward = () => {
    navigate("/referral-approval");   // ⬅ go to referral approval page
  };

  if (!data) return <div className="p-6 text-gray-600">No Referrals found</div>;

  // Open panel with action type
  const openPanel = (type: "approve" | "reject") => {
    setActionType(type);
    setIsPanelOpen(true);
  };

  // Submit approve/reject after reason is provided
  const handleApproveReject = async (type: "approve" | "reject") => {
    if (!data || !authToken) return;

    try {
      await axios.put(`${apiUrl}/api/referralvaluations/${data.ReferralID}`, {
        referralUserID: data.ReferralUserID,
        nominationID: data.NominationID,
        isReferralApproved: type === "approve",
        approvalComments: reason,
        active: true,
        submittedBy: userId,
      }, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
     // alert(`Nomination ${type === "approve" ? "Approved" : "Rejected"} Successfully!`);
      setIsPanelOpen(false);
      setReason("");
    } catch (err) {
      console.error(err);
      alert(`${type === "approve" ? "Approval" : "Reject"} failed`);
    }
  };

  return (
    
    <div className=" bg-gray-50 min-h-screen">
     
      <div className="bg-white rounded-lg shadow-lm border border-gray-200  mt-3">
        <h1 className="text-2xl font-semibold mb-4 px-6 pt-2">Referral Details</h1>
        
        <div className="space-y-5 px-6">
          {/* Row 1 */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-lm font-medium text-gray-900">Nominee</div>
              <div className="text-lm text-gray-600">{data.nominee}</div>
            </div>
            <div>
              <div className="text-lm font-medium text-gray-900">Tenant</div>
              <div className="text-lm text-gray-600">{data.entity}</div>
            </div>
            <div>
              <div className="text-lm font-medium text-gray-900">Category</div>
              <div className="text-lm text-gray-600">{data.AwardCategory}</div>
            </div>
              <div>
              <div className="font-medium text-gray-900">Department</div>
              <div className="text-gray-700">{data.Department}</div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-lm font-medium text-gray-900">Nominated By</div>
              <div className="text-lm text-gray-600">{data.NominatedBy}</div>
            </div>
            <div>
              <div className="text-lm font-medium text-gray-900">Submission Date</div>
              <div className="text-lm text-gray-600">{data.date}</div>
            </div>
             <div>
              <div className="text-lm font-medium text-gray-900 ">Status</div>
              <div className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${statusColors[data.status]}`}>
                {data.status}
              </div>
            </div>
             <div>
              <div className="text-lm font-medium text-gray-900">Reporting To</div>
              <div className="text-lm text-gray-600">{data.ManagerName}</div>
            </div>
           
          </div>
          <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900"></div>
                  <StatusFlow steps={approvalFlow} />
                </div>
              </div>
          {/* Row 3 */}
          <div className="grid">
            <div>
            <div className="text-lm font-medium text-gray-900 mb-1">Referrals</div>
            <div className="text-gray-600 space-y-1">
              {data["Referrals ID"]?.length ? (
                data["Referrals ID"].map((ref, i) => (
                  <div key={i}>
                    <p className="text-lm">
                      <span className="font-semibold text-gray-800">{ref.ReferralName}</span>
                      <span className="px-2 text-gray-500">|</span>
                      <span className="text-gray-600">{ref.TenantName}</span>
                      <span className="px-2 text-gray-500">|</span>
                      <span className="font-semibold text-gray-600">{ref.DeptName}</span>
                       <span className="px-2 text-gray-500">|</span>
                  {/* Reusing same color mapping */}
                  <span
                    className={`px-3 py-1 text-xs border rounded-full font-semibold ${
                      statusColors[ref.ReferralStatus] ??
                      statusColors.Default
                    }`}
                  >
                    {ref.ReferralStatus}
                  </span>
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-lm">No referral details available</p>
              )}
            </div>
          </div>
           
          </div>

         
          {/* Description */}
          <div>
            <div className="text-lm font-medium text-gray-900">Description</div>
            <div className="text-lm text-gray-600">{data.Descriptions?.trim() || "No description provided"}</div>
          </div>

          {/* Supporting Documents */}
          <div>
            <div className="text-lm font-medium text-gray-900">Supporting Documents</div>
            <div className="mt-2 space-y-2">
              {data["Supporting Documents"]?.length ? (
                data["Supporting Documents"].map((doc, i) => (
                  <a
                    key={i}
                    href={doc.FilePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <FileText className="w-5 h-5 text-blue-600" />
                    {doc.OriginalFileName}
                  </a>
                ))
              ) : (
                <p className="text-gray-500 text-lm">No documents uploaded</p>
              )}
            </div>
          </div>
           {/* Approver Comments — Show only when value exists */}
          {data.Comments?.trim() && (
            <div>
              <div className="font-medium text-gray-900">Approver Reason</div>
              <div className="text-gray-700">{data.Comments}</div>
            </div>
          )}
          {/* Reviewer Comments */}
            {/* <div>
              <div className="text-lm font-medium text-gray-900">Approver Reason</div>
              <div className="text-lm text-gray-600">
                {data.Comments?.trim() || "No comments available"}
              </div>
            </div> */}
        </div>

       
        {/* Approve / Reject Buttons */}
         {/* <div className=" px-6 py-4 flex justify-end space-x-3 mt-6 sticky bottom-0 bg-white  z-50"> */}
          <div className="bg-white border-t border-gray-200 px-6 py-4 shrink-0 sticky bottom-0 flex justify-end z-20 shadow-sm">
          
          {/* <div className="px-6 py-4  flex justify-end space-x-3 mt-6"> */}
             <button
          onClick={handleBackward}
          className="flex items-center me-3 text-blue-600 bg-white border-gray-100 rounded-sm px-2 py-1 font-medium"
        >
          <span className="me-2"><ArrowLeft size={14}/></span> Back
        </button>

            {data.status !== "Rejected" && data.BusinessJuryStatus !== "Approved"&& (
              <button
                onClick={() => openPanel("reject")}
                className="px-4 py-2 mx-3 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition flex items-center"
              >
                ✖ Reject Nomination
              </button>
            )}
            {data.status !== "Approved" && data.BusinessJuryStatus !== "Rejected"&& (
              <button
                onClick={() => openPanel("approve")}
                className="px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition flex items-center"
              >
                ✔ Approve Nomination
              </button>
            )}
          </div>

      </div>

      {/* Side Panel */}
      <ReferralReasonPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        nomination={data}
        reason={reason}
        setReason={setReason}
         actionType={actionType}   // <-- ADD THIS
        //onApprove={() => handleApproveReject("approve")}
       // onReject={() => handleApproveReject("reject")}
          onApprove={async () => {
            await handleApproveReject("approve");
            navigate("/referral-approval");   // Redirect after approval
          }}
          onReject={async () => {
            await handleApproveReject("reject");
            navigate("/referral-approval");   // Redirect after rejection
          }}
      />
    </div>
  );
};

export default ReferralDetailView;
