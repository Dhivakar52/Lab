// PresidentUnitPanel.tsx
import React, { useState, useEffect } from "react";
import { X, FileText } from "lucide-react";
import { useAuth } from "../ContextAPI/AuthContext";
import axios from "axios";
import type { GeneralJury } from "./PresidentUnit";
import StatusFlow from "../StatusFlow";

interface PresidentUnitPanelProps {
  isOpen: boolean;
  onClose: () => void;
  nominee: GeneralJury | null;
}

const statusColors: Record<string, string> = {
  Pending: "bg-orange-100 text-orange-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

const apiUrl = import.meta.env.VITE_API_URL;

const PresidentUnitPanel: React.FC<PresidentUnitPanelProps> = ({
  isOpen,
  onClose,
  nominee,
}) => {
  if (!nominee) return null;

  const { authToken, userId } = useAuth();

  const [comments, setComments] = useState("");
  const [commentError, setCommentError] = useState("");
  const [loading, setLoading] = useState(false);
const [Score, setScore] = useState("");
const [scoreError, setScoreError] = useState("");

  // Button styles (same style as PresidentSidePanel)
  const baseClasses =
    "px-4 py-2 text-white rounded-md shadow transition flex items-center justify-center";
  const rejectClasses = `${baseClasses} bg-red-600 hover:bg-red-700`;
  const approveClasses = `${baseClasses} bg-green-600 hover:bg-green-700`;
  const containerClasses =
    "flex justify-around items-center gap-4 mt-6 mb-2";

 useEffect(() => {
  if (nominee) {
    // Load SCORE
    if (nominee.GeneralJuryScore) {
      setScore(nominee.GeneralJuryScore.toString());
    } else {
      setScore("");
    }

    // Load COMMENTS
    if (nominee.GeneralJuryComments) {
      setComments(nominee.GeneralJuryComments);
    } else {
      setComments("");
    }
  }
}, [nominee]);


const validateComments = () => {
  let isValid = true;

  // Validate Comments
  if (!comments.trim()) {
    setCommentError("Comments are required!");
    isValid = false;
  } else {
    setCommentError("");
  }

  // Validate Score
  if (!Score.trim()) {
    setScoreError("Score is required!");
    isValid = false;
  } else {
    setScoreError("");
  }

  return isValid;
};


  const onApprove = async (JuryApprovalsID: number) => {
    if (!validateComments()) return;
    setLoading(true);

    try {
      await axios.put(
        `${apiUrl}/api/generaljuryevaluation/${JuryApprovalsID}`,
        {
          JuryApprovalsID,
          NominationID: nominee.NominationID,
          IsGeneralJuryApproved: true,
          GeneralJuryComments: comments,
          GeneralJuryScore:Score,
          GeneralJuryID: userId,
          SubmittedBy: userId,
          Active: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      window.location.reload();
    } catch (error) {
      console.error("Approve Error:", error);
      alert("Approval failed");
    } finally {
      setLoading(false);
    }
  };

  const onReject = async (JuryApprovalsID: number) => {
    if (!validateComments()) return;
    setLoading(true);

    try {
      await axios.put(
        `${apiUrl}/api/generaljuryevaluation/${JuryApprovalsID}`,
        {
          JuryApprovalsID,
          NominationID: nominee.NominationID,
          IsGeneralJuryApproved: false,
          GeneralJuryComments: comments,
           GeneralJuryScore:Score,
          GeneralJuryID: userId,
          SubmittedBy: userId,
          Active: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      window.location.reload();
    } catch (error) {
      console.error("Reject Error:", error);
      alert("Reject failed");
    } finally {
      setLoading(false);
    }
  };

  const ActionButtons = () => {
    const RejectButton = () => (
      <button
        disabled={loading}
        onClick={() => {
          onReject(nominee.JuryApprovalsID);
          
        }}
        className={rejectClasses}
      >
        ✖ Reject Nomination
      </button>
    );

    const ApproveButton = () => (
      <button
        disabled={loading}
        onClick={() => {
          onApprove(nominee.JuryApprovalsID);
         
        }}
        className={approveClasses}
      >
        ✔ Approve Nomination
      </button>
    );

    switch (nominee.Status) {
      case "Pending":
        return (
          <div className={containerClasses}>
            <RejectButton />
            <ApproveButton />
          </div>
        );
      case "Approved":
        return (
          <div className={containerClasses}>
            <RejectButton />
          </div>
        );
      case "Rejected":
        return (
          <div className={containerClasses}>
            <ApproveButton />
          </div>
        );
      default:
        return null;
    }
  };

  const approvalFlow =
    nominee?.ApprovalStatus?.map((a: any) => ({
      type: a.ApprovalType,
      status: a.Status,
    })) ?? [];

  const supportingDocs = (nominee as any)["Supporting Documents"] ?? [];

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[600px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">General Jury Review</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-100 transition"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto h-[calc(100%-64px)] text-sm space-y-6">
        <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Nominee</div>
                  <div className="text-sm text-gray-600">{nominee.Nominee}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Award Cateory</div>
                  <div className="text-sm text-gray-600">{nominee.CategoryName}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Nominated By</div>
                  <div className="text-sm text-gray-600">{nominee.NominatedBy}</div>
                </div>
              </div>
        

        {/* Row: Submitted Date / Designation / Department */}
        <div className="grid grid-cols-3 gap-8">
  <div className="space-y-1">
    <div className="text-sm font-medium text-gray-900">
      Submitted Date
    </div>
    <div className="text-sm text-gray-600">
      {(nominee as any)["Submitted On"]}
    </div>
  </div>

  <div className="space-y-1">
    <div className="text-sm font-medium text-gray-900">
      Designation
    </div>
    <div className="text-sm text-gray-600">
      {(nominee as any).Designation}
    </div>
  </div>

  <div className="space-y-1">
    <div className="text-sm font-medium text-gray-900">Department</div>
    <div className="text-sm text-gray-600">
      {(nominee as any).Department}
    </div>
  </div>
</div>


        {/* Row: Tenant / Reporting to / Score */}
        <div className="grid grid-cols-3 gap-8">
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-900">Tenant</div>
            <div className="text-sm text-gray-600">{nominee.Tenant}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-900">
              Reporting to
            </div>
            <div className="text-sm text-gray-600">
              {(nominee as any).ManagerUserName}
            </div>
          </div>
          <div className="space-y-1">
               <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-900">
                      Nomination Status
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[nominee.Status]}`}
                    >
                      {nominee.Status}
                    </span>
                  </div>
          </div>
        </div>
          <div className="grid grid-cols-3 gap-8">
                  {/* Nomination Status */}
              

<div className="space-y-2">
  <label className="text-sm font-medium text-gray-900">
    Score <span className="text-red-600">*</span>
  </label>

  {nominee.GeneralJuryScore ? (
    // READ-ONLY label after save
    <div className="text-sm text-gray-700">
      {nominee.GeneralJuryScore}
    </div>
  ) : (
    // INPUT when no score saved yet
    <>
      <div className="relative">
        <input
          type="text"
          maxLength={3}
          className={`w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 ${
            scoreError
              ? "border-red-500 focus:ring-red-400"
              : "focus:ring-blue-400"
          }`}
          value={Score}
          onChange={(e) => {
            const val = e.target.value;

            if (!/^[0-9]*$/.test(val)) return;
            if (val === "0") return;
            if (val === "") return setScore("");

            const num = Number(val);
            if (num < 1 || num > 100) return;

            setScore(val);
            if (scoreError) setScoreError("");
          }}
        />

        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          {Score ? Score : 0}/100
        </div>
      </div>

      {scoreError && <p className="text-red-600 text-sm">{scoreError}</p>}
    </>
  )}
</div>




          </div>
   
        <div className="space-y-1">
        
          <StatusFlow steps={approvalFlow} />
        </div>
        {/* Descriptions */}
        <div>
          <div className="text-sm font-medium text-gray-900">Descriptions</div>
          <div className="text-sm text-gray-600 mt-1">
            {(nominee as any).Descriptions || (nominee as any).Description || ""}
          </div>
        </div>

        {/* Supporting Documents */}
            <div className="space-y-2">
          <div className="text-sm font-medium text-gray-900">
            Supporting Documents
          </div>
          <div className="mt-1 space-y-1">
            {Array.isArray(supportingDocs) && supportingDocs.length > 0 ? (
              supportingDocs.map((doc: any, idx: number) => (
                <a
                  key={idx}
                  href={doc.FilePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <FileText size={18} />
                  {doc.OriginalFileName || "Unnamed file"}
                </a>
              ))
            ) : (
              <div className="text-sm text-gray-500">(No files uploaded)</div>
            )}
          </div>
        </div>
      


        {/* Reason / Comments */}
<div className="space-y-2">
  <label className="text-sm font-medium text-gray-900">
    Approver's Comment <span className="text-red-600">*</span>
  </label>

  {nominee.GeneralJuryComments ? (
    // READ-ONLY LABEL after save
    <div className="text-sm text-gray-700">
      {nominee.GeneralJuryComments}
    </div>
  ) : (
    // INPUT when no comments saved
    <>
      <div className="relative">
        <textarea
          className={`w-full h-24 border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 ${
            commentError
              ? "border-red-500 focus:ring-red-400"
              : "focus:ring-blue-400"
          }`}
          placeholder="Enter your reason here..."
          value={comments}
          maxLength={500}
          onChange={(e) => {
            setComments(e.target.value);
            if (commentError) setCommentError("");
          }}
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          {comments.length}/500
        </div>
      </div>
      {commentError && <p className="text-red-600 text-sm">{commentError}</p>}
    </>
  )}
</div>



        {/* Action buttons (bottom) */}
        <ActionButtons />
      </div>
    </div>
  );
};

export default PresidentUnitPanel;
