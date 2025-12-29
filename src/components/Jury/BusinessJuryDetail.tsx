import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { X } from "lucide-react";
import StatusFlow from "../StatusFlow";
import { useAuth } from "../ContextAPI/AuthContext";
import * as Dialog from "@radix-ui/react-dialog";

interface BusinessJuryDetailProps {
  isOpen: boolean;
  onClose?: () => void;
  onRefresh?: () => void;
}
interface SupportingDocument {
  OriginalFileName: string;
  FileType: string;
  FileNameGUID: string;
  FilePath: string;
}
type ApprovalFlowItem = {
  type: string;
  status: string;
  level: string;
  comments?: string;
};
interface ReferralItem {
  ReferralID: number;
}
const BusinessJuryDetail: React.FC<BusinessJuryDetailProps> = ({
 isOpen, onClose, onRefresh}) => {
  const { nominationId } = useParams<{ nominationId: string }>();
  const navigate = useNavigate();
  const { authToken, userId } = useAuth();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [data, setData] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const visibleReferrals = expanded ? referrals : referrals.slice(0, 3);

const [popupOpen, setPopupOpen] = useState(false);
const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
const [popupErrors, setPopupErrors] = useState({ score: "", comments: "" });
const [popupComments, setPopupComments] = useState("");
const [popupScore, setPopupScore] = useState("");

  const toggleExpanded = () => setExpanded(!expanded);
    useEffect(() => {
      if (isOpen) {
      setExpanded(false);
      setExpandedDescription(false);
      }
    }, [isOpen]);


  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchNominationDetails = async () => {
    try {
      const res = await axios.get(
        `${apiUrl}/api/nominations/${nominationId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const result = res.data[0];
      setData(result);
      setReferrals(result["Referrals ID"] || []);
      setDocuments(result["Supporting Documents"]|| []);
    } catch (err) {
      console.error("Failed to load Business Jury details", err);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return "https://img.icons8.com/color/48/pdf.png";
    case "xls":
    case "xlsx":
      return "https://img.icons8.com/color/48/ms-excel.png";
    case "doc":
    case "docx":
      return "https://img.icons8.com/color/48/ms-word.png";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return "https://img.icons8.com/color/48/image.png";
    case "txt":
      return "https://img.icons8.com/color/48/file.png";
    default:
      return "https://img.icons8.com/color/48/file.png";
  }
};


  const handleBackward = () => {
  window.history.back();
};

const description =
  data?.Descriptions && data.Descriptions.trim() !== ""
    ? data.Descriptions.trim()
    : "No description provided";
  const maxLength = 440;
  const isTruncated = description.length > maxLength;
  const displayText = expandedDescription || !isTruncated
    ? description
    : description.slice(0, maxLength) + "...";

  const approvalFlow: ApprovalFlowItem[] = (data?.ApprovalStatus || []).map(
  (a: any) => ({
    type: a.ApprovalType,
    status: a.Status,
    level: a.ApprovalFlow,
    comments: a.ApprovalComments,
  })
);

const hasFinalStatus: boolean = approvalFlow.some(
  (s: ApprovalFlowItem) =>
    s.status === "Approved" || s.status === "Rejected"
);

  useEffect(() => {
    if (nominationId) {
      fetchNominationDetails();
    }
  }, [nominationId]);


const findBusinessEntry = (payload: any) => {
    if (!payload) return null;

    const businessDetails = payload.BusinessJuryDetails;
    if (Array.isArray(businessDetails) && businessDetails.length) return businessDetails[0];
    if (businessDetails && typeof businessDetails === "object") return businessDetails;

    return null;
  };

const busiEntry = findBusinessEntry(data);
const busiCommentsD = busiEntry?.BusinessJuryComments ?? "";
const busiScoreD = busiEntry?.BusinessJuryScore ?? null;
const busiStatusD =  busiEntry?.BusinessJuryStatus ?? "";
const busiJuryApprovalsID = busiEntry?.JuryApprovalsID ?? null;


const findGeneralEntry = (payload: any) => {
    if (!payload) return null;

    const generalDetails = payload.GeneralJuryDetails;
    if (Array.isArray(generalDetails) && generalDetails.length) return generalDetails[0];
    if (generalDetails && typeof generalDetails === "object") return generalDetails ;

    return null;
  };

const generalEntry = findGeneralEntry(data);
const generalCommentsD = generalEntry?.GeneralJuryComments ?? "";
const generalScoreD = generalEntry?.GeneralJuryScore ?? null;

  const findPresidentEntry = (payload: any) => {
    if (!payload) return null;

    const presidentDetails = payload.PresidentDetails;
    if (Array.isArray(presidentDetails) && presidentDetails.length) return presidentDetails[0];
    if (presidentDetails && typeof presidentDetails === "object") return presidentDetails;

    return null;
  };

  const presEntry = findPresidentEntry(data);
  const presCommentsD =presEntry?.PresidentComments ?? "";
  const presScoreD = presEntry?.PresidentScore ?? null;

  if (loading) {
    return <div className="p-6">Loading Business Jury details...</div>;
  }

  if (!data) {
    return <div className="p-6 text-red-600">Nomination not found</div>;
  }
  const handleWithdraw = async () => {
   try {
    const payload = {
    "nomination": {
    "cycleID": 0,
    "awardCategoryID": 0,
    "nominationTitle": "string",
    "userID": userId,
    "isSelf": true,
    "nominationCreatedBy": 0,
    "descriptions": "string",
    "approvalTypeID": 0,
    "isManagerApproved": true,
    "approvalComments": "string",
    "statusID": 0,
    "active": false,
    "businessJuryID": 0,
    "createdBy": 0,
    "updatedBy": userId
  },
  "referralIDs": [
    {
      "referralID": 0,
      "nominationID": 0,
      "referralUserID": 0,
      "isReferralApproved": true,
      "approvalComments": "string",
      "active": true,
      "createdBy": 0,
      "updatedBy": 0
    }
  ],
  "documents": [
    {
      "nominationFileID": 0,
      "nominationID": 0,
      "originalFileName": "string",
      "fileType": "string",
      "fileSize": "string",
      "fileNameGUID": "string",
      "filePath": "string",
      "active": true,
      "createdBy": 0,
      "updatedBy": 0
    }
  ]
};
    const res = await axios.delete(
      `${apiUrl}/api/nominations/${data.NominationID}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        data: payload
      }
    );

   const returnVal = res.data?.nominationID ?? res.data;
   console.log("return",returnVal)
    if (returnVal === 0 || returnVal === -1) {
      setErrorMessage("Failed to withdraw nomination. Please try again.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    setIsWithdrawDialogOpen(false);
    setSuccessMessage("Nomination Withdrawn Successfully!");

    setTimeout(() => {
      setSuccessMessage("");
      navigate("/my-nominations");
    }, 3000);

  } catch (error) {
    console.error("Withdraw failed:", error);
    setErrorMessage("Something went wrong while withdrawing nomination.");
    setTimeout(() => setErrorMessage(""), 3000);
  }
};

   const handleWithdraw1 = async () => {
  try {
    const payload = {
    "nomination": {
    "cycleID": 0,
    "awardCategoryID": 0,
    "nominationTitle": "string",
    "userID": userId,
    "isSelf": true,
    "nominationCreatedBy": 0,
    "descriptions": "string",
    "approvalTypeID": 0,
    "isManagerApproved": true,
    "approvalComments": "string",
    "statusID": 0,
    "active": false,
    "businessJuryID": 0,
    "createdBy": 0,
    "updatedBy": userId
  },
  "referralIDs": [
    {
      "referralID": 0,
      "nominationID": 0,
      "referralUserID": 0,
      "isReferralApproved": true,
      "approvalComments": "string",
      "active": true,
      "createdBy": 0,
      "updatedBy": 0
    }
  ],
  "documents": [
    {
      "nominationFileID": 0,
      "nominationID": 0,
      "originalFileName": "string",
      "fileType": "string",
      "fileSize": "string",
      "fileNameGUID": "string",
      "filePath": "string",
      "active": true,
      "createdBy": 0,
      "updatedBy": 0
    }
  ]
};
    const res = await axios.delete(
      `${apiUrl}/api/nominations/${data.NominationID}`,
      // `http://172.16.5.106:5195/api/nominations/${data.nominationId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        data: payload
      }
    );

    console.log("Withdraw success", res.data);
    setIsWithdrawDialogOpen(false);
    onClose?.();
    setSuccessMessage("Nomination Withdrawn Successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
    //setShowSuccessModal(true);

  } catch (error) {
    console.error("Withdraw failed:", error);
    alert("Failed to withdraw nomination");
  }
};

  const baseClasses = "px-2 py-2 text-white rounded-md shadow transition flex items-center";
  const rejectClasses = `${baseClasses} bg-red-600 hover:bg-red-700`;
  const approveClasses = `${baseClasses} bg-green-600 hover:bg-green-700`;
  const backClasses = `${baseClasses} bg-blue-600 hover:bg-blue-700`;
  const containerClasses = "flex justify-around items-center gap-4 mt-4";

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
    const onApprove = async (approve: boolean) => {
    if (!data) return;
    if (!validatePopup()) return;

    setLoading(true);
    setPopupOpen(false);

    try {
      await axios.put(
         `${apiUrl}/api/businessjuryevaluation/${busiJuryApprovalsID}`,
          {
            NominationID:data?.NominationID,
            IsBusinessJuryApproved: true,
            BusinessJuryComments: popupComments.trim(),
            BusinessJuryScore:popupScore.trim() === "" ? null : Number(popupScore.trim()),
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
      onClose?.();
      window.location.reload();
    } catch (err) {
      console.error(err);
     } finally {
      setLoading(false);
    }
  };

    const onReject = async (JuryApprovalsID: number) => {
    setLoading(true);
      try {

        await axios.put(
          `${apiUrl}/api/businessjuryevaluation/${busiJuryApprovalsID}`,
          {
            NominationID:data?.NominationID,
            IsBusinessJuryApproved: false,
            BusinessJuryComments: busiCommentsD,
            BusinessJuryScore:busiScoreD,
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
        setData((prev:any) =>
          prev.map((item:any) =>
            item.JuryApprovalsID === JuryApprovalsID ? { ...item, Status: "Rejected" } : item
          )
        );

      } catch (error) {
        console.error("Reject Error:", error);
        alert("Reject failed");
      } finally{
       setLoading(false);
       window.location.reload();
      }
    };

    const isGeneralJuryApproved = (): boolean => {
     // Use .some() for efficiency. Return true if ANY entry matches the criteria.
     return data?.ApprovalStatus?.some(
       (statusEntry:any) => 
         statusEntry.ApprovalType === 'General Jury' && statusEntry.Status === 'Approved' // Ensure lowercase 'approved' if your backend uses it
     ) ?? false; // Default to false if nominee or ApprovalStatus is null/undefined
   };
  const ActionButtons = () => {
    if (!data) return null; // Safety check


    const RejectButton = () => (
      <button
        onClick={() => onReject(busiJuryApprovalsID)}
        disabled={loading}
        className={rejectClasses}
      >
        ✖ Reject
      </button>


    );

    const ApproveButton = () => (
      <button
      type="button"
        onClick={() => openPopup("approve")}
        disabled={loading}
        className={approveClasses}
      >
        ✔ Approve
      </button>
    );
    //Ganga


    // Switch logic for rendering the correct combination
    switch (busiStatusD) {
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
        return (
          <div className={containerClasses}>
            <RejectButton />
            <ApproveButton />
          </div>
        );
    }
  };


  return (
  <div className="min-h-screen bg-gray-100 flex flex-col">
    {/* Fixed Header */}
    <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0 sticky top-0 z-20 shadow-sm">
      <h1 className="text-2xl font-semibold">Business Jury Details</h1>
    </div>

    {/* Scrollable Content Area */}
    <div className="flex-1 overflow-y-auto">
      <div className="w-full h-full px-6 py-4">
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div>
            <div className="text-sm font-medium text-gray-900">Nominee</div>
            <div className="text-sm text-gray-600">{data.Nominee}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Tenant</div>
            <div className="text-sm text-gray-600">{data.Tenant}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Category</div>
            <div className="text-sm text-gray-600">{data.AwardCategory}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Department</div>
            <div className="text-sm text-gray-600">{data.NomineeDepartment}</div>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-900">Description</div>
          <div className="text-sm text-gray-600">
            {displayText}
            {isTruncated && (
              <button
                onClick={() => setExpandedDescription(!expandedDescription)}
                className="ml-1 text-blue-600 underline text-sm"
              >
                {expandedDescription ? "Show less" : "See more"}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-6">
          <div>
            <div className="text-sm font-medium text-gray-900">Nominated By</div>
            <div className="text-sm text-gray-600">{data.NominatedBy}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Submission Date</div>
            <div className="text-sm text-gray-600">{data.SubmittedDate}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Status</div>
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                busiStatusD === "Pending"
                  ? "bg-orange-100 text-orange-800"
                  : busiStatusD === "Approved"
                  ? "bg-green-100 text-green-800"
                  : busiStatusD  === "Rejected"
                  ? "bg-red-100 text-red-800"
                  : busiStatusD === "Under Review"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {busiStatusD}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Reporting To</div>
            <div className="text-sm text-gray-600">{data.ManagerName}</div>
          </div>
        </div>

        {/* STATUS FLOW */}
        <div className="mb-8">
          <StatusFlow steps={approvalFlow} />
        </div>

        {/* REFERRALS */}
        <div className="text-sm font-medium text-gray-900 mb-1">Referrals</div>
        <div className="text-gray-600 space-y-1">
          {referrals.length ? (
            <>
              {visibleReferrals.map((ref, i) => (
                <div key={i}>
                  <p className="text-sm">
                    <span className="font-semibold text-gray-800">{ref.ReferralName}</span>
                    <span className="px-2 text-gray-500">|</span>
                    <span className="text-gray-600">{ref.TenantName}</span>
                    <span className="px-2 text-gray-500">|</span>
                    <span className="font-semibold text-gray-600">{ref.DeptName}</span>
                    <span className="px-2 text-gray-500"></span>
                    <span className={`px-3 py-1 text-xs border rounded-full font-medium
                      ${ref.ReferralStatus === "Approved" ? "bg-green-100 text-green-800 border-green-300" :
                      ref.ReferralStatus === "Rejected" ? "bg-red-100 text-red-800 border-red-300" :
                      ref.ReferralStatus === "Pending" ? "bg-orange-100 text-orange-800 border-orange-300" :
                      ref.ReferralStatus === "Under Review" ? "bg-yellow-100 text-yellow-800 border-yellow-300" :
                      "bg-gray-100 text-gray-700 border-gray-300"}`}>
                      {ref.ReferralStatus}
                    </span>
                  </p>
                </div>
              ))}
              {referrals.length > 3 && (
                <p className="text-sm text-blue-500 cursor-pointer" onClick={toggleExpanded}>
                  {expanded ? "less" : `+${referrals.length - 3} more`}
                </p>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm">No referral details available</p>
          )}
        </div>

        {/* DOCUMENTS */}
        <div className="text-sm font-medium text-gray-900 mt-8">Supporting Documents</div>
        <div className="mt-2 space-y-2">
          {data?.["Supporting Documents"] && data["Supporting Documents"].length > 0 ? (
            data["Supporting Documents"].map((doc: SupportingDocument, i: number) => (
              <div
                key={i}
                className="flex items-center gap-3 text-blue-600 cursor-pointer hover:underline"
                onClick={async () => {
                  const ext = doc.OriginalFileName.split(".").pop()?.toLowerCase() || "";
                  const downloadApiUrl = `${apiUrl}/api/download?fileName=${doc.FileNameGUID}`;

                  try {
                    const response = await axios.get(downloadApiUrl, {
                      responseType: "blob",
                      headers: {
                        Authorization: `Bearer ${authToken}`,
                      },
                    });

                    const blob = response.data;
                    const blobUrl = window.URL.createObjectURL(blob);

                    if (ext === "pdf") {
                      window.open(blobUrl, "_blank");
                      return;
                    }

                    if (["xls", "xlsx", "doc", "docx", "csv"].includes(ext)) {
                      const link = document.createElement("a");
                      link.href = blobUrl;
                      link.download = doc.OriginalFileName;
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                      return;
                    }

                    if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
                      setPreviewType(ext);
                      setPreviewFile(blobUrl);
                      setPreviewOpen(true);
                      return;
                    }
                  } catch (err) {
                    console.error("Download failed:", err);
                    alert("File Not Found");
                  }
                }}
              >
                <img
                  src={getFileIcon(doc.OriginalFileName)}
                  className="w-6 h-6"
                  alt="file"
                />
                <span>{doc.OriginalFileName}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No documents uploaded</p>
          )}
        </div>

        <br/>
        {(busiScoreD !== null || busiCommentsD !== "") ?(
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-sm font-medium text-gray-900">Business Jury Score</div>
            <div className="text-sm text-gray-600">{busiScoreD}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Business Jury Comment</div>
            <div className="text-sm text-gray-600">{busiCommentsD}</div>
          </div>
        </div>
        ):("")}

        {(generalScoreD !== null || generalCommentsD !== "") ?(
         <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-sm font-medium text-gray-900">General Jury Score</div>
            <div className="text-sm text-gray-600">{generalScoreD}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">General Jury Comment</div>
            <div className="text-sm text-gray-600">{generalCommentsD}</div>
          </div>
        </div>
        ):("")}

        {(presScoreD !== null || presCommentsD !== "") ?(
         <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-sm font-medium text-gray-900">President Jury Score</div>
            <div className="text-sm text-gray-600">{presScoreD}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">President Jury Comment</div>
            <div className="text-sm text-gray-600">{presCommentsD}</div>
          </div>
        </div>
        ):("")}

      </div>

    </div>


    {/* Fixed Footer */}
    <div className="bg-white border-t border-gray-200 px-6 py-4 shrink-0 sticky bottom-0 z-20 shadow-sm">
         <div className="flex justify-end gap-3">
          <div className={containerClasses}>
            <button
          onClick={handleBackward}
          className={backClasses}
        >
          Back
        </button>
          </div>

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

        {!hasFinalStatus && (
          <button
            onClick={() => setIsWithdrawDialogOpen(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Withdraw
          </button>
        )}

    </div>

    {/* Success Message */}
    {successMessage && (
      <div className="fixed top-5 right-5 z-[9999] bg-green-600 text-white px-5 py-3 rounded-lg shadow-xl text-sm font-medium animate-slide-in">
        {successMessage}
      </div>
    )}

    {errorMessage && (
      <div className="mx-6 mt-4 p-3 rounded-md bg-red-100 text-red-800 text-sm font-medium fixed top-20 left-6 right-6 z-30">
        {errorMessage}
      </div>
    )}

{/* Ganga */}
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
                Business Jury Score <span className="text-red-600">*</span>
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
                onClick={() => onApprove(actionType === "approve")}
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Ganga */}

    {/* Withdraw Confirmation Dialog */}
    <Dialog.Root open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg">
          <Dialog.Title className="text-center text-lg font-semibold text-gray-900">
            Are you sure you want to withdraw this nomination?
          </Dialog.Title>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => setIsWithdrawDialogOpen(false)}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
            >
              No
            </button>
            <button
              onClick={handleWithdraw}
              className="px-4 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
            >
              Yes
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>

    {/* Document Preview Dialog */}
    <Dialog.Root open={previewOpen} onOpenChange={setPreviewOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[90%] h-[80%] max-w-3xl -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-xl overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Document Preview</h2>
            <button
              className="p-1 hover:bg-gray-200 rounded"
              onClick={() => setPreviewOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          <div className="w-full h-full border rounded overflow-auto flex justify-center items-center bg-gray-50">
            {["jpg", "jpeg", "png", "gif"].includes(previewType || "") && (
              <img
                src={previewFile!}
                alt="Preview"
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </div>
);

};


export default BusinessJuryDetail;

