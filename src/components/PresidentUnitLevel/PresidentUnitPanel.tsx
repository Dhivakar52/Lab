import React, { useState, useEffect } from "react";
import { X, FileText, ArrowLeft } from "lucide-react";
import { useAuth } from "../ContextAPI/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";
import type { GeneralJury } from "./PresidentUnit";
import StatusFlow from "../StatusFlow";
import { useNavigate } from "react-router-dom";



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
  const { authToken, userId } = useAuth();
  const [loading, setLoading] = useState(false);

  const [popupOpen, setPopupOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [popupScore, setPopupScore] = useState("");
  const [popupComments, setPopupComments] = useState("");
  const [popupErrors, setPopupErrors] = useState({ score: "", comments: "" });
  const navigate = useNavigate();

const handleBackward = () => {
  onClose(); 
};


  useEffect(() => {
    if (nominee) {
      setPopupScore(nominee.GeneralJuryScore?.toString() ?? "");
      setPopupComments(nominee.GeneralJuryComments ?? "");
      setPopupErrors({ score: "", comments: "" });
    } else {
      setPopupScore("");
      setPopupComments("");
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
    } else {
      if (!/^\d+$/.test(popupScore.trim())) {
        errs.score = "Score must be numeric!";
        ok = false;
      } else {
        const n = Number(popupScore.trim());
        if (n < 1 || n > 100) {
          errs.score = "Score must be between 1 and 100!";
          ok = false;
        }
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

      await Swal.fire({
        icon: approve ? "success" : "error",
        title: approve ? "Approved Successfully!" : "Rejected Successfully!",
        text: approve
          ? `You have approved ${nominee.Nominee} successfully!`
          : `You have rejected ${nominee.Nominee} successfully!`,
      });

      onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
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

  const approvalFlow = parsePossiblyJson(nominee.ApprovalStatus).map((a: any) => ({
    type: a.ApprovalType,
    status: a.Status,
  }));

  const supportingDocs = parsePossiblyJson((nominee as any)["Supporting Documents"]);

  return (
    <>
     
<div className="fixed inset-0 bg-black/30 z-50 flex justify-center items-start overflow-auto">

  
  <div className="bg-white w-full max-w-6xl my-6 rounded-lg shadow-xl flex flex-col">

    
   <div className="relative flex items-center p-4 border-b">

  
  <button
    onClick={onClose}
    className="flex items-center text-blue-600 bg-white border border-gray-200 rounded-sm px-2 py-1 font-medium hover:bg-gray-50"
  >
    <ArrowLeft size={14} className="mr-2" />
    Back
  </button>

  
  <h2 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold">
    General Jury Review
  </h2>

</div>

    <div className="p-6 overflow-y-auto text-sm space-y-6">

      {/* Basic Info */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="font-medium text-gray-900">Nominee</div>
          <div className="text-gray-600">{nominee.Nominee}</div>
        </div>
        <div>
          <div className="font-medium text-gray-900">Category</div>
          <div className="text-gray-600">{nominee.CategoryName}</div>
        </div>
        <div>
          <div className="font-medium text-gray-900">Tenant</div>
          <div className="text-gray-600">{nominee.Tenant}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div>
          <div className="font-medium text-gray-900">Nominated By</div>
          <div className="text-gray-600">{nominee.NominatedBy}</div>
        </div>
        <div>
          <div className="font-medium text-gray-900">Reporting To</div>
          <div className="text-gray-600">{(nominee as any).ManagerUserName}</div>
        </div>
        <div>
          <div className="font-medium text-gray-900">Submitted Date</div>
          <div className="text-gray-600">{(nominee as any)["Submitted On"]}</div>
        </div>
      </div>

      <div>
        <div className="font-medium text-gray-900">Status</div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            statusColors[nominee.Status] ?? "bg-gray-100 text-gray-800"
          }`}
        >
          {nominee.Status}
        </span>
      </div>

      {/* Description */}
      <div>
        <div className="font-medium text-gray-900">Description</div>
        <div className="text-gray-600 mt-1">
          {(nominee as any).Descriptions ||
            (nominee as any).Description ||
            ""}
        </div>
      </div>

      {/* Supporting Documents */}
      <div>
        <div className="font-medium text-gray-900">Supporting Documents</div>
        <div className="mt-2 space-y-1">
          {supportingDocs.length > 0 ? (
            supportingDocs.map((doc: any, idx: number) => (
              <a
                key={idx}
                href={doc.FilePath}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <FileText size={18} />
                {doc.OriginalFileName}
              </a>
            ))
          ) : (
            <div className="text-gray-500">(No files uploaded)</div>
          )}
        </div>
      </div>

      {/* Status Flow */}
      <StatusFlow steps={approvalFlow} />

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-4">
        {nominee.Status !== "Rejected" && (
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={() => openPopup("reject")}
            disabled={loading}
          >
            ✖ Reject Nomination
          </button>
        )}

        {nominee.Status !== "Approved" && (
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            onClick={() => openPopup("approve")}
            disabled={loading}
          >
            ✔ Approve Nomination
          </button>
        )}
      </div>

    </div>
  </div>
</div>


     
      {popupOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white w-full max-w-xl p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {actionType === "approve"
                  ? "Are you sure you want to approve this nomination?"
                  : "Are you sure you want to reject this nomination?"}
              </h3>
              <button className="text-gray-600" onClick={() => setPopupOpen(false)}>
                <X />
              </button>
            </div>

            {/* Score */}
            <div className="mt-4">
              <label className="text-sm font-medium">
                Score <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={3}
                  className={`w-full mt-1 p-2 pr-10 border rounded text-sm ${popupErrors.score ? "border-red-500" : "border-gray-300"}`}
                  value={popupScore}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "") {
                      setPopupScore("");
                      setPopupErrors(prev => ({ ...prev, score: "" }));
                      return;
                    }
                    if (!/^\d+$/.test(v)) return;
                    const n = Number(v);
                    if (n < 1 || n > 100) {
                      setPopupErrors(prev => ({ ...prev, score: "Score must be between 1 and 100" }));
                      return;
                    }
                    setPopupScore(v);
                    setPopupErrors(prev => ({ ...prev, score: "" }));
                  }}
                />
                <div className="absolute right-2 bottom-2 text-xs text-gray-500 pointer-events-none">
                  {popupScore ? popupScore : "1"}/100
                </div>
              </div>
              {popupErrors.score && <p className="text-red-600 text-xs mt-1">{popupErrors.score}</p>}
            </div>

            {/* Comments */}
            <div className="mt-4">
              <label className="text-sm font-medium">
                Approver Comments <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <textarea
                  className={`w-full mt-1 p-2 pr-10 border rounded h-28 resize-none text-sm ${popupErrors.comments ? "border-red-500" : "border-gray-300"}`}
                  value={popupComments}
                  maxLength={500}
                  onChange={(e) => {
                    setPopupComments(e.target.value);
                    setPopupErrors(prev => ({ ...prev, comments: "" }));
                  }}
                />
                <div className="absolute right-2 bottom-2 text-xs text-gray-500 pointer-events-none">
                  {popupComments.length > 0 ? popupComments.length : 1}/500
                </div>
              </div>
              {popupErrors.comments && <p className="text-red-600 text-xs mt-1">{popupErrors.comments}</p>}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setPopupOpen(false)}>
                Cancel
              </button>
              <button
                className={`px-4 py-2 text-white rounded ${actionType === "approve" ? "bg-green-600" : "bg-red-600"}`}
                onClick={() => submitFromPopup(actionType === "approve")}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PresidentUnitPanel;
