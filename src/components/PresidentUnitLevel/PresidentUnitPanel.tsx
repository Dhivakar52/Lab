// PresidentUnitPanel.tsx
import React, { useState, useEffect } from "react";
import { X, FileText } from "lucide-react";
import { useAuth } from "../ContextAPI/AuthContext";
import axios from "axios";
import type { GeneralJury } from "./PresidentUnit";

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

  const [presidentUnitComments, setPresidentUnitComments] = useState("");
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "reject">("success");
  const [loading, setLoading] = useState<boolean>(false);

  // CONFIRMATION MODAL STATES
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<"approve" | "reject">("approve");
  const [commentError, setCommentError] = useState("");


  // ⭐ LOAD COMMENTS
  useEffect(() => {
    if (nominee?.GeneralJuryComments) {
      setPresidentUnitComments(nominee.GeneralJuryComments);
    } else {
      setPresidentUnitComments("");
    }
  }, [nominee]);
const validateComments = () => {
  if (!presidentUnitComments.trim()) {
    setCommentError("Comments are required!");
    return false;
  }
  setCommentError("");
  return true;
};

  // ⭐ VALIDATE COMMENTS
  // const validateComments = () => {
  //   if (!presidentUnitComments.trim()) {
  //     setMessage("Comments are required!");
  //     setMessageType("reject");
  //     return false;
  //   }
  //   setMessage("");
  //   return true;
  // };

  // ⭐ APPROVE API
  const onApprove = async (JuryApprovalsID: number) => {
    if (!validateComments()) return;

    setLoading(true);
    try {
      await axios.put(
        `${apiUrl}/api/generaljuryevaluation/${JuryApprovalsID}`,
        {
          JuryApprovalsID,
          NominationID: nominee?.NominationID,
          IsGeneralJuryApproved: true,
          GeneralJuryComments: presidentUnitComments,
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

      // ✅ Show success toast
      setMessage("General Jury Approved Successfully!");
      setMessageType("success");

      // Close panel
      onClose();

      // Reload page after 2 seconds
      setTimeout(() => {
        setMessage("");
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Approve Error:", error);
      setMessage("Approval failed. Try again.");
      setMessageType("reject");
    } finally {
      setLoading(false);
    }
  };

  // ⭐ REJECT API
  const onReject = async (JuryApprovalsID: number) => {
    if (!validateComments()) return;

    setLoading(true);
    try {
      await axios.put(
        `${apiUrl}/api/generaljuryevaluation/${JuryApprovalsID}`,
        {
          JuryApprovalsID,
          NominationID: nominee?.NominationID,
          IsGeneralJuryApproved: false,
          GeneralJuryComments: presidentUnitComments,
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

      // ✅ Show reject toast
      setMessage("General Jury Rejected Successfully!");
      setMessageType("reject");

      // Close panel
      onClose();

      // Reload page after 2 seconds
      setTimeout(() => {
        setMessage("");
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Reject Error:", error);
      setMessage("Reject failed. Try again.");
      setMessageType("reject");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     CONFIRMATION MODAL
  ======================= */
  const ConfirmationModal = () => {
    if (!showConfirm) return null;

    const isReject = confirmType === "reject";

    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[99999]">
        <div className="bg-white rounded-lg shadow-lg w-96 overflow-hidden">

          {/* Header */}
          <div
            className={`p-3 text-white font-semibold ${
              isReject ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {isReject ? "Confirm Rejection" : "Confirm Approval"}
          </div>

          {/* Body */}
          <div className="p-4 text-sm text-gray-700">
            Are you sure you want to{" "}
            <span className={isReject ? "text-red-600" : "text-green-600"}>
              {isReject ? "reject" : "approve"}
            </span>{" "}
            this nomination?
          </div>

          {/* Footer */}
          <div className="p-3 flex justify-end gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                setShowConfirm(false);
                confirmType === "reject"
                  ? onReject(nominee.JuryApprovalsID)
                  : onApprove(nominee.JuryApprovalsID);
              }}
              className={`px-4 py-1 rounded text-white ${
                isReject
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isReject ? "Confirm Reject" : "Confirm Approve"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ⭐ ACTION BUTTONS
  const ActionButtons = () => {
    if (!nominee) return null;

    const RejectButton = () => (
      <button
        onClick={() => {
          setConfirmType("reject");
          setShowConfirm(true);
        }}
        className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow flex items-center"
      >
        ✖ Reject Nomination
      </button>
    );

    const ApproveButton = () => (
      <button
        onClick={() => {
          setConfirmType("approve");
          setShowConfirm(true);
        }}
        className="px-2 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow flex items-center"
      >
        ✔ Approve Nomination
      </button>
    );

    switch (nominee.Status) {
      case "Pending":
        return (
          <div className="flex justify-around items-center gap-4 mt-4">
            <RejectButton />
            <ApproveButton />
          </div>
        );
      case "Approved":
        return (
          <div className="flex justify-center mt-4">
            <RejectButton />
          </div>
        );
      case "Rejected":
        return (
          <div className="flex justify-center mt-4">
            <ApproveButton />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <ConfirmationModal />

      {/* Toast */}
      {message && (
        <div
          className={`fixed top-5 right-5 px-4 py-2 rounded-lg shadow-lg z-[9999] ${
            messageType === "success" ? "bg-green-600" : "bg-red-600"
          } text-white`}
        >
          {message}
        </div>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">President Unit Review</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto h-[calc(100%-64px)] space-y-5 text-sm">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="font-medium text-gray-900">Nominee</div>
              <div className="text-gray-600">{nominee.Nominee}</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Category</div>
              <div className="text-gray-600">{nominee.CategoryName}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="font-medium text-gray-900">Entity</div>
              <div className="text-gray-600">{nominee.Tenant}</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Score</div>
              <div className="text-gray-600">{nominee.Score}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="font-medium text-gray-900">Submitted On</div>
              <div className="text-gray-600">{nominee.SubmittedOn}</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Status</div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  statusColors[nominee.Status]
                }`}
              >
                {nominee.Status}
              </span>
            </div>
          </div>

          <div>
            <div className="font-medium">Supporting Documents</div>
            <div className="text-gray-600 space-y-1">
              {nominee["Supporting Documents"]?.map((doc, i) => (
                <a
                  key={i}
                  href={doc.FilePath}
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

          {/* Comments */}
          <div className="space-y-2">
  <label className="text-sm font-medium text-gray-900">
    Reason <span className="text-red-600">*</span>
  </label>

  <textarea
    className={`w-full h-24 border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 ${
      commentError ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400"
    }`}
    placeholder="Enter your reason here..."
    value={presidentUnitComments}
    onChange={(e) => {
      setPresidentUnitComments(e.target.value);
      if (commentError) setCommentError("");
    }}
  ></textarea>

  {commentError && (
    <p className="text-red-600 text-sm">{commentError}</p>
  )}
</div>

          {/* <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Reason <span className="text-red-600">*</span>
            </label>

            <textarea
              className={`w-full h-24 border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 ${
                messageType === "reject"
                  ? "border-red-500 focus:ring-red-400"
                  : "focus:ring-blue-400"
              }`}
              placeholder="Enter your reason here..."
              value={presidentUnitComments}
              onChange={(e) => setPresidentUnitComments(e.target.value)}
            ></textarea>

            {message && messageType === "reject" && (
              <p className="text-red-600 text-sm">{message}</p>
            )}
          </div> */}

          <ActionButtons />
        </div>
      </div>
    </>
  );
};

export default PresidentUnitPanel;
