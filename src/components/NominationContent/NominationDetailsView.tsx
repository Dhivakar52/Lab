import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { X, ArrowLeft } from "lucide-react";
import StatusFlow from "../StatusFlow";
import { useAuth } from "../ContextAPI/AuthContext";
import * as Dialog from "@radix-ui/react-dialog";
import { useLocation } from "react-router-dom";
//import Swal from "sweetalert2";
import { motion } from 'framer-motion';
import { Edit } from "lucide-react";

 
interface NominationDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
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
  approvedAt:string;
  score:string;
};
 
const NominationDetailView: React.FC<NominationDetailViewProps> = ({
 isOpen, onClose}) => {
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
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const visibleReferrals = expanded ? referrals : referrals.slice(0, 3);
  const [businessJuryDetails, setBusinessJury] = useState<any>(null);
  const [generalJuryDetails, setPresidentLevel] = useState<any>(null);
  const [presidentJuryDetails, setPresidentJury] = useState<any>(null);
  const location = useLocation();
  const from = location.state?.from;
  const tab = location.state?.tab;
  const withdrawAllowedFrom = ["nominations"];
  const [popupOpen, setPopupOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [popupScore, setPopupScore] = useState("");
  const [popupComments, setPopupComments] = useState("");
  const [popupErrors, setPopupErrors] = useState({ score: "", comments: "" });
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [IsSelf, setIsSelf] = useState<boolean | null>(null);
 
  const headerTitleMap: Record<string, string> = {
  "my-nominations": "My Nomination Details",
  "other-nominations": "Other Nomination Details",
  "referral-approval": "Referral Approval Details",
  "approvals": "Manager Approval Details",
  "business-jury": "Business Jury Review",
  "president-level": "President Jury Review",
  "president-unit": "President Unit Review"
  };
 
  const headerTitle =
  headerTitleMap[from] || "Nomination Details";
 
  const toggleExpanded = () => setExpanded(!expanded);
    useEffect(() => {
      if (isOpen) {
      setExpanded(false);
      setExpandedDescription(false);
      }
    }, [isOpen]);
  const MAX_COMMENT_LENGTH = 100;
 
  const toggleComment = (key: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
 
  const getCommentText = (text?: string, expanded?: boolean) => {
    if (!text) return { text: "", truncated: false };
 
    if (text.length <= MAX_COMMENT_LENGTH) {
      return { text, truncated: false };
    }
    return {
      text: expanded ? text : text.slice(0, MAX_COMMENT_LENGTH) + "...",
      truncated: true,
    };
  };
 
  const apiUrl = import.meta.env.VITE_API_URL;
 
  const fetchNominationDetails = async () => {
    try {
      const res = await axios.get(
      `${apiUrl}/api/nominations/${nominationId}`,
      // `${apiUrl}/api/nominationDetails/${nominationId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
      const result = Array.isArray(res.data)
        ? res.data[0] : res.data;
 
      if (!result) {
        setData(null);
        return;
      }
      setData(result);
      setIsSelf(result.IsSelf);
      setReferrals(result["Referrals ID"] || []);
      setDocuments(result["Supporting Documents"]|| []);
      const businessJury = result.BusinessJuryDetails?.[0] || null;
      const generalJury = result.GeneralJuryDetails?.[0] || null;
      const president = result.PresidentDetails?.[0] || null;
      setBusinessJury(businessJury);
      setPresidentLevel(generalJury);
      setPresidentJury(president);
      console.log("sucess",res.data)
 
    } catch (err) {
      console.error("Failed to load nomination details", err);
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
 
  const handleBackward1= () => {

 if (from === "nominations") {
    navigate("/my-nominations", {
      state: { tab: tab || "my" },
    });
    return;
  }
  // if (from === "my-nominations") {
  //   navigate("/my-nominations");
  // }
  // else if (from === "other-nominations") {
  //   navigate("/my-nominations", { state: { tab: tab || "form" } });
  // }
  else if (from === "referral-approval") {
    navigate("/referral-approval");
  }
  else if (from === "approvals") {
    navigate("/approvals");
  }
  else if (from === "president-level") {
    navigate("/president-level");
  }
  else if (from === "president-unit") {
    navigate("/president-unit");
  }
  else if (from === "business-jury") {
    navigate("/business-jury");
  }
};
const handleBackward = () => {

  if (from === "nominations") {
    navigate("/my-nominations", {
      state: { tab: location.state?.tab},
    });
    return;
  }
  switch (from) {
    case "referral-approval":
      navigate("/referral-approval");
      break;

    case "approvals":
      navigate("/approvals");
      break;

    case "business-jury":
      navigate("/business-jury");
      break;

    case "president-level":
      navigate("/president-level");
      break;

    case "president-unit":
      navigate("/president-unit");
      break;

    default:
      navigate(-1); 
  }
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
    approvedAt: a.ApprovedAt,
    score:a.ApprovalScore,
  })
);
 
const hasFinalStatus: boolean = approvalFlow.some(
  (s: ApprovalFlowItem) =>
    s.status === "Approved" || s.status === "Rejected"
);
const showWithdrawButton =
  withdrawAllowedFrom.includes(from) && !hasFinalStatus;
 
const referralApproval = data?.ApprovalStatus?.find(
  (a: any) => a.ApprovalType === "Referral"
);
const managerApproval = data?.ApprovalStatus?.find(
  (a: any) => a.ApprovalType === "Manager"
);
const presidentLevel = data?.ApprovalStatus?.find(
  (a: any) => a.ApprovalType === "General Jury"
);
const presidentJury = data?.ApprovalStatus?.find(
  (a: any) => a.ApprovalType === "President Jury"
);
const businessJury = data?.ApprovalStatus?.find(
  (a: any) => a.ApprovalType === "Business Jury"
);
 
const approvalMap = (data?.ApprovalStatus || []).reduce(
  (acc: any, a: any) => {
    acc[a.ApprovalType] = a;
    return acc;
  },
  {}
);
 
// const referral = approvalMap["Referral"];
// const manager = approvalMap["Manager"];
// const business = approvalMap["Business Jury"];
// const generalJury = approvalMap["General Jury"];
// const president = approvalMap["President Jury"];
 
const levelOrder = [
  // "Referral",
  "Manager",
  "Business Jury",
  "General Jury",
  "President Jury",
];
const getCurrentApprovalType = () => {
  switch (from) {
    // case "referral-approval":
    //   return "Referral";
    case "approvals":
      return "Manager";
    case "business-jury":
      return "Business Jury";
    case "president-unit":
      return "General Jury";
    case "president-level":
      return "President Jury";
    default:
      return null;
  }
};
 
const currentType = getCurrentApprovalType();
const currentApproval = currentType
  ? approvalMap[currentType]
  : null;
const currentStatus = currentApproval?.Status;
 
const currentIndex =
  currentType ? levelOrder.indexOf(currentType) : -1;
const isPreviousApproved =
  currentIndex === 0 ||
  approvalMap[levelOrder[currentIndex - 1]]?.Status === "Approved";
 
const isNextLevelApproved = levelOrder
  .slice(currentIndex + 1)
  .some(
    (lvl) => approvalMap[lvl]?.Status === "Approved"
  );
 
const isRejectedEarlier = levelOrder
  .slice(0, currentIndex)
  .some(
    (lvl) => approvalMap[lvl]?.Status === "Rejected"
  );
const canShowButtons =
  currentApproval &&
  isPreviousApproved &&
  !isRejectedEarlier &&
  !isNextLevelApproved;
  const EDITABLE_STATUSES = [
  "Not Started",
  "Under Review",
];
const canApprove =
  canShowButtons &&
  (EDITABLE_STATUSES.includes(currentStatus) ||
   currentStatus === "Rejected");
 
const canReject =
  canShowButtons &&
  (EDITABLE_STATUSES.includes(currentStatus) ||
   currentStatus === "Approved");
 
const juryMap: any = {
  "business-jury": businessJury,
  "president-unit": presidentLevel,
  "president-level": presidentJury
};
const currentJury = juryMap[from];
 
const EVALUATION_TYPE = {
  Referral: 1,
  Manager: 2,
  BusinessJury: 3,
  GeneralJury: 4,
  President: 5,
};
 
const getEvaluationContext = () => {
  switch (from) {
    case "referral-approval":
      return referralApproval
        ? { type: EVALUATION_TYPE.Referral }
        : null;
 
    case "approvals":
      return managerApproval
        ? { type: EVALUATION_TYPE.Manager }
        : null;
 
    case "business-jury":
      return businessJuryDetails
        ? { type: EVALUATION_TYPE.BusinessJury }
        : null;
 
    case "president-unit":  
      return generalJuryDetails
        ? { type: EVALUATION_TYPE.GeneralJury }
        : null;
 
    case "president-level":
      return presidentJuryDetails
        ? { type: EVALUATION_TYPE.President }
        : null;
 
    default:
      return null;
  }
};
 
const myReferral = referrals.find(r => r.ReferralUserID === userId);
const referralStatus = myReferral?.ReferralStatus;
const isReferralPage = from === "referral-approval";
 
const canApproveReferral =
  isReferralPage &&
  myReferral &&
  (referralStatus === "Pending" ||
   referralStatus === "Under Review" ||
   referralStatus === "Rejected");
 
const canRejectReferral =
  isReferralPage &&
  myReferral &&
  (referralStatus === "Pending" ||
   referralStatus === "Under Review" ||
   referralStatus === "Approved");
 
 
const canApproveFinal = isReferralPage ? canApproveReferral : canApprove;
const canRejectFinal  = isReferralPage ? canRejectReferral  : canReject;
 
 
const buildEvaluationPayload = (approve: boolean) => {
  const ctx = getEvaluationContext();
  if (!ctx) return null;
 
  switch (ctx.type) {
    case EVALUATION_TYPE.Referral:
      return {
        EvalutionType: EVALUATION_TYPE.Referral,
        ReferralID: myReferral.ReferralID,
        ReferralUserID: myReferral.ReferralUserID,
        NominationID: myReferral.NominationID,
        IsReferralApproved: approve,
        ApprovalComments: popupComments.trim(),
        Active: true,
        UpdatedBy: userId,
      };
 
    case EVALUATION_TYPE.Manager:
      return {
        EvalutionType: EVALUATION_TYPE.Manager,
        NominationID: data.NominationID,
        IsManagerApproved: approve,
        ApprovalComments: popupComments.trim(),
        UpdatedBy: userId,
      };
 
    case EVALUATION_TYPE.BusinessJury:
      return {
        EvalutionType: EVALUATION_TYPE.BusinessJury,
        JuryApprovalsID: businessJuryDetails.JuryApprovalsID,
        NominationID: data.NominationID,
        BusinessJuryID:userId,
        IsBusinessJuryApproved: approve,
        BusinessJuryComments: popupComments.trim(),
        BusinessJuryScore: Number(popupScore),
        Active: true,
        UpdatedBy: userId,
      };
 
    case EVALUATION_TYPE.GeneralJury:
      return {
        EvalutionType: EVALUATION_TYPE.GeneralJury,
        JuryApprovalsID: generalJuryDetails.JuryApprovalsID,
        NominationID: data.NominationID,
        GeneralJuryID: userId,
        IsGeneralJuryApproved: approve,
        GeneralJuryComments: popupComments.trim(),
        GeneralJuryScore: Number(popupScore),
        Active: true,
        UpdatedBy: userId,
      };
 
    case EVALUATION_TYPE.President:
      return {
        EvalutionType: EVALUATION_TYPE.President,
        JuryApprovalsID: presidentJuryDetails.JuryApprovalsID,
        NominationID: data.NominationID,
        PresidentID: userId,
        IsPresidentApproved: approve,
        PresidentComments: popupComments.trim(),
        PresidentScore: Number(popupScore),
        Active: true,
        UpdatedBy: userId,
      };
 
    default:
      return null;
  }
};
const approvedComments =
  ["Manager", "Business Jury", "General Jury", "President Jury"]
    .map(level =>
      data?.ApprovalStatus?.find(
        (x: any) => x.ApprovalType === level && x.Status === "Approved"
      )
    )
    .filter(Boolean);
 
const openPopup = (type: "approve" | "reject") => {
    setActionType(type);
    setPopupErrors({ score: "", comments: "" });
    setPopupOpen(true);
  };
 
  const validatePopup = () => {
    const errs = { score: "", comments: "" };
    let ok = true;
   if (showScore) {
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
    if (loading || !data || !validatePopup()) return;
 
    const ctx = getEvaluationContext();
    if (!ctx) return;
 
    const jsonPayload = buildEvaluationPayload(approve);
    if (!jsonPayload) return;
 
    setLoading(true);
    setPopupOpen(false);
   
    try {
      await axios.put(
        `${apiUrl}/api/evaluation/${jsonPayload.JuryApprovalsID ?? 0}/${data.NominationID}`,
        jsonPayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
 
      // ✅ SUCCESS - Show CUSTOM MODAL instead of SweetAlert
      setSuccessModalOpen(true);
 
    } catch (err) {
      console.error("❌ SUBMIT ERROR:", err);
      setErrorMessage("Action failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
 
 
const handlePopupClose = () => {
  setPopupOpen(false);
  fetchNominationDetails();
};
const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    fetchNominationDetails();
  };
 
  useEffect(() => {
    if (nominationId && authToken) {
      fetchNominationDetails();
    }
  }, [nominationId, authToken]);
 
  if (loading) {
    return <div className="p-6">Loading nomination details...</div>;
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
    // if (returnVal === 0 || returnVal === -1) {
    //  setIsWithdrawDialogOpen(false);
    //   setErrorMessage("Failed to withdraw nomination. Please try again.");
    //   setTimeout(() => setErrorMessage(""), 3000);
    //   return;
    // }
 
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
const showScore =
  !(
    (from === "referral-approval" && referralApproval) ||
    (from === "approvals" && managerApproval)
  );
const SCORE_REQUIRED_TYPES = [
  "Business Jury",
  "General Jury",
  "President Jury"
];
// const needsScore = (type: string) => {
//   return (
//     type === "Business Jury" ||
//     type === "General Jury" ||
//     type === "President Jury"
//   );
// };

const handleEdit = () => {
  const id = location.pathname.split("/").pop();  
  if (IsSelf) {
      navigate(`/self-nominations/${id}`);
    } else {
      navigate(`/my-nominations/add-nomination/${id}`);
    }  
};

const needsScore = (type: string) =>
  SCORE_REQUIRED_TYPES.includes(type);
// ✅ CUSTOM APPROVAL SUCCESS MODAL COMPONENT
const ApprovalSuccessModal = () => {
  if (!successModalOpen || !data) return null;
 
  const isApprove = actionType === "approve";
 
  const iconBg = isApprove ? "from-emerald-400 to-teal-600" : "from-red-400 to-rose-600";
  const titleText = isApprove ? "Nomination Approved!" : "Nomination Rejected!";
  const iconSymbol = isApprove ? "✓" : "✖";
  const buttonBg = isApprove
    ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-xl"
    : "bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-xl";

  
  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/45 flex items-center justify-center p-4"
      onClick={handleSuccessClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="bg-white w-full max-w-md p-8 rounded-2xl text-center shadow-2xl relative font-['Roboto'] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
   
  {/* Icon */}
  <div
  className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${iconBg} text-white text-4xl font-black flex items-center justify-center shadow-2xl ring-4 ring-white/50`}
>
  {iconSymbol}
</div>
 
 
  {/* Title */}
  <h2 className="text-2xl font-bold text-gray-900 mb-3">{titleText}</h2>
 
  {/* Message */}
  <p className="text-gray-700 text-sm leading-relaxed mb-4">
    You have successfully {isApprove ? "approved" : "rejected"} the nomination for{" "}
   
  </p>
  <p className="text-gray-700 text-sm leading-relaxed mb-4">
   
    <strong className="text-gray-900 font-semibold">{data.Nominee}</strong>.
  </p>
 
  {/* Meta Info */}
<div className="text-xs text-gray-500 bg-gray-50 mb-6">
  Category: <span className="font-bold text-emerald-400">{data.AwardCategory}</span>
</div>
 
 
   {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
       
          <button
            className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 min-w-[100px]"
            onClick={handleSuccessClose}
          >
            Close
          </button>
        </div>
 
 
     
      </motion.div>
    </div>
  );
};
 
 
return (
  <div>
  <div className="bg-gray-100 flex flex-col p-6 pb-20">
     <div className="overflow-x-auto bg-white shadow-md rounded-lg p-6">
      <div className="w-full h-full px-1 py-1">
        <div className="grid grid-cols-5 gap-6 mb-4">
          <div>
            <div className="text-sm font-medium text-gray-900">Nominee</div>
            <div className="text-sm text-gray-600">{data.Nominee}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Category</div>
            <div className="text-sm text-gray-600">{data.AwardCategory}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Nominated By</div>
            <div className="text-sm text-gray-600">{data.NominatedBy}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Tenant</div>
            <div className="text-sm text-gray-600">{data.Tenant}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Department</div>
            <div className="text-sm text-gray-600">{data.NomineeDepartment}</div>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-6 mb-4">
          <div>
            <div className="text-sm font-medium text-gray-900">
              <span className="relative inline-block">
                Designation
                {/* hyphen positioned absolutely and centered under the label */}
                {(!data?.NomineeDesignation || data.NomineeDesignation.trim() === "") && (
                  <span
                    className="absolute left-1/2 -translate-x-1/2 text-gray-600"
                    style={{ top: "110%" }}
                    aria-hidden
                  >
                    —
                  </span>
                )}
              </span>
            </div>
            <div className="text-sm text-gray-600 h-5">
              {data?.NomineeDesignation && data.NomineeDesignation.trim() !== "" ? data.NomineeDesignation : <span className="invisible">—</span>}
            </div>
          </div>
 
          <div>
            <div className="text-sm font-medium text-gray-900">Submission Date</div>
            {/* <div className="text-sm text-gray-600">{data.SubmittedDate} */}
            <div className="text-sm text-gray-600">{data?.SubmittedDate &&
            data.SubmittedDate.trim() !== "" ? data.SubmittedDate: "—"}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Status</div>
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                data.Status === "Pending"
                  ? "bg-orange-100 text-orange-800"
                  : data.Status === "Approved"
                  ? "bg-green-100 text-green-800"
                  : data.Status === "Rejected"
                  ? "bg-red-100 text-red-800"
                  : data.Status === "Under Review"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`} >
              {data.Status}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Reporting To</div>
            <div className="text-sm text-gray-600">{data.ManagerName}</div>
          </div>
        </div>
         <div className="mb-4">
              <div className="text-sm font-medium text-gray-900">Description</div>
              <div className="text-sm text-gray-600">
                {displayText}
                {isTruncated && (
                  <button
                    onClick={() => setExpandedDescription(!expandedDescription)}
                    className="ml-1 text-blue-600 underline text-sm" >
                    {expandedDescription ? "Show less" : "See more"}
                  </button>
                )}
              </div>
            </div>
        <div className="mb-4">
          <StatusFlow steps={approvalFlow} />
        </div>
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-6 space-y-6">
          <div>
            <div className="text-sm font-medium text-gray-900 mb-2">
              Referrals
            </div>
            {referrals.length ? (
              <div className="border border-gray-300 overflow-hidden">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                        <th className="border border-gray-300 px-3 py-2 text-left">Name</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Dept</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Tenant</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Status</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Approved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleReferrals.map((ref, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 truncate">
                          {ref.ReferralName}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 truncate">
                          {ref.DeptName}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 truncate">
                          {ref.TenantName}
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <span
                            className={`px-2 py-[2px] rounded-full text-[11px] font-medium
                              ${
                                ref.ReferralStatus === "Approved"
                                  ? "bg-green-100 text-green-800"
                                  : ref.ReferralStatus === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-orange-100 text-orange-800"
                              }`}>
                            {ref.ReferralStatus}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-gray-600">
                          {ref.ApprovedAt
                            ? new Date(ref.ApprovedAt).toLocaleDateString("en-GB")
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {referrals.length > 3 && (
                  <div
                  className="px-3 py-2 text-xs text-blue-600 cursor-pointer
                          bg-gray-50 text-center border-t border-gray-300"
                    onClick={toggleExpanded}>
                    {expanded ? "Show less" : `+${referrals.length - 3} more`}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No referral details</p>
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              Supporting Documents
            </div>
            <div className="mt-2 space-y-2">
              {data?.["Supporting Documents"]?.length ? (
                data["Supporting Documents"].map(
                  (doc: SupportingDocument, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-blue-600 cursor-pointer hover:underline"
                      onClick={async () => {
                        const ext =
                          doc.OriginalFileName.split(".").pop()?.toLowerCase() || "";
                        const downloadApiUrl = `${apiUrl}/api/download?fileName=${doc.FileNameGUID}`;
                        try {
                          const response = await axios.get(downloadApiUrl, {
                            responseType: "blob",
                            headers: {
                              Authorization: `Bearer ${authToken}`,
                            },
                          });
 
                          const blobUrl = URL.createObjectURL(response.data);
 
                          if (ext === "pdf") return window.open(blobUrl, "_blank");
 
                          if (["xls", "xlsx", "doc", "docx", "csv"].includes(ext)) {
                            const link = document.createElement("a");
                            link.href = blobUrl;
                            link.download = doc.OriginalFileName;
                            link.click();
                            return;
                          }
 
                          if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
                            setPreviewType(ext);
                            setPreviewFile(blobUrl);
                            setPreviewOpen(true);
                          }
                        } catch {
                          alert("File Not Found");
                        }
                      }}>
                      <img
                        src={getFileIcon(doc.OriginalFileName)}
                        className="w-6 h-6"
                        alt="file" />
                      <span>{doc.OriginalFileName}</span>
                    </div>
                  )
                )
              ) : (
                <p className="text-gray-500 text-sm">No documents uploaded</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-span-6">
          <div className="bg-white border border-gray-300 rounded-2xl shadow-sm h-full">
            <div className="px-6 py-3 border-b border-gray-300 bg-gray-100 rounded-t-2xl">
              <h3 className="text-sm font-semibold text-gray-800">
                Comments
              </h3>
            </div>
            <div className="divide-y divide-gray-300">
              {(() => {
                const approvedComments =
                  data?.ApprovalStatus?.filter(
                    (x: any) => x.Status === "Approved"
                  ) || [];
 
                if (!approvedComments.length) {
                  return (
                    <div className="px-6 py-8 text-center text-sm text-gray-500">
                      No comments available
                    </div>
                  );
                }
                return ["Manager", "Business Jury", "General Jury", "President Jury"].map(
                  (level) => {
                    const item = approvedComments.find(
                      (x: any) => x.ApprovalType === level
                    );
                    if (!item) return null;
                    return (
                      <div key={level} className="flex gap-4 px-6 py-2 items-start">
                        {/* <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                          {item.ApprovalName?.charAt(0)?.toUpperCase() || level.charAt(0)}
                        </div> */}
                       <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold themeColor">
                          {item.ApprovalName?.charAt(0)?.toUpperCase() || level?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 flex justify-between gap-6">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {item.ApprovalName || level}
                            </p>
                            <span className="inline-block mt-1 px-2 py-[2px] text-[11px] rounded-full bg-blue-50 text-blue-600">
                              {level}
                            </span>
                            {item.ApprovalComments && (() => {
                              const { text, truncated } = getCommentText(
                                item.ApprovalComments,
                                expandedComments[level]
                              );
                              return (
                                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                                  {text}
                                  {truncated && (
                                    <button
                                      onClick={() => toggleComment(level)}
                                      className="ml-1 text-blue-600 underline text-sm">
                                      {expandedComments[level] ? "Show less" : "See more"}
                                    </button>
                                  )}
                                </p>
                              );
                            })()}
                            {/* {item.ApprovalComments && (
                              <p className="mt-2 text-sm text-gray-600">
                                {item.ApprovalComments}
                              </p>
                            )} */}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {item.ApprovedAt && (
                              <p className="text-xs text-gray-400">
                                {item.ApprovedAt}
                              </p>
                            )}
                            {needsScore(level) && (
                              <div className="min-w-[80px] px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-center">
                                <p className="text-[11px] text-green-700 font-medium">
                                  Score
                                </p>
                                <p className="text-xl font-bold text-green-800">
                                  {item.ApprovalScore ?? 0}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                );
              })()}
            </div>
          </div>
        </div>
      </div>
 
  {/* <div className="mb-4">
      {myReferral?.ApprovalComments?.trim() && (
        <div className="flex items-center gap-4 mb-2 text-sm text-gray-700">
          <span className="font-semibold text-gray-900 min-w-[140px]">
            Referral
          </span>
          <span>
            <span className="font-medium">Comments:</span>{" "}
            {myReferral.ApprovalComments}
          </span>
        </div>
      )}
     {data?.ApprovalStatus?.map((item: any, index: number) => (
        item.Status === "Approved" && (
          <div
            key={index}
            className="flex items-center gap-4 mb-2 text-sm text-gray-700">
            <span className="font-semibold text-gray-900 min-w-[140px]">
              {item.ApprovalType}
            </span>
            {needsScore(item.ApprovalType) && (
              <span>
                <span className="font-medium">Score:</span>{" "}
                {item.ApprovalScore ?? 0}
              </span>
            )}
            <span>
              <span className="font-medium">Comments:</span>{" "}
              {item.ApprovalComments?.trim() || "—"}
            </span>
           
          </div>
        )
      ))}
      </div> */}
    </div>
   </div>
</div>
    {/* <div className="bg-white border-t border-gray-200 px-6 py-4 shrink-0 sticky bottom-0 z-20 shadow-sm">
         <div className="flex justify-end gap-3"> */}
    <div className="fixed bottom-0 left-0 w-full h-15 bg-white border-t border-gray-200 flex items-center pl-[260px] pr-6">
      <div className="flex justify-end space-x-4 ml-auto" >          
         <button onClick={handleBackward} className="flex items-center text-blue-600 bg-white border rounded-sm px-2 py-1 font-medium">
         <span className=""><ArrowLeft size={14}/></span> Back
          </button>
        {showWithdrawButton && ( 
          <button
          onClick={handleEdit}
          className="btn-theme-edit text-white rounded-sm px-2 py-1 hover:bg-blue-700 flex items-center"
          > 
          <span  className="edit-icon"><Edit size={14} /></span>Edit  
          </button>
        )}
        {showWithdrawButton && (
          
          <button
            onClick={() => setIsWithdrawDialogOpen(true)}
                  className="px-4 py-2 btn-theme-reject">
            Withdraw
          </button>
        )}
        {/* { !showApproveReject && !hasRejectReferral &&( */}
          {canRejectFinal && (
              <button
                onClick={() => openPopup("reject")}
                    //className="px-4 py-2 bg-red-100 text-white-100 rounded-md shadow hover:bg-red-200 transition flex items-center"
                  className="px-4 py-2 btn-theme-reject"
              >
                ✖ Reject Nomination
              </button>
            )}
            {/* {!showApproveReject && !hasApprovedReferral && ( */}
            { canApproveFinal &&(
              <button
                onClick={() => openPopup("approve")}
                className="px-4 py-2 rounded-md shadow btn-theme"
              >
                ✔ Approve Nomination
              </button>
            )}
         
             {/* Show status if President already approved */}
              {/* {isPresidentApproved && (
                <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                  ✅ Already approved by President Jury
                </div>
              )} */}
        </div>
      </div>
    {successMessage && (
      <div className="fixed top-5 right-5 z-[9999] bg-green-600 text-white px-5 py-3
      rounded-lg shadow-xl text-sm font-medium animate-slide-in">
      {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-5 right-5 z-[9999] bg-red-600 text-white px-5 py-3
        rounded-lg shadow-xl text-sm font-medium animate-slide-in">
          {errorMessage}
        </div>
      )}
    {/* Popup Modal */}
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
         {showScore && (
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
                  }} />
                <div className="absolute right-2 bottom-2 text-xs text-gray-500 pointer-events-none">
                  {popupScore ? popupScore : "1"}/100
                </div>
              </div>
              {popupErrors.score && <p className="text-red-600 text-xs mt-1">{popupErrors.score}</p>}
            </div>
          )}
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
                  }}/>
                <div className="absolute right-2 bottom-2 text-xs text-gray-500 pointer-events-none">
                  {popupComments.length > 0 ? popupComments.length : 1}/500
                </div>
              </div>
              {popupErrors.comments && <p className="text-red-600 text-xs mt-1">{popupErrors.comments}</p>}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setPopupOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className={`px-4 py-2 ${actionType === "approve" ? "btn-theme" : "btn-theme-reject"}`}
                onClick={() => submitFromPopup(actionType === "approve")}
                disabled={loading} >
                {loading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
        {/* ✅ SUCCESS MODAL - NEW CUSTOM DESIGN */}
      <ApprovalSuccessModal />
{/* ================= Withdraw Confirmation Dialog ================= */}
<Dialog.Root
  open={isWithdrawDialogOpen}
  onOpenChange={setIsWithdrawDialogOpen}
>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
    <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[90%] max-w-sm
      -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg">
 
      <Dialog.Title className="text-center text-lg font-semibold text-gray-900">
        Are you sure you want to withdraw this nomination?
      </Dialog.Title>
 
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={() => setIsWithdrawDialogOpen(false)}
          className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100">
          No
        </button>
        <button
          onClick={handleWithdraw}
          className="px-4 py-2 btn-theme">
          Yes
        </button>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
 
{/* ================= Document Preview Dialog ================= */}
<Dialog.Root
  open={previewOpen}
  onOpenChange={setPreviewOpen}
>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
 
    <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[90%] h-[80%] max-w-3xl
      -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-xl overflow-hidden">
 
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
 
export default NominationDetailView;