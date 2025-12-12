// ApprovalDetailView.tsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import ApprovalReasonPanel from "./ApproveReasonPanel";
import axios from "axios";
import { useAuth } from "../ContextAPI/AuthContext";
import StatusFlow from "../StatusFlow";

const apiUrl = import.meta.env.VITE_API_URL;

interface ApprovalView {
  NominationID: number;
  nominee: string | null;
  entity: string | null;
  contest: string | null;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
  AwardCategory: string;
  NominatedBy: string;
  ManagerEmailID: string;

  "Referrals ID": {
    Email: string;
    TenantName: string;
    DeptName: string;
    ReferralName: string;
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

  Descriptions: string;
  ApprovalComments: string;
  BusinessJuryStatus: string;
}

const statusColors: Record<ApprovalView["status"], string> = {
  Pending: "bg-orange-100 text-orange-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

const ApprovalDetailView: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const approval = state as ApprovalView; // 🔥 FIXED — No null type

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [actionType, setActionType] = useState<"Approved" | "Rejected" | null>(null);
  const [reason, setReason] = useState("");
  const { userId, authToken } = useAuth();

  // --------------------------
  // APPROVE FUNCTION
  // --------------------------
  const approvalFlow = approval?.ApprovalStatus?.map(a => ({
  type: a.ApprovalType,
  status: a.Status
})) ?? [];
  const handleApprove = async () => {
    try {
      await axios.put(
        `${apiUrl}/api/managerevaluation/${approval.NominationID}`,
        {
          nominationID: approval.NominationID,
          isManagerApproved: true,
          approvalComments: reason,
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

     // alert("Approved Successfully!");
      navigate("/approvals");
    } catch (error) {
      console.error("Approve error:", error);
      alert("Approval failed");
    }
  };

  // --------------------------
  // REJECT FUNCTION
  // --------------------------
  const handleReject = async () => {
    try {
      await axios.put(
        `${apiUrl}/api/managerevaluation/${approval.NominationID}`,
        {
          nominationID: approval.NominationID,
          isManagerApproved: false,
          approvalComments: reason,
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

     // alert("Rejected Successfully!");
      navigate("/approvals");
    } catch (error) {
      console.error("Reject error:", error);
      alert("Reject failed");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Back Button */}
      {/* <button
        onClick={() => navigate("/approvals")}
        className="flex items-center text-blue-600 bg-white border-gray-200 rounded-sm px-3 py-1 font-medium"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back
      </button> */}

      {/* Main Details Box */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mt-3">
        <h1 className="text-2xl font-semibold mb-4">Approval Details</h1>

        <div className="space-y-5">
          {/* Row 1 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="font-medium text-gray-900">Nominee</div>
              <div className="text-gray-700">{approval.nominee}</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Tenant</div>
              <div className="text-gray-700">{approval.entity}</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Category</div>
              <div className="text-gray-700">{approval.AwardCategory}</div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="font-medium text-gray-900">Nominated By</div>
              <div className="text-gray-700">{approval.NominatedBy}</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Submission Date</div>
              <div className="text-gray-700">{approval.date}</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Status</div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${statusColors[approval.status]}`}
              >
                {approval.status}
              </div>
            </div>
          </div>
            {/* Row 3 */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900"></div>
                  <StatusFlow steps={approvalFlow} />
                </div>
              </div>
          {/* Referrals */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="font-medium text-gray-900 mb-1">Referrals</div>

              {approval["Referrals ID"]?.length ? (
                approval["Referrals ID"].map((ref, i) => (
                  <p className="text-gray-700" key={i}>
                    <span className="font-semibold">{ref.ReferralName}</span>
                    <span className="px-2 text-gray-500">|</span>
                    {ref.TenantName}
                    <span className="px-2 text-gray-500">|</span>
                    {ref.DeptName}
                  </p>
                ))
              ) : (
                <p className="text-gray-500">No referral data</p>
              )}
            </div>

            <div>
              <div className="font-medium text-gray-900">Manager Email</div>
              <div className="text-gray-700">{approval.ManagerEmailID}</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="font-medium text-gray-900">Description</div>
            <div className="text-gray-700">{approval.Descriptions}</div>
          </div>

          {/* Supporting Documents */}
          <div>
            <div className="font-medium text-gray-900">Supporting Documents</div>
            <div className="mt-2 space-y-2">
              {approval["Supporting Documents"]?.length ? (
                approval["Supporting Documents"].map((doc, i) => (
                  <a
                    key={i}
                    href={doc.FilePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <FileText className="w-5 h-5" />
                    {doc.OriginalFileName}
                  </a>
                ))
              ) : (
                <p className="text-gray-500">No documents uploaded</p>
              )}
            </div>
          </div>
            {/* Approver Comments — Show only when value exists */}
          {approval.ApprovalComments?.trim() && (
            <div>
              <div className="font-medium text-gray-900">Approver Reason</div>
              <div className="text-gray-700">{approval.ApprovalComments}</div>
            </div>
          )}
          {/* Approver Comments
          // <div>
          //   <div className="font-medium text-gray-900">Approver Reason</div>
          //   <div className="text-gray-700">
          //     {approval.ApprovalComments?.trim() || "No comments available"}
          //   </div>
          // </div>
           */}
        </div>
        
     

        {/* Buttons */}
        <div className="px-6 py-4 flex justify-end space-x-3 mt-6">
          
           {/* Back Button */}
          <button
        onClick={() => navigate("/approvals")}
        className="flex items-center text-blue-600 bg-white border-gray-200 rounded-sm px-3 py-1 font-medium"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back
      </button>
          {approval.status !== "Rejected" && approval.BusinessJuryStatus !== "Approved" && (
            <button
              onClick={() => {
                setActionType("Rejected");
                setIsPanelOpen(true);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition flex items-center"
            >
              ✖ Reject Nomination
            </button>
          )}

          {approval.status !== "Approved" && approval.BusinessJuryStatus !== "Rejected" && (
            <button
              onClick={() => {
                setActionType("Approved");
                setIsPanelOpen(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition flex items-center"
            >
              ✔ Approve Nomination
            </button>
          )}
        </div>
      </div>

      {/* Reason Popup */}
      <ApprovalReasonPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        approvalData={approval}
        reason={reason}
        setReason={setReason}
        actionType={actionType}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default ApprovalDetailView;
