import React, { useState, useEffect } from "react";
import { ArrowLeft, FileText, X } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../ContextAPI/AuthContext";
import StatusFlow from "../StatusFlow";
import type { GeneralJury } from "./PresidentUnit";

interface PresidentUnitPanelProps {
  isOpen: boolean;
  onClose: () => void;
  nominee: GeneralJury | null;
  setSuccessMessage: (msg: string) => void;
  setToastType: (t: "success" | "error") => void;
}

type ApprovalFlowItem = {
  type: string;
  status: string;
  level: string;
  comments?: string;
};

const apiUrl = import.meta.env.VITE_API_URL;

const getLevelForType = (type: string): string => {
  switch (type) {
    case "Manager":
    case "Referral":
      return "Level-1";
    case "Business Jury":
      return "Level-2";
    case "General Jury":
      return "Level-3";
    case "President Jury":
      return "Level-4";
    default:
      return "Others";
  }
};

const PresidentUnitPanel: React.FC<PresidentUnitPanelProps> = ({
  isOpen,
  onClose,
  nominee,
  setSuccessMessage,
  setToastType,
}) => {
  debugger;
  const { authToken, userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [popupScore, setPopupScore] = useState("");
  const [popupComments, setPopupComments] = useState("");
  const [popupErrors, setPopupErrors] = useState({ score: "", comments: "" });
  const [descriptionText, setDescriptionText] = useState("");

  useEffect(() => {
    if (nominee) {
      setPopupScore(nominee.GeneralJuryScore?.toString() ?? "");
      setPopupComments(nominee.GeneralJuryComments ?? "");
      setDescriptionText((nominee as any).Descriptions || nominee.Descriptions || (nominee as any).Description || "");
      setPopupErrors({ score: "", comments: "" });
    } else {
      setPopupScore("");
      setPopupComments("");
      setDescriptionText("");
      setPopupErrors({ score: "", comments: "" });
    }
  }, [nominee, isOpen]);

  const parsePossiblyJson = (val: any) => {
    if (!val && val !== 0) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return [];
      }
    }
    return [];
  };

  const isPresidentApproved = nominee?.ApprovalStatus?.some(
    (statusEntry: any) =>
      statusEntry.ApprovalType === "President Jury" &&
      statusEntry.Status === "Approved"
  ) ?? false;

  const openPopup = (type: "approve" | "reject") => {
    setActionType(type);
    setPopupErrors({ score: "", comments: "" });
    setPopupOpen(true);
  };

  const validatePopup = () => {
    const errs = { score: "", comments: "" };
    let ok = true;

    if (!popupScore.trim()) {
      errs.score = "Score is required!";
      ok = false;
    } else if (!/^\d+$/.test(popupScore.trim())) {
      errs.score = "Score must be numeric!";
      ok = false;
    } else {
      const n = Number(popupScore.trim());
      if (n < 1 || n > 100) {
        errs.score = "Score must be between 1 and 100!";
        ok = false;
      }
    }

    if (!popupComments.trim()) {
      errs.comments = "Comments are required!";
      ok = false;
    } else if (popupComments.trim().length > 500) {
      errs.comments = "Comments cannot exceed 500 characters!";
      ok = false;
    }

    setPopupErrors(errs);
    return ok;
  };

  const submitFromPopup = async (approve: boolean) => {
    if (!nominee) return;
    if (!validatePopup()) return;

    setLoading(true);
    setPopupOpen(false);

    try {
      await axios.put(
        `${apiUrl}/api/generaljuryevaluation/${nominee.JuryApprovalsID}`,
        {
          JuryApprovalsID: nominee.JuryApprovalsID,
          NominationID: nominee.NominationID,
          IsGeneralJuryApproved: approve,
          GeneralJuryComments: popupComments.trim(),
          GeneralJuryScore: popupScore.trim(),
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

      setToastType(approve ? "success" : "error");
      setSuccessMessage(
        approve
          ? `You have approved ${nominee.Nominee} successfully!`
          : `You have rejected ${nominee.Nominee} successfully!`
      );

      await Swal.fire({
        icon: approve ? "success" : "error",
        title: approve ? "Approved Successfully!" : "Rejected Successfully!",
      });

      onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
      setToastType("error");
      setSuccessMessage("Action failed");
      Swal.fire({
        icon: "error",
        title: "Action Failed",
        text: approve ? "Approval failed" : "Rejection failed",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !nominee) return null;

  const approvalFlow: ApprovalFlowItem[] = parsePossiblyJson(
    nominee.ApprovalStatus
  ).map((a: any) => ({
    type: a.ApprovalType,
    status: a.Status,
    level: getLevelForType(a.ApprovalType),
    comments: a.ApprovalComments ?? "",
  }));

  const supportingDocs = parsePossiblyJson((nominee as any)["Supporting Documents"]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0 sticky top-0 z-20 shadow-sm">
        <h1 className="text-2xl font-semibold">General Jury Review</h1>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full h-full px-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <div>
              <div className="text-sm font-medium text-gray-900">Nominee</div>
              <div className="text-sm text-gray-600">{nominee.Nominee}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Tenant</div>
              <div className="text-sm text-gray-600">{nominee.Tenant}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Category</div>
              <div className="text-sm text-gray-600">{nominee.CategoryName}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Department</div>
              <div className="text-sm text-gray-600">{nominee.Department}</div>
            </div>
          </div>

          {/* Description - Label if exists, Textbox if empty */}
          <div className="mb-6">
            <div className="text-sm font-medium text-gray-900">Description</div>
            {descriptionText.trim() ? (
              <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg mt-1">
                {descriptionText}
              </div>
            ) : (
              <textarea
                className="w-full border rounded p-2 text-sm mt-1 resize-vertical h-24"
                placeholder="Enter description"
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
              />
            )}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <div>
              <div className="text-sm font-medium text-gray-900">Nominated By</div>
              <div className="text-sm text-gray-600">{nominee.NominatedBy}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Submission Date</div>
              <div className="text-sm text-gray-600">{nominee["Submitted On"] || "N/A"}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Status</div>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                  nominee.Status === "Pending"
                    ? "bg-orange-100 text-orange-800"
                    : nominee.Status === "Approved"
                    ? "bg-green-100 text-green-800"
                    : nominee.Status === "Rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {nominee.Status}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Reporting To</div>
              <div className="text-sm text-gray-600">{nominee.ManagerUserName || "N/A"}</div>
            </div>
          </div>

          {/* Status Flow */}
          <div className="mb-8">
            <StatusFlow steps={approvalFlow} />
          </div>

          {/* Supporting Documents */}
          <div className="text-sm font-medium text-gray-900 mt-8 mb-2">Supporting Documents</div>
          <div className="mt-2 space-y-2 mb-8">
            {supportingDocs.length > 0 ? (
              supportingDocs.map((doc: any, i: number) => (
                <p key={i} className="text-sm text-blue-600">
                  {doc.OriginalFileName}
                </p>
              ))
            ) : (
              <p className="text-sm text-gray-500">No documents uploaded</p>
            )}
          </div>

          {/* General Jury Score & Comments */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <div>
              <div className="text-sm font-medium text-gray-900">General Jury Score</div>
              {nominee.GeneralJuryScore ? (
                <div className="text-sm text-gray-600 mt-1">{nominee.GeneralJuryScore}</div>
              ) : (
                <input
                  type="text"
                  className="w-full border rounded p-2 text-sm mt-1"
                  placeholder="Enter score"
                  value={popupScore}
                  onChange={(e) => setPopupScore(e.target.value)}
                />
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">General Jury Comments</div>
              {nominee.GeneralJuryComments ? (
                <div className="text-sm text-gray-600 mt-1">{nominee.GeneralJuryComments}</div>
              ) : (
                <textarea
                  className="w-full border rounded p-2 text-sm mt-1"
                  rows={3}
                  placeholder="Enter comments"
                  value={popupComments}
                  onChange={(e) => setPopupComments(e.target.value)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer - REJECT & APPROVE buttons */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 shrink-0 sticky bottom-0 z-20 shadow-sm">
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back
          </button>

          {nominee.Status !== "Rejected" && !isPresidentApproved && (
            <button
              onClick={() => openPopup("reject")}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
              disabled={loading}
            >
              {loading ? "Processing..." : "Reject"}
            </button>
          )}

          {nominee.Status !== "Approved" && !isPresidentApproved && (
            <button
              onClick={() => openPopup("approve")}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
              disabled={loading}
            >
              {loading ? "Processing..." : "Approve"}
            </button>
          )}
        </div>
      </div>

      {/* Popup Modal */}
      {popupOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white w-full max-w-xl p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {actionType === "approve"
                  ? "Are you sure you want to approve this nomination?"
                  : "Are you sure you want to reject this nomination?"}
              </h3>
              <button
                className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                onClick={() => setPopupOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700">
                Score <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                maxLength={3}
                className={`w-full p-3 border rounded-lg text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  popupErrors.score ? "border-red-500" : "border-gray-300"
                }`}
                value={popupScore}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d+$/.test(v)) setPopupScore(v);
                }}
              />
              {popupErrors.score && <p className="text-red-600 text-xs mt-1">{popupErrors.score}</p>}
            </div>

            <div className="mt-6">
              <label className="text-sm font-medium text-gray-700">
                Comments <span className="text-red-600">*</span>
              </label>
              <textarea
                className={`w-full p-3 border rounded-lg h-32 text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  popupErrors.comments ? "border-red-500" : "border-gray-300"
                }`}
                value={popupComments}
                maxLength={500}
                onChange={(e) => setPopupComments(e.target.value)}
              />
              {popupErrors.comments && <p className="text-red-600 text-xs mt-1">{popupErrors.comments}</p>}
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => setPopupOpen(false)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 text-white rounded-md ${
                  actionType === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
                onClick={() => submitFromPopup(actionType === "approve")}
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresidentUnitPanel;
