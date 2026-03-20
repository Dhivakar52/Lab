import * as Label from "@radix-ui/react-label";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Edit, X, ArrowLeft } from "lucide-react";
import { useAuth } from "../ContextAPI/AuthContext";
import * as Dialog from "@radix-ui/react-dialog";
import { useLocation } from "react-router-dom";
//import Swal from "sweetalert2";
import { motion } from 'framer-motion';
import { Flag ,User, Building2, Tag, 
  CalendarDays, FileText, Mail, BadgeCheck, Check } from "lucide-react";
import type { FormState } from "../../dataTypes/nomination";
import { levelColors, levelTextColors } from "../../statusColors.ts";

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
type PopupErrors = {
  score: Record<number, string>;
  comment: Record<number, string>;
  comments: string;
  flagComment: string;
};
type ScoreItem = {
  weightId: number;
  title: string;
  score: number | "";
  comment: string;
};
type JuryAttribute = {
  AttributeName: string;
  Score: number;
  Comments?: string;
};
type JuryItem = {
  Juryname: string;
  SubmittedDate: string;
  Score: number;
  Flag: number;
  Attributes: JuryAttribute[];
  FlagReason: string;
};
interface ApprovalItem {
  ApprovalFlow: string;
  ApprovalType: string;
  ApprovalName: string;
  Status: string;
  ApprovalComments: string;
  ApprovedAt: string;
  ApprovalScore: number;
  Flagdetails?: string;
  EvaluatedJuries?: number;
  TotalEvalutions?: number;
  TotalFlagCount?: number;
  JuryMember?: string;
}
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
  //const [documents, setDocuments] = useState<DocumentItem[]>([]);
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
  const DEFAULT_SCORE_ITEMS: ScoreItem[] = [
  { weightId: 1, title: "Integrity", score: "", comment: "" },
  { weightId: 2, title: "Idea", score: "", comment: "" },
  { weightId: 3, title: "Efforts", score: "", comment: "" },
  { weightId: 4, title: "Outcome", score: "", comment: "" }
];
  const [scores, setScores] = useState<ScoreItem[]>(DEFAULT_SCORE_ITEMS);
  // const [popupErrors, setPopupErrors] = useState<PopupErrors>({scores: {}, comments: "", flagComment: ""});
 const [popupErrors, setPopupErrors] = useState<PopupErrors>({
  score: {},
  comment: {},
  comments: "",
  flagComment: ""
});
  // const [popupErrors, setPopupErrors] = useState({ score: {}, comments: "" ,flagComment: ""});
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [IsSelf, setIsSelf] = useState<boolean | null>(null);
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagOpen1, setFlagOpen1] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagFiles, setFlagFiles] = useState<File[]>([]);
  const [flagPreview, setFlagPreview] = useState<string | null>(null);
  const [flagError, setFlagError] = useState("");
  //home module//
  const [openApprove, setOpenApprove] = useState(false);
  const [openEvaluation, setOpenEvaluation] = useState(false);
  const [openScore, setOpenScore] = useState(false);
    const [popupType, setPopupType] = useState<
    "approve" | "score" | "evaluation" | null
  >(null);
  const [openCard, setOpenCard] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileError, setFileError] = useState("");
  const [existingDocs, setExistingDocs] = useState<any[]>([]);
  const [isFlagged, setIsFlagged] = useState(false);
  const [flagComment, setFlagComment] = useState("");
  const [status, setStatus] = useState<"Approved" | "Rejected">("Approved");
  const [evaluationData, setEvaluationData] = useState<any>(null);
  //const [scores, setScores] = useState<any[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [activeLevel, setActiveLevel] = useState<"Level-2" | "Level-3" | null>(null);
  const closePopup = () => setPopupType(null);
  const [form, setForm] = useState<FormState>({
      title: "",
      nomineeName:"",
      department: "",
      email: "",
      nomineeData:"",
      mobile: "",
      managerEmail: "",
      contestType: "",
      description: "",
      files: [], 
      file: null as File | null,
    });

  useEffect(() => {
      if (isFlagged) {
        textareaRef.current?.focus();
      }
    }, [isFlagged]);
    
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
      debugger;
      const res = await axios.get(
      // `${apiUrl}/api/nominations/${nominationId}`,
    `${apiUrl}/api/jurylevelnomination/${nominationId}/${userId}`, 
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    debugger;
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
const openPreview = (file: Blob, ext: string) => {
  const blobUrl = URL.createObjectURL(file);
  setPreviewType(ext);
  setPreviewFile(blobUrl);
  setPreviewOpen(true);
};
const allDocuments = [
  ...existingDocs
    .filter(doc => !doc.isDeleted)
    .map(doc => ({
      source: "api",
      originalFileName: doc.originalFileName,
      fileNameGUID: doc.fileNameGUID,
    })),

  ...form.files.map(file => ({
    source: "local",
    originalFileName: file.name,
    file,
  })),
];
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
const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFiles = Array.from(e.target.files || []);
  setFileError("");
  if (!selectedFiles.length) return;
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
    for (const file of selectedFiles) {

    const isDuplicate = form.files.some(
      (f) => f.name === file.name && f.size === file.size
    );

    if (isDuplicate) {
      setFileError(`"${file.name}" already added.`);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFileError(`"${file.name}" exceeds 2 MB limit.`);
      return;
    }
  }

  if (form.files.length + selectedFiles.length > 5) {
    setFileError("Maximum 5 files allowed.");
    return;
  }

  // Add the files
  setForm((prev) => ({
    ...prev,
    files: [...prev.files, ...selectedFiles],
  }));
};

const uploadFilesToServer = async (files: File[]) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const res = await axios.post(`${apiUrl}/api/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${authToken}`,
    },
  });

  return res.data; // backend returns uploaded file info
};
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
 
 
const levelOrder = [
  // "Referral",
  "Manager",
  "Business Jury",
  "Grand Jury",
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
      return "Grand Jury";
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
  const validatePopup = () => {
    const errs = {
      score: {},
      comments: "",
      flagComment: ""
    };

    let ok = true;
  //   scores.forEach((item, i) => {
  //   if (!item.score && item.score !== 0) {
  //     errs.scores[i] = "Score required";
  //     ok = false;
  //   } else if (item.score < 1 || item.score > 100) {
  //     errs.scores[i] = "Score must be 1–100";
  //     ok = false;
  //   }
  //   if (!item.comment?.trim()) {
  //     errs.scores[i] = "Comment required";
  //     ok = false;
  //   }
  // });
    if (!popupComments?.trim()) {
      errs.comments = "Comments are required!";
      ok = false;
    } else if (popupComments.trim().length > 500) {
      errs.comments = "Comments cannot exceed 500 characters!";
      ok = false;
    }
    if (isFlagged && !flagComment?.trim()) {
      errs.flagComment = "Flag reason required";
      ok = false;
    }

    //setPopupErrors(errs);
    return ok;
  };
  const validateEvaluation = (mode: "manager" | "jury") => {
  const errs: PopupErrors = {
    score: {},
    comment: {},
    comments: "",
    flagComment: ""
  };

  let ok = true;

  if (mode === "jury") {
    scores.forEach((item, i) => {
      if (item.score === "" || item.score === null) {
        errs.score[i] = "Score required";
        ok = false;
      } 
      else if (Number(item.score) < 1 || Number(item.score) > 100) {
        errs.score[i] = "Score must be 1–100";
        ok = false;
      }

      if (!item.comment?.trim()) {
        errs.comment[i] = "Comment required";
        ok = false;
      }
    });
  }

  if (mode === "manager") {
    if (!popupComments?.trim()) {
      errs.comments = "Comments are required!";
      ok = false;
    }
    else if (popupComments.trim().length > 500) {
      errs.comments = "Max 500 characters allowed";
      ok = false;
    }
  }

  if (isFlagged && !flagComment.trim()) {
    errs.flagComment = "Flag reason required";
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
  "Grand Jury",
];

const handleEdit = () => {
  const id = location.pathname.split("/").pop();  
  if (IsSelf) {
      navigate(`/self-nominations/${id}`);
    } else {
      navigate(`/my-nominations/add-nomination/${id}`);
    }  
};
// const approvalData = approvalResponse.ApprovalStatus;
const approvalData = data?.ApprovalStatus || [];
const level1 = approvalData?.find((l: ApprovalItem) => l.ApprovalFlow === "Level-1");
const level2 = approvalData?.find((l: ApprovalItem) => l.ApprovalFlow === "Level-2");
const level3 = approvalData?.find((l: ApprovalItem) => l.ApprovalFlow === "Level-3");

const showLevel2 = level1?.Status === "Approved";
const showLevel3 = level2?.Status === "Approved";
const flagDetails = level1?.Flagdetails
  ? JSON.parse(level1.Flagdetails)
  : [];

const flagData = flagDetails?.[0]; 
const selectedLevel =
  activeLevel === "Level-2"
    ? level2
    : activeLevel === "Level-3"
    ? level3
    : null;
const getBusinessJuryEvaluations = () => {
  const bj = approvalData.find(
    (a: any) => a.ApprovalType === "Business Jury"
  );

  if (!bj || !bj.JuryMember) return [];

  try {
    return JSON.parse(bj.JuryMember);
  } catch {
    return [];
  }
};
const attributeData = level2;
debugger;
const handleManagerApprove = () => {
  if (!level1) return;

  setStatus(level1.Status === "Rejected" ? "Rejected" : "Approved");
  setPopupComments(level1.ApprovalComments || "");

  let flagData = null;
  try {
    const parsed = level1.Flagdetails ? JSON.parse(level1.Flagdetails) : [];
    flagData = parsed?.[0];
  } catch {
    flagData = null;
  }
  const isFlag = Number(flagData?.Flag) === 1;
  setIsFlagged(isFlag);

  setFlagComment(flagData?.FlagReason || "");

  if (flagData?.FlagAttachment?.length) {
    const mappedDocs = flagData.FlagAttachment.map((file: any) => ({
      source: "api",
      fileNameGUID: file.AttachmentsID,
      originalFileName: file.OriginalAttachmentName,
      fileType: file.AttachmentFileType
    }));

    setExistingDocs(mappedDocs);
  } else {
    setExistingDocs([]);
  }
  setOpenApprove(true);
};
const juryList: JuryItem[] = getBusinessJuryEvaluations().map((j: any) => ({
  Juryname: j.JuryMemberName,
  SubmittedDate: "-",
  Score: j.AttributeAvg?.[0]?.TotalScore || 0,
  Flag: j.FlagDetails?.length > 0 ? 1 : 0,
  Attributes: j.AttributeScore || [],
  FlagReason: j.FlagDetails?.[0]?.FlagReason || ""
}));
const needsScore = (type: string) =>
  SCORE_REQUIRED_TYPES.includes(type);

const buildManagerPayload = () => ({
  NominationID: data.NominationID,
  IsManagerApproved: status?.trim() === "Approved" ? true : false,
  ApprovalComments: popupComments,
  UpdatedBy: userId,
  IsFlag: isFlagged,
  FlagReason: isFlagged ? flagComment : null,

});

const submitManagerApproval = async () => {
  console.log("CLICKED SUBMIT");
if (!validateEvaluation("manager")) return;
  // const isValid = validatePopup();
  // console.log("VALID ?", isValid);

  // if (loading || !isValid) return;

  const payload = buildManagerPayload();
  console.log("PAYLOAD 👉", payload);

  try {
    setLoading(true);

    await axios.put(
      `${apiUrl}/api/evaluation/0/${data.NominationID}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    setSuccessModalOpen(true);
    setOpenApprove(false);
    closeApproveDrawer();
  } catch (err) {
    console.error("❌ SAVE ERROR:", err);
    setErrorMessage("Action failed. Please try again.");
  } finally {
    setLoading(false);
  }
};
const getCleanStatus = (status?: string) => {
  if (!status) return "";
  const dashIndex = status.indexOf("-");
  return dashIndex >= 0
    ? status.substring(dashIndex + 1).trim()
    : status.trim();
};
const mainStatus = getCleanStatus(data.Status);

const resetApproveDrawer = () => {
  setScores(structuredClone(DEFAULT_SCORE_ITEMS));
  setPopupComments("");
  setIsFlagged(false);
  setFlagComment("");
  setExistingDocs([]);
  setPopupErrors({
    score: {},
    comment:{},
    comments: "",
    flagComment: ""
  });
};

const closeApproveDrawer = () => {
  resetApproveDrawer();
  setOpenApprove(false);
};
const openDrawer = () => {
  setScores(JSON.parse(JSON.stringify(DEFAULT_SCORE_ITEMS)));
  setIsFlagged(false);
  setFlagComment("");
  //setPopupErrors({});
  setOpenScore(true);
};

const openEvaluationDrawer = (row: any) => {
  setEvaluationData(row);

  if (row.scores) {
    const parsed = typeof row.scores === "string" ? JSON.parse(row.scores) : row.scores;

    const mapped = parsed.map((s: any) => ({
      weightId: s.WeightID,
      title: s.WeightName,
      score: s.Score,
      comment: s.Comment || ""
    }));

    setScores(mapped);
  }

  setIsFlagged(row.normaljuryflag === "1");
  setFlagComment(row.normaljuryflagreason || "");

  setExistingDocs(row.supportingDocuments || []);
  setOpenScore(true);
};
const buildDocumentPayload = () => {
  return [
    ...existingDocs.map(d => ({
      fileNameGUID: d.fileNameGUID,
      isDeleted: d.isDeleted || false,
      isNew: false
    })),
    ...form.files.map(f => ({
      file: f,
      isNew: true
    }))
  ];
};
const handleCloseDrawer = () => {
  setOpenScore(false);
  resetApproveDrawer();
};
const handleSubmitEvaluation = async () => {
  if (!validateEvaluation("jury")) return;

  const payload = {
    NominationID: data.NominationID,
    UpdatedBy: userId,
    IsFlag: isFlagged,
    FlagReason: flagComment,
    Scores: scores.map(s => ({
      Criteria: s.title,     
      Score: Number(s.score),
      Comments: s.comment
    })),

    Documents: buildDocumentPayload()
  };

  await axios.put(
    `${apiUrl}/api/evaluation/${data.NominationID}`,
    payload,
    { headers: { Authorization: `Bearer ${authToken}` } }
  );

  handleCloseDrawer();
};

return (
 <div className="bg-gray-100 p-6 pb-20">
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
    <div className="flex gap-6 items-start w-full">
     <div className="flex flex-col items-start gap-3">
      {/* <button onClick={handleBackward}
        className="flex items-center text-blue-600 bg-white border rounded-sm px-2 py-1 font-medium">
        <ArrowLeft size={14} />
        <span className="ml-1">Back</span>
      </button> */}
      <div
        className="w-24 h-24 mt-2 rounded-full border-4 border-emerald-500
                  flex items-center justify-center text-white font-bold text-5xl"
        style={{
          background:
            "linear-gradient(90deg, rgb(8, 128, 94) 16%, rgb(24, 97, 174) 100%)",}}>
        {data.Nominee?.charAt(0).toUpperCase()}
    </div>
  </div>
  <div className="flex-1">
    <div className="flex justify-between items-start mb-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Nomination Details
      </h2>
      <div className="text-sm text-gray-600">
        DOJ & Age in SRM :
        <span className="ml-1 text-blue-600 font-medium">{data.DOJ}
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
          <FileText size={16} className="text-gray-400 mr-2" />{data.ContestType}
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
              : mainStatus === "Approved"
              ? "bg-green-100 text-green-800 border-green-300"
              : mainStatus === "Rejected"
              ? "bg-red-100 text-red-800 border-red-300"
              : mainStatus === "Under Review"
              ? "bg-yellow-100 text-yellow-800 border-yellow-300"
              : "bg-gray-100 text-gray-700 border-gray-300"
          }`}>
          {<BadgeCheck size={14} />}
          {/* {data.Status === "Under Review" && <BadgeCheck size={14} />} */}
          {data.Status}
        </span>
      </div>
       <div>
        <p className="text-gray-500">Manager Email Id</p>
        <div className="flex items-center font-medium">
          <Mail size={16} className="text-gray-400 mr-2" />{data.ManagerEmail}
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
        Supportings Documents
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
          <th className="px-4 py-3 text-left">Email ID</th>
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
            <td className="px-4 py-3">{ref.Email}</td>
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
      {/* ================= LEVEL 1 ================= */}
      {level1 && (
        <div className="flex gap-4 relative">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
              <Check size={16} className="text-white" />
            </div>
            <div className="w-[2px] h-full bg-gray-300 mt-1"></div>
          </div>
          <div className="flex-1 pb-8">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium text-gray-900">
                {approvalData[0].ApprovalFlow} - {approvalData[0].ApprovalType}
              </p>
              <button
                // onClick={() => setOpenApprove(true)}
                onClick={handleManagerApprove}
                className="px-4 py-1.5 rounded-lg text-sm bg-green-100 text-green-700 hover:bg-green-200 transition">
                {level1.Status}
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
              <div className="flex gap-12">
                <div>
                  <span className="text-gray-500">Name :</span>{" "}
                  <span className="font-medium">
                    {approvalData[0].ApprovalName} ({approvalData[0].ApprovalDepartment})
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Approved Date :</span>{" "}
                  <span className="font-medium">{approvalData[0].ApprovedAt}</span>
                </div>
                {Number(flagData?.Flag) === 1 && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500">Flag :</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <Flag size={16} className="text-red-600 fill-red-600" />
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Reason :</span>{" "}
                  <span className="font-medium text-gray-600">
                  {flagData?.FlagReason || "No reason"}
                  </span>
                </div>
                <div>
                </div>
              </div>
              <div>
                <span className="text-gray-500">Comments :</span>
                <p className="font-medium mt-1">
                  {approvalData[0].ApprovalComments}
                </p>
              </div>
              {/* Attachments */}
              {Number(flagData?.Flag) === 1 &&
                flagData?.FlagAttachment?.length > 0 && (
                  <div className="mt-3">
                    <span className="text-gray-500">Attachments :</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {flagData.FlagAttachment.map((file: any, i: number) => (
                        <div
                          key={i}
                          className="text-blue-600 text-sm underline cursor-pointer">
                          {file.OriginalAttachmentName}.{file.AttachmentFileType}
                        </div>
                      ))}
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ================= LEVEL 2 ================= */}
      {showLevel2 && level2 && (
        <div className="flex gap-4 relative">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
              <Check size={16} className="text-white" />
            </div>
            <div className="w-[2px] h-full bg-gray-300 mt-1"></div>
          </div>
          <div className="flex-1 pb-8">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium text-gray-900">
                {approvalData[1].ApprovalFlow} - {approvalData[1].ApprovalType}
              </p>
              <div className="flex gap-3">
                {approvalData[1].Status === "Approved" && (
                  <button
                    onClick={() => setOpenEvaluation(true)}
                    className="px-4 py-1.5 rounded-lg border border-blue-500 text-blue-600 text-sm hover:bg-blue-50">
                    View Business Jury Evaluations
                  </button>
                )}
                <button
                  // onClick={() => setOpenScore(true)}
                  onClick={() => {
                    setActiveLevel("Level-2");
                    setOpenScore(true);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-sm border 
                  ${levelColors[approvalData[1].Status] || "bg-gray-50 border-gray-300"} 
                  ${levelTextColors[approvalData[1].Status] || "text-gray-700"}`}>
                  {approvalData[1].Status}
                </button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
              <div className="flex gap-12">
                <div>
                  <span className="text-gray-500">Name :</span>{" "}
                  <span className="font-medium">
                    {approvalData[1].ApprovalName} ({approvalData[1].ApprovalDepartment})
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Approved Date :</span>{" "}
                  <span className="font-medium">{approvalData[1].ApprovedAt}</span>
                </div>
                <div>
                  <span className="text-gray-500">Total Jury Evaluations :</span>{" "}
                  <span className="font-medium">
                    {approvalData[1].TotalEvalutions}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Evaluated Juries :</span>{" "}
                  <span className="font-medium">
                    {approvalData[1].EvaluatedJuries}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Average Score :</span>{" "}
                  <span className="font-medium">
                    {approvalData[1].AverageScore}
                  </span>
                </div>
                 <div>
                  <span className="text-gray-500">Total Flag :</span>{" "}
                  <span className="font-medium">
                    {approvalData[1].TotalFlagCount}
                  </span>
                </div>
              </div>
              <div className="flex gap-12">
                <div>
                  <span className="text-gray-500">Score :</span>{" "}
                  <span className="font-medium">{approvalData[1].ApprovalScore}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-500">Comments :</span>
                <p className="font-medium mt-1 leading-relaxed">
                  {approvalData[1].ApprovalComments}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ================= LEVEL 3 ================= */}
      {showLevel3 && level3 && (
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
              <Check size={16} className="text-white" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium text-gray-900">
                {approvalData[2].ApprovalFlow} - {approvalData[2].ApprovalType}
              </p>
              <button
                // onClick={() => setOpenScore(true)}
                onClick={() => {
                  setActiveLevel("Level-3");
                  setOpenScore(true);
                }}
                className={`px-4 py-1.5 rounded-lg text-sm border 
                  ${levelColors[approvalData[2].Status] || "bg-gray-50 border-gray-300"} 
                  ${levelTextColors[approvalData[2].Status] || "text-gray-700"}`}>
                {approvalData[2].Status}
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
              <div className="flex gap-12">
                <div>
                  <span className="text-gray-500">Name :</span>{" "}
                  <span className="font-medium">
                    {approvalData[2].ApprovalName} ({approvalData[2].ApprovalDepartment})
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Approved Date :</span>{" "}
                  <span className="font-medium">{approvalData[2].ApprovedAt}</span>
                </div>
                <div>
                  <span className="text-gray-500">Score :</span>{" "}
                  <span className="font-medium">{approvalData[2].ApprovalScore}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-500">Comments :</span>
                <p className="font-medium mt-1 leading-relaxed">
                  {approvalData[2].ApprovalComments}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    <div className="fixed bottom-0 left-0 w-full h-15 bg-white border-t border-gray-200 flex items-center pl-[260px] pr-6">
      <div className="flex justify-end space-x-4 ml-auto" >  
         <button onClick={handleBackward} className="flex items-center text-blue-600 bg-white border rounded-sm px-2 py-1 font-medium">
         <span className=""><ArrowLeft size={14}/></span> Back
          </button>
          {showWithdrawButton && ( 
          <button
          onClick={handleEdit}
          className="btn-theme-edit text-white rounded-sm px-2 py-1 hover:bg-blue-700 flex items-center"> 
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
        </div>
    </div>
      <div className={`fixed top-0 right-0 h-full w-[680px] bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${openApprove ? "translate-x-0" : "translate-x-full"}
        `}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-[16px] font-semibold text-gray-900">
            Level 1 - Manager Approval
          </h2>
          <button onClick={closeApproveDrawer}>
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-6 text-sm text-gray-800">
          <div className="mb-[18px]">
            <label className="block mb-2 font-medium">
              Status
            </label>
            <select value={status}
              onChange={(e) => setStatus(e.target.value as "Approved" | "Rejected")}
              className="w-full h-[42px] px-3 border border-gray-300 rounded-[6px]">
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            {/* <select
              className="w-full h-[42px] px-3 border border-gray-300 rounded-[6px] bg-white focus:outline-none ">
              <option>Approved</option>
              <option>Rejected</option>
            </select> */}
          </div>
          <div className="mb-[18px]">
            <label className="block mb-2 font-medium">
              Comments
            </label>
            <textarea rows={3} value={popupComments}
              onChange={(e) => {
                const value = e.target.value;
                setPopupComments(value);
                if (value.trim()) {
                  setPopupErrors(prev => ({
                    ...prev,
                    comments: ""
                  }));
                }
              }}
              placeholder="Enter your comments"
              className={`w-full px-3 py-2 border rounded-[6px]
                ${popupErrors.comments ? "border-red-500" : "border-gray-300"}`}/>
            {popupErrors.comments && (
              <p className="text-red-600 text-xs mt-1">{popupErrors.comments}</p>
            )}

            {/* <textarea rows={3} placeholder="Enter your comments"
              className="w-full px-3 py-2 border border-gray-300 rounded-[6px] resize-none focus:outline-none"/> */}
          </div>
          <div className="flex items-center gap-2 mb-[12px]">
            <Flag size={18} className={isFlagged ? "text-red-600" : "text-gray-400"}/>
            <span className="font-medium">Flag :</span>
            <input type="checkbox" checked={isFlagged}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsFlagged(checked);
                if (checked) {
                  setTimeout(() => textareaRef.current?.focus(), 100);
                } else {
                  setFlagComment("");
                  setPopupErrors(prev => ({ ...prev, flagComment: "" }));
                }
              }}
              className="w-4 h-4 mt-[1px] accent-red-600 cursor-pointer"/>
          </div>
            <textarea ref={textareaRef} rows={3} value={flagComment}
              onChange={(e) => {
                const value = e.target.value;
                setFlagComment(value);
                if (value.trim()) {
                  setPopupErrors(prev => ({ ...prev, flagComment: "" }));
                }
              }}
              disabled={!isFlagged}
              placeholder="Flagged reason here"
              className={`w-full px-3 py-2 rounded-[6px]
                ${isFlagged
                  ? "border border-red-300 bg-red-50"
                  : "border border-gray-200 bg-gray-100 cursor-not-allowed"}`}/>
            {popupErrors.flagComment && (
              <p className="text-red-600 text-xs mt-1">
                {popupErrors.flagComment}
              </p>
            )}

          <div className="mt-4">
              <Label.Root className="block text-sm font-medium">
                Supporting Documents 
                <span className="text-red-500">(Maximum 5 files allowed & File must be below 2 MB)</span>
              </Label.Root>
              <label
                htmlFor="fileUpload"
                className="inline-block bg-gray-100 text-gray-700 border border-gray-300 px-6 py-2 rounded cursor-pointer mt-2 hover:bg-gray-200">
                Choose File
              </label>
              <input
                id="fileUpload"
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden" />
              {fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}
            </div>         
          <div className="mt-3 flex flex-wrap gap-2">
              {allDocuments.map((doc: any, index: number) => (
                <div
                  key={doc.source === "api" ? doc.fileNameGUID : index}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg shadow-sm border relative">
                  {/* File Name */}
                  <span
                    className="text-sm truncate max-w-[180px] cursor-pointer text-blue-600 hover:underline"
                    onClick={async () => {
                      const fileName = doc.originalFileName;
                      const ext = fileName.split(".").pop()?.toLowerCase() || "";

                      if (doc.source === "api") {
                        try {
                          const response = await axios.get(
                            `${apiUrl}/api/download?fileName=${doc.fileNameGUID}`,
                            {
                              responseType: "blob",
                              headers: { Authorization: `Bearer ${authToken}` },
                            }
                          );
                          const blobUrl = URL.createObjectURL(response.data);
                          if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
                            openPreview(response.data, ext);
                          } 
                          else if (ext === "pdf") {
                            const pdfBlob = new Blob([response.data], { type: "application/pdf" });
                            const pdfUrl = URL.createObjectURL(pdfBlob);
                            window.open(pdfUrl, "_blank");
                          }
                          // else if (ext === "pdf") {
                          //   window.open(blobUrl, "_blank");  
                          // }
                          else {
                            const link = document.createElement("a");
                            link.href = URL.createObjectURL(response.data);
                            link.download = fileName;
                            link.click();
                          }
                        } catch {
                          alert("File not found");
                        }
                      }

                      else {
                        const file = doc.file;
                        if (!(file instanceof File)) return;

                        if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
                          openPreview(file, ext);
                        } 
                         else if (ext === "pdf") {
                          const pdfBlob = new Blob([file], { type: "application/pdf" });
                          const pdfUrl = URL.createObjectURL(pdfBlob);
                          window.open(pdfUrl, "_blank");    
                          }
                          else {
                          const link = document.createElement("a");
                          link.href = URL.createObjectURL(file);
                          link.download = file.name;
                          link.click();
                        }
                      }
                    }}>
                    {doc.originalFileName || doc.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (doc.source === "api") {
                        setExistingDocs(prev => prev.map(d => d.fileNameGUID === doc.fileNameGUID ? { ...d, isDeleted: true } : d));
                      } else {
                        setForm(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
                      }
                    }}
                    className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">
                    ×
                  </button>
                </div>
              ))}
            </div>           
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={closeApproveDrawer} 
              className="h-[42px] px-6 border border-gray-300 rounded-[6px] text-gray-700">
              Cancel
            </button>
            <button onClick={submitManagerApproval}
              className="h-[44px] px-8 rounded-md shadow btn-theme">Submit
            </button>
          </div>
        </div>
      </div>
     <div
      className={`fixed top-0 right-0 h-full w-[720px] bg-white shadow-2xl z-50
      transform transition-transform duration-300
      ${openEvaluation ? "translate-x-0" : "translate-x-full"}`}>
      <div className="relative px-6 py-4 border-b border-gray-300">
        <h2 className="text-[16px] font-semibold text-gray-900">
          Level 2 - All Business Jury Overview
        </h2>
        <button
         onClick={() => {
          setOpenEvaluation(false);
          setOpenCard(null); 
        }}
          className="absolute right-6 top-4">
          <X size={20} />
        </button>
      </div>
      <div className="px-6 py-6 space-y-4 overflow-y-auto h-[calc(100vh-70px)]">
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-gray-300 rounded-lg p-4 text-center bg-green-50 text-green-700">
            <div className="text-xl font-semibold">
              {attributeData?.TotalEvalutions || 0}
            </div>
            <div className="text-sm">Total Evaluations</div>
          </div>
          <div className="border border-gray-300 rounded-lg p-4 text-center bg-blue-50 text-blue-700">
            <div className="text-xl font-semibold">
              {attributeData?.AverageScore || 0}
            </div>
            <div className="text-sm">Average Score</div>
          </div>
          <div className="border border-gray-300 rounded-lg p-4 text-center bg-red-50 text-red-700">
            <div className="text-xl font-semibold">
              {attributeData?.TotalFlagCount || 0}
            </div>
            <div className="text-sm">Flagged</div>
          </div>
        </div>
        {juryList.map((e: any, index: number) => {
          const expanded = openCard === index;
          return (
            <div
             key={index}
             onClick={() => setOpenCard(prev => (prev === index ? null : index))}
              className="border border-gray-300 rounded-lg cursor-pointer">
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full themeColor flex items-center justify-center text-white">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{e.Juryname}</p>
                    <p className="text-sm text-gray-500">
                      Submitted: {e.SubmittedDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {e.Flag == 1 && (
                    <Flag size={22} className="text-red-600 fill-red-600" />
                  )}
                  <div className="border border-gray-300 bg-green-50 text-green-700 px-4 py-2 rounded-md text-center min-w-[70px]">
                    <div className="text-lg font-semibold">
                      {e.Score}
                    </div>
                    <div className="text-xs">Score</div>
                  </div>
                </div>
              </div>
              {expanded && (
                <div className="px-4 pb-4">
                  <div className="border border-gray-300 rounded-md overflow-hidden mt-2">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left"></th>
                          <th className="px-4 py-2 text-left">Score</th>
                          <th className="px-4 py-2 text-left">Comments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {e.Attributes?.map((s: any, i: number) => (
                          <tr
                            key={i}
                            className="border-t border-gray-300">
                            <td className="px-4 py-2 font-medium">
                              {s.AttributeName}
                            </td>
                            <td className="px-4 py-2">{s.Score}</td>
                            <td className="px-4 py-2 text-gray-600">
                               {s.Comments || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {e.Flag === 1 && (
                    <>
                      <div className="flex items-center gap-2 mt-3 text-sm">
                        <Flag size={16} className="text-red-600" />
                        <span className="font-medium">Flagged :</span>
                        <input
                          type="checkbox"
                          checked
                          readOnly
                          className="w-4 h-4 accent-red-600"/>
                      </div>
                      <div className="mt-2 border border-gray-300 bg-red-50 rounded-md px-4 py-3 text-sm text-gray-700">
                        {e.FlagReason || "No reason provided"}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>   
    <div className={`fixed top-0 right-0 h-screen w-[650px] bg-white z-50 shadow-xl
        transform transition-transform duration-500 ease-in-out
        ${openScore ? "translate-x-0" : "translate-x-full"}
        flex flex-col`}>
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">
          Level 2 - Business Jury
        </h2>
        <X
          className="cursor-pointer text-gray-600"
          onClick={handleCloseDrawer}/>
      </div>
      {/* <div className="px-6 py-6 space-y-6 text-sm"> */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-sm">
        {scores.map((item, i) => (
          <div key={i}>
            <div className="flex items-center gap-6 mb-2">
              <div className="flex items-center gap-1 font-medium">
                {item.title}
                <span className="text-gray-400 text-xs">ⓘ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Score</span>
                <input type="number" min={1} max={100} value={item.score}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setScores(prev =>
                      prev.map((s, idx) =>
                        idx === i ? { ...s, score: val } : s
                      )
                    );
                  }}
              className={`w-[90px] h-[36px] px-3 border rounded-md text-sm outline-none
              ${popupErrors.score[i] ? "border-red-500" : "border-gray-300"}`}/>
              </div>
              {popupErrors.score[i] && (
                <p className="text-red-600 text-xs mt-1">
                  {popupErrors.score[i]}
                </p>
              )}
            </div>
             <label className="block text-gray-500 text-sm mb-1">
                  Comments
             </label>
            <textarea rows={3} value={item.comment}
              onChange={(e) => {
                const val = e.target.value;
                setScores(prev =>
                  prev.map((s, idx) =>
                    idx === i ? { ...s, comment: val } : s
                  )
                );
              }}
              className={`w-full px-3 py-2 border rounded-md text-sm resize-none outline-none
                ${popupErrors.comment[i] ? "border-red-500" : "border-gray-300"}`}/>

              {popupErrors.comment[i] && (
                <p className="text-red-600 text-xs mt-1">
                  {popupErrors.comment[i]}
                </p>
              )}        
          </div>
         ))}
          <div className="flex items-center gap-2 mb-[12px]">
            <Flag size={18} className={isFlagged ? "text-red-600" : "text-gray-400"}/>
            <span className="font-medium">Flag :</span>
            <input type="checkbox" checked={isFlagged}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsFlagged(checked);
                if (checked) {
                  setTimeout(() => textareaRef.current?.focus(), 100);
                } else {
                  setFlagComment("");
                  setPopupErrors(prev => ({ ...prev, flagComment: "" }));
                }
              }}
              className="w-4 h-4 mt-[1px] accent-red-600 cursor-pointer"/>
          </div>
            <textarea ref={textareaRef} rows={3} value={flagComment}
              onChange={(e) => {
                const value = e.target.value;
                setFlagComment(value);
                if (value.trim()) {
                  setPopupErrors(prev => ({ ...prev, flagComment: "" }));
                }
              }}
              disabled={!isFlagged}
              placeholder="Flagged reason here"
              className={`w-full px-3 py-2 rounded-[6px]
                ${isFlagged
                  ? "border border-red-300 bg-red-50"
                  : "border border-gray-200 bg-gray-100 cursor-not-allowed"}`}/>
            {popupErrors.flagComment && (
              <p className="text-red-600 text-xs mt-1">
                {popupErrors.flagComment}
              </p>
            )}
         <div className="mt-4">
              <Label.Root className="block text-sm font-medium">
                Supporting Documents 
                <span className="text-red-500">(Maximum 5 files allowed & File must be below 2 MB)</span>
              </Label.Root>
              <label
                htmlFor="fileUpload"
                className="inline-block bg-gray-100 text-gray-700 border border-gray-300 px-6 py-2 rounded cursor-pointer mt-2 hover:bg-gray-200">
                Choose File
              </label>
              <input
                id="fileUpload"
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden" />
              {fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}
            </div>         
            <div className="mt-3 flex flex-wrap gap-2">
              {allDocuments.map((doc: any, index: number) => (
                <div
                  key={doc.source === "api" ? doc.fileNameGUID : index}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg shadow-sm border relative">
                  {/* File Name */}
                  <span
                    className="text-sm truncate max-w-[180px] cursor-pointer text-blue-600 hover:underline"
                    onClick={async () => {
                      const fileName = doc.originalFileName;
                      const ext = fileName.split(".").pop()?.toLowerCase() || "";

                      if (doc.source === "api") {
                        try {
                          const response = await axios.get(
                            `${apiUrl}/api/download?fileName=${doc.fileNameGUID}`,
                            {
                              responseType: "blob",
                              headers: { Authorization: `Bearer ${authToken}` },
                            }
                          );
                          const blobUrl = URL.createObjectURL(response.data);
                          if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
                            openPreview(response.data, ext);
                          } 
                          else if (ext === "pdf") {
                            const pdfBlob = new Blob([response.data], { type: "application/pdf" });
                            const pdfUrl = URL.createObjectURL(pdfBlob);
                            window.open(pdfUrl, "_blank");
                          }
                          // else if (ext === "pdf") {
                          //   window.open(blobUrl, "_blank");  
                          // }
                          else {
                            const link = document.createElement("a");
                            link.href = URL.createObjectURL(response.data);
                            link.download = fileName;
                            link.click();
                          }
                        } catch {
                          alert("File not found");
                        }
                      }

                      else {
                        const file = doc.file;
                        if (!(file instanceof File)) return;

                        if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
                          openPreview(file, ext);
                        } 
                         else if (ext === "pdf") {
                          const pdfBlob = new Blob([file], { type: "application/pdf" });
                          const pdfUrl = URL.createObjectURL(pdfBlob);
                          window.open(pdfUrl, "_blank");    
                          }
                          else {
                          const link = document.createElement("a");
                          link.href = URL.createObjectURL(file);
                          link.download = file.name;
                          link.click();
                        }
                      }
                    }}>
                    {doc.originalFileName || doc.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (doc.source === "api") {
                        setExistingDocs(prev => prev.map(d => d.fileNameGUID === doc.fileNameGUID ? { ...d, isDeleted: true } : d));
                      } else {
                        setForm(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
                      }
                    }}
                    className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">
                    ×
                  </button>
                </div>
              ))}
            </div>     
        <div className="flex justify-end gap-3 pt-6">
           <button
              onClick={handleCloseDrawer} 
              className="h-[42px] px-6 border border-gray-300 rounded-[6px] text-gray-700">
              Cancel
            </button>
            <button  onClick={handleSubmitEvaluation}
             className="h-[44px] px-8 rounded-md shadow btn-theme"> Submit </button>
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
                  // className={`w-full mt-1 p-2 pr-10 border rounded text-sm ${popupErrors.score ? "border-red-500" : "border-gray-300"}`}
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
              {/* {popupErrors.score && <p className="text-red-600 text-xs mt-1">{popupErrors.score}</p>} */}
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
{/* ================= Withdraw Confirmation Dialog ================= */}
      <Dialog.Root
        open={isWithdrawDialogOpen}
        onOpenChange={setIsWithdrawDialogOpen}>
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
        onOpenChange={setPreviewOpen}>
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
const ScoreBox = ({
  label,
  value,
}: {
  label: string;
  value: number;
}) => (
  <div className="border border-gray-300 rounded-md px-3 py-1 text-center min-w-[60px]">
    <div className="text-sm font-semibold">{value}</div>
    <div className="text-[10px] text-gray-500">{label}</div>
  </div>
);