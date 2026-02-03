import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { X, ArrowLeft } from "lucide-react";
import StatusFlow from "../JuryStatusFlow";
import { useAuth } from "../ContextAPI/AuthContext";
import * as Dialog from "@radix-ui/react-dialog";
import { useLocation } from "react-router-dom";
//import Swal from "sweetalert2";
import { motion } from 'framer-motion';
import { Flag, Edit, Send ,User, Building2, Tag, 
  CalendarDays, FileText, Mail, BadgeCheck, Check } from "lucide-react";

interface BusinessJuryDetailProps {
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

 const Icon = ({ children }: any) => (
  <span className="text-gray-400 mr-2 flex items-center">
    {children}
  </span>
);

const BusinessJuryDetail: React.FC<BusinessJuryDetailProps> = ({
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
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagOpen1, setFlagOpen1] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagFiles, setFlagFiles] = useState<File[]>([]);
  const [flagPreview, setFlagPreview] = useState<string | null>(null);
  const [flagError, setFlagError] = useState("");
  //home module//
  const [seekingOpen, setSeekingOpen] = useState(false);
  const [seekingUsers, setSeekingUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [openApprove, setOpenApprove] = useState(false);
  const [openEvaluation, setOpenEvaluation] = useState(false);
  const [openScore, setOpenScore] = useState(false);
  const [score, setScore] = useState(70);
  const [flag, setFlag] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [popupType, setPopupType] = useState<
    "approve" | "score" | "evaluation" | null
  >(null);

  const closePopup = () => setPopupType(null);
  const fetchSeekingUsers = async () => {
  try {
    const res = await axios.get(`${apiUrl}/api/users`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    setSeekingUsers(res.data || []);
  } catch (err) {
    console.error("Seeking users load failed", err);
  }
};
const sendSeekingUser = async () => {
  if (selectedUsers.length === 0) {
    alert("Select at least one user");
    return;
  }

  try {
    for (const id of selectedUsers) {
      const payload = {
        nominationID: data.NominationID,
        seekingUserID: id,
        active: true,
        submittedBy: userId
      };

      await axios.post(`${apiUrl}/api/seeking`, payload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
    }

    setSelectedUsers([]);
    setSearch("");
    setSeekingOpen(false);

  } catch (err) {
    alert("Save failed");
  }
};
//end home module//
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
    // `${apiUrl}/api/jurylevelnomination/${nominationId}/${userId}`, 
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
  const handleFlagFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    setFlagFiles(selectedFiles);
  };

 const submitFlagWithAttachment = async () => {
  if (!flagReason.trim()) {
    setFlagError("Please enter flag reason");
    return;
  }

  const formData = new FormData();
  formData.append("NominationID", data.NominationID);
  formData.append("IsFlag", "true");
  formData.append("FlagReason", flagReason);
  formData.append("UpdatedBy", String(userId));

  flagFiles.forEach((file) => {
    formData.append("Files", file);
  });

  try {
    await axios.post(
      `${apiUrl}/api/nomination/flag-with-document`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setFlagOpen(false);
    setFlagReason("");
    setFlagFiles([]);
    setFlagError("");

    fetchNominationDetails();

  } catch {
    alert("Flag save failed");
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
const statusStyleMap: Record<string, string> = {
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
};
const approvalTextColorMap: Record<string, string> = {
  Approved: "text-emerald-700",
  Rejected: "text-red-700",
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
const statusFlowData = [
  {
    level: 1,
    title: "Manager Approval",
    status: "Approved",
    date: "16/01/2025",
    comments: "Excellent performance and dedication.",
    showApproveButton: false,
    showScoreButton: false,
    totalScore: null,
    flag: null
  },
  {
    level: 2,
    title: "Business Jury",
    status: "Approved",
    totalScore: "260/400",
    flag: "Yes",
    showApproveButton: false,
    showScoreButton: true
  },
  {
    level: 3,
    title: "General Jury",
    status: "Pending",
    showApproveButton: true,
    showScoreButton: false
  }
];

const approvalStatus = [
  {
    ApprovalType: "Manager",
    Status: "Approved",
    ApprovedAt: "16/01/2025",
    ApprovalComments: "Excellent performance and dedication."
  },
  {
    ApprovalType: "Business Jury",
    Status: "Approved",
    ApprovedAt: "18/01/2026",
    ApprovalComments: "Demonstrates leadership qualities",
    ApprovalScore: 260,
    IsFlagged: true,
    FlagReason: "Missing one document"
  }
];
const levels = [
  { key: "Manager", title: "Manager Approval" },
  { key: "Business Jury", title: "Business Jury" },
  { key: "General Jury", title: "General Jury" }
];

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
 <div className="bg-gray-100 p-6 pb-20">
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
    <div className="flex gap-6 items-start w-full">
  <div
    className="w-24 h-24 rounded-full border-4 border-emerald-500 flex items-center justify-center text-white font-bold text-5xl"
    style={{
      background: "linear-gradient(90deg, rgb(8, 128, 94) 16%, rgb(24, 97, 174) 100%)",
    }}>
    {data.Nominee?.charAt(0).toUpperCase()}
  </div>
  <div className="flex-1">
    <div className="flex justify-between items-start mb-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Nomination Details
      </h2>
      <div className="text-sm text-gray-600">
        DOJ & Age in SRM :
        <span className="ml-1 text-blue-600 font-medium">
          01/2022, 4 Years
        </span>
      </div>
    </div>
    <div className="grid grid-cols-4 gap-x-10 gap-y-6 text-sm w-full">
      <div>
        <p className="text-gray-500">Nomination ID</p>
        <div className="font-medium text-gray-900">{data.NominationID}</div>
      </div>
      <div>
        <p className="text-gray-500">Nominee</p>
        <div className="flex items-center font-medium text-gray-900">
          <User size={16} className="text-gray-400 mr-2" />{data.Nominee}
        </div>
      </div>
      <div>
        <p className="text-gray-500">Entity</p>
        <div className="flex items-center font-medium">
          <Building2 size={16} className="text-gray-400 mr-2" />{data.Tenant}
        </div>
      </div>
      <div>
        <p className="text-gray-500">Category</p>
        <div className="flex items-center font-medium">
          <Tag size={16} className="text-gray-400 mr-2" />{data.AwardCategory}
        </div>
      </div>
      <div>
        <p className="text-gray-500">Nomination By</p>
        <div className="flex items-center font-medium">
          <User size={16} className="text-gray-400 mr-2" />{data.NominatedBy}
        </div>
      </div>
      <div>
        <p className="text-gray-500">Contest Type</p>
        <div className="flex items-center font-medium">
          <FileText size={16} className="text-gray-400 mr-2" />
          Other Nomination
        </div>
      </div>
      <div>
        <p className="text-gray-500">Submission Date</p>
        <div className="flex items-center font-medium">
          <CalendarDays size={16} className="text-gray-400 mr-2" />{data?.SubmittedDate &&
            data.SubmittedDate.trim() !== "" ? data.SubmittedDate: "—"}
        </div>
      </div>
      <div>
        <p className="text-gray-500">Status</p>
        <span
          className={`inline-flex items-center gap-2 mt-1 px-3 py-1 text-xs rounded border ${
            data.Status === "Pending"
              ? "bg-orange-100 text-orange-800 border-orange-300"
              : data.Status === "Approved"
              ? "bg-green-100 text-green-800 border-green-300"
              : data.Status === "Rejected"
              ? "bg-red-100 text-red-800 border-red-300"
              : data.Status === "Under Review"
              ? "bg-yellow-100 text-yellow-800 border-yellow-300"
              : "bg-gray-100 text-gray-700 border-gray-300"
          }`}>
          {data.Status === "Under Review" && <BadgeCheck size={14} />}
          {data.Status === "Under Review" ? "L2 – Under Review" : data.Status}
        </span>
      </div>
       <div>
        <p className="text-gray-500">Manager Email Id</p>
        <div className="flex items-center font-medium">
          <Mail size={16} className="text-gray-400 mr-2" />{data.ManagerEmailID}
        </div>
      </div>
    </div>
  </div>
</div>
    <div className="border-b border-gray-200 mt-6" />
    <div className="mt-5">
      <p className="text-sm font-semibold text-gray-900 mb-1">
        Description
      </p>
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
    <div className="border-b border-gray-200 mt-5" />
    <div className="mt-5">
      <p className="text-sm font-semibold mb-3">
        Supporting Documents
      </p>
       <div className="mt-2 flex flex-wrap gap-4">
       {/* <div className="mt-2 space-y-2"> */}
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
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6">
    <h3 className="text-sm font-semibold text-gray-900 mb-4">
      Referral Information
    </h3>
  {referrals.length ? (
    <div className="overflow-hidden">
      {/* <div className="overflow-hidden border border-gray-200 rounded-lg"> */}
    <table className="w-full text-sm border-collapse">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left">Nominee Name</th>
          <th className="px-4 py-3 text-left">Tenant</th>
          <th className="px-4 py-3 text-left">Department</th>
        </tr>
      </thead>

      <tbody>
        {visibleReferrals.map((ref, i) => (
          <tr
            key={i}
            className="hover:bg-gray-50 border-b border-gray-200 last:border-b-0">
            <td className="px-4 py-3">{ref.ReferralName}</td>
            <td className="px-4 py-3">{ref.TenantName}</td>
            <td className="px-4 py-3">{ref.DeptName}</td>
          </tr>
        ))}
      </tbody>
    </table>

      {referrals.length > 3 && (
        <div
          className="px-3 py-2 text-xs text-blue-600 cursor-pointer bg-gray-50 text-center border-t border-gray-300"
          onClick={toggleExpanded}>
          {expanded ? "Show less" : `+${referrals.length - 3} more`}
        </div>
      )}
    </div>
  ) : (
    <p className="text-gray-500 text-sm">No referral details</p>
  )}
  </div>
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6">
      <h2 className="text-base font-semibold mb-6">
        Nomination Status Flow
      </h2>
      <div className="flex gap-4 relative">
        <div className="flex flex-col items-center">
          <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
            <Check size={16} className="text-white" />
          </div>
          <div className="w-[2px] flex-1 bg-gray-300 mt-1"></div>
        </div>
        <div className="flex-1 pb-8">
          <div className="flex justify-between items-center mb-3">
            <p className="font-medium text-gray-900">
              Level 1 - Manager Approval
            </p>
            <button
              onClick={() => setOpenApprove(true)}
              className="px-4 py-1.5 rounded-lg text-sm bg-green-100 text-green-700 
              hover:bg-green-200 transition">
              Approved
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-1">
            <div>
              <span className="text-gray-500">Date:</span>{" "}
              16/01/2025
            </div>
            <div>
              <span className="text-gray-500">Comments:</span>
            </div>
            <div className="text-gray-900">
              Excellent performance and dedication.
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-4 relative">
        <div className="flex flex-col items-center">
          <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
            <Check size={16} className="text-white" />
          </div>
          <div className="w-[2px] flex-1 bg-gray-300 mt-1"></div>
        </div>
        <div className="flex-1 pb-8">
          <div className="flex justify-between items-center mb-3">
            <p className="font-medium text-gray-900">
              Level 2 - Business Jury
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setOpenEvaluation(true)}
                className="px-4 py-2 rounded-lg border border-blue-500 text-blue-600 text-sm hover:bg-blue-50">
                View Evaluations
              </button>
              <button 
               onClick={() => setOpenScore(true)}
               className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm">
                Score
              </button>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-10 text-sm">
            <div>
              <span className="text-gray-500">Total Score :</span>{" "}
              <span className="font-medium">260/400</span>
            </div>
            <div className="flex items-center gap-2">
              <Flag size={18} className="text-red-400"/>
              <span className="font-medium">Flag:</span> Yes
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className="w-7 h-7 rounded-full border-2 border-gray-400 bg-white flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <p className="font-medium text-gray-900">
              Level 3 - General Jury
            </p>
            <button className="px-6 py-2 rounded-lg border border-gray-300 text-gray-400 cursor-not-allowed">
              Approve
            </button>
          </div>
        </div>
      </div>
  </div>
    <div className="fixed bottom-0 left-0 w-full h-15 bg-white border-t border-gray-200 flex items-center pl-[260px] pr-6">
      <div className="flex justify-end space-x-4 ml-auto" >  
         <button onClick={handleBackward} className="flex items-center text-blue-600 bg-white border rounded-sm px-2 py-1 font-medium">
         <span className=""><ArrowLeft size={14}/></span> Back
          </button>
        </div>
      </div>
      <div
        className={`fixed top-0 right-0 h-full w-[680px] bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${openApprove ? "translate-x-0" : "translate-x-full"}
        `}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-[16px] font-semibold text-gray-900">
            Level 2 - Manager Approval
          </h2>
          <button onClick={() => setOpenApprove(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-6 text-sm text-gray-800">
          <div className="mb-[18px]">
            <label className="block mb-2 font-medium">
              Status
            </label>
            <select
              className="w-full h-[42px] px-3 border border-gray-300 rounded-[6px] bg-white focus:outline-none ">
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </div>
          <div className="mb-[18px]">
            <label className="block mb-2 font-medium">
              Comments
            </label>
            <textarea rows={4} placeholder="Enter your comments"
              className="w-full px-3 py-2 border border-gray-300 rounded-[6px] resize-none focus:outline-none"/>
          </div>
          <div className="flex items-center gap-2 mb-[12px]">
            <Flag size={18} className="text-red-400" />
            <span className="font-medium">Flag :</span>
            <input type="checkbox" className="w-4 h-4 mt-[1px]" />
          </div>
          <textarea rows={3} placeholder="Flagged reason here"
            className="w-full px-3 py-2 border border-red-300 bg-red-50 rounded-[6px] resize-none focus:outline-none"/>
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => setOpenApprove(false)} 
              className="h-[42px] px-6 border border-gray-300 rounded-[6px] text-gray-700">
              Cancel
            </button>
            <button className="h-[44px] px-8 rounded-md shadow btn-theme"> Submit </button>
          </div>
        </div>
      </div>
      <div
        className={`fixed top-0 right-0 h-full w-[720px] bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${openEvaluation ? "translate-x-0" : "translate-x-full"}
        `}>
        <div className="relative px-6 py-4 border-b border-gray-200">
          <h2 className="text-[16px] font-semibold text-gray-900">
            Level 2 - All Business Jury Overview
          </h2>
          <button
            onClick={() => setOpenEvaluation(false)}
            className="absolute right-6 top-4">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-6 overflow-y-auto h-[calc(100vh-70px)]">
          <div className="border border-gray-300 rounded-lg p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full themeColor flex items-center justify-center text-white">
                  <User size={18} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Senthil Nanthan
                  </p>
                  <p className="text-sm text-gray-500">
                    Submitted: Jan 18, 2026
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-red-600 text-lg">
                <Flag size={24} className="text-red-600 fill-red-600"/>
                </div>
                <div className="border border-gray-300 bg-green-50 text-green-700 px-4 py-2 rounded-md text-center min-w-[70px]">
                  <div className="text-lg font-semibold">260</div>
                  <div className="text-xs">Score</div>
                </div>
              </div>
            </div>
            <div className="border border-gray-300 rounded-md overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 border-b border-gray-300"></th>
                    <th className="text-left px-4 py-2 border-b border-gray-300">
                      Score
                    </th>
                    <th className="text-left px-4 py-2 border-b border-gray-300">
                      Comments
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Integrity", score: 70 },
                    { label: "Idea", score: 50 },
                    { label: "Effors", score: 60 },
                    { label: "OutComes", score: 80 },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-gray-200 last:border-b-0">
                      <td className="px-4 py-3 font-medium">
                        {row.label}
                      </td>
                      <td className="px-4 py-3">
                        {row.score}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        Demonstrates exceptional leadership qualities
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-2 text-sm mb-3">
              <Flag size={18} className="text-red-400"/>
              <span className="font-medium">Flagged :</span>
              <input
                type="checkbox" checked className="w-4 h-4 accent-red-600"/>
            </div>
            <div className="border border-gray-300 bg-red-50 rounded-md px-4 py-3 text-sm">
              Missing one documents
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setOpenEvaluation(false)}
              className="px-6 py-2 border border-gray-300 rounded-md">
              Cancel
            </button>
          </div>
        </div>
      </div>
      <div
      className={`fixed top-0 right-0 h-full w-[650px] bg-white z-50 shadow-xl
       transform transition-transform duration-500 ease-in-out
        ${openScore ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">
          Level 2 - Business Jury
        </h2>
        <X
          className="cursor-pointer text-gray-600"
          onClick={() => setOpenScore(false)}/>
      </div>
      <div className="px-6 py-6 space-y-6 text-sm">
        {[
          { title: "Integrity", score: 70 },
          { title: "Idea", score: 50 },
          { title: "Efforts", score: 60 },
          { title: "Outcome", score: 80 },
        ].map((item, i) => (
          <div key={i}>
            <div className="flex items-center gap-6 mb-2">
              <div className="flex items-center gap-1 font-medium">
                {item.title}
                <span className="text-gray-400 text-xs">ⓘ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Score</span>
                <input type="number" min={1} max={100}
                  defaultValue={item.score}
                  className="w-[90px] h-[36px] px-3 border border-gray-300 rounded-md text-sm outline-none"/>
              </div>
            </div>
            {item.title !== "Outcome" && (
              <div>
                <label className="block text-gray-500 text-sm mb-1">
                  Comments
                </label>
                <textarea
                  rows={3}
                  defaultValue="Maintained a high level of discipline in the environment with consistently excellent hygiene habits. This approach contributed to a clean, safe, and well-organized workplace."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none outline-none" />
              </div>
            )}
          </div>
        ))}
        <div className="flex justify-end gap-3 pt-6">
           <button
              onClick={() => setOpenScore(false)} 
              className="h-[42px] px-6 border border-gray-300 rounded-[6px] text-gray-700">
              Cancel
            </button>
            <button className="h-[44px] px-8 rounded-md shadow btn-theme"> Submit </button>
        </div>
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
      {popupType && (
  <div className="fixed inset-0 bg-black/30 z-50">

    <div className="fixed right-0 top-0 h-full w-[480px]
      bg-white shadow-xl animate-slideIn">

      <div className="flex justify-between items-center
        p-5 border-b">

        <h2 className="font-semibold text-lg capitalize">
          {popupType.replace("-", " ")}
        </h2>

        <X className="cursor-pointer" onClick={closePopup} />
      </div>

      <div className="p-6 overflow-y-auto h-full">
{popupType === "approve" && (
  <>
    <label>Status</label>
    <select className="w-full border p-2 rounded mb-4">
      <option>Approved</option>
      <option>Rejected</option>
    </select>

    <label>Comments</label>
    <textarea
      className="w-full border p-2 rounded mb-4"
      rows={4}
    />

    <label className="flex gap-2 items-center mb-2">
      <input type="checkbox" /> Flag
    </label>

    <textarea
      placeholder="Flag reason"
      className="w-full border p-2 rounded bg-red-50"
    />

    <div className="flex justify-end gap-3 mt-6">
      <button onClick={closePopup}>Cancel</button>
      <button className="bg-green-600 text-white px-6 py-2 rounded">
        Submit
      </button>
    </div>
  </>
)}
{popupType === "score" && (
  <>
    {["Integrity", "Idea", "Efforts", "Outcome"].map(item => (
      <div key={item} className="mb-4">
        <p className="font-medium">{item}</p>
        <input
          type="number"
          className="border w-full p-2 rounded mb-2"
        />
        <textarea
          placeholder="Comments"
          className="border w-full p-2 rounded"
        />
      </div>
    ))}

    <div className="flex justify-end mt-6">
      <button
        onClick={closePopup}
        className="bg-green-600 text-white px-6 py-2 rounded"
      >
        Submit Score
      </button>
    </div>
  </>
)}
{popupType === "evaluation" && (
  <>
    <table className="w-full border text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2">Criteria</th>
          <th>Score</th>
          <th>Comments</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Integrity</td><td>70</td><td>Leadership skills</td></tr>
        <tr><td>Idea</td><td>50</td><td>Creative ideas</td></tr>
        <tr><td>Efforts</td><td>60</td><td>Good effort</td></tr>
        <tr><td>Outcome</td><td>80</td><td>Excellent result</td></tr>
      </tbody>
    </table>

    <div className="mt-4 p-3 border border-red-300 bg-red-50 rounded">
      🚩 Missing one document
    </div>
  </>
)}
      </div>
    </div>
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
         {flagOpen && (
  <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
    <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6">

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-red-600">
          🚩 Flag Nomination
        </h3>
        <button onClick={() => setFlagOpen(false)}>
          <X />
        </button>
      </div>

<div className="mb-4">
  <label className="text-sm font-medium">
    Reason <span className="text-red-500">*</span>
  </label>

  <textarea
    rows={3}
    value={flagReason}
    onChange={(e) => setFlagReason(e.target.value)}
    className="w-full mt-1 p-2 border rounded text-sm"
    placeholder="Enter reason..."
  />
</div>

<div className="mb-4">
  <label className="text-sm font-medium">
    Upload Supporting Documents
  </label>

  <input
    type="file"
    multiple
    onChange={handleFlagFileChange}
    className="w-full mt-1 border p-2 rounded text-sm"
  />
</div>

{flagFiles.length > 0 && (
  <div className="mt-2 space-y-1 text-sm text-gray-700">
    {flagFiles.map((file, index) => (
      <div key={index} className="flex items-center gap-2">
        📄 {file.name}
      </div>
    ))}
  </div>
)}

{flagError && (
  <p className="text-red-600 text-sm mt-2">{flagError}</p>
)}

<div className="flex justify-end gap-3 mt-6">
  <button
    className="px-4 py-2 bg-gray-200 rounded"
    onClick={() => setFlagOpen(false)}
  >
    Cancel
  </button>

  <button
    onClick={submitFlagWithAttachment}
    className="px-4 py-2 btn-theme-reject"
  >
    Submit Flag
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
 
export default BusinessJuryDetail;