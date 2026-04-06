import * as Label from "@radix-ui/react-label";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { X, ArrowLeft,Menu, Eye } from "lucide-react";
import { useAuth } from "../ContextAPI/AuthContext";
import * as Dialog from "@radix-ui/react-dialog";
import { useLocation } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Flag ,User, Building2, Tag, 
  CalendarDays, FileText, Mail, BadgeCheck, Check } from "lucide-react";
import type { FormState } from "../../dataTypes/nomination";
import { levelColors, levelTextColors } from "../../statusColors.ts";
import BusinessJuryEvaluation from "./BusinessJuryEvaluation.tsx";

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
type PopupErrors = {
  score: Record<number, string>;
  comment: Record<number, string>;
  comments: string;
  flagComment: string;
  juryFlagComment: string;
  grandFlagComment: string;
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
 isOpen}) => {
  const { nominationId } = useParams<{ nominationId: string }>();
  const navigate = useNavigate();
  const { authToken, userId,primaryfield } = useAuth();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [data, setData] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [_documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [expandedApprovalComments, setApprovalComments] = useState(false);
  const [expandedFlagReason, setExpandedFlagReason] = useState(false);
  const visibleReferrals = expanded ? referrals : referrals.slice(0, 3);
  const location1 = useLocation();
  const from = location1.state?.from;
  const [_attachmentMode, setAttachmentMode] = useState<"approval" | "flag"
   |"referral" |"juryApproval"|"grandApproval"|"juryFlag"|"grandFlag"| null>("approval");
  const [approvalFiles, setApprovalFiles] = useState<File[]>([]);
  const [flagFiles, setFlagFiles] = useState<File[]>([]);
  const [juryApprovalFiles, setJuryApprovalFiles] = useState<File[]>([]);
  const [juryFlagFiles, setJuryFlagFiles] = useState<File[]>([]);
  const [grandApprovalFiles, setGrandApprovalFiles] = useState<File[]>([]);
  const [grandFlagFiles, setGrandFlagFiles] = useState<File[]>([]);
  const [existingApprovalDocs, setExistingApprovalDocs] = useState<any[]>([]);
  const [existingFlagDocs, setExistingFlagDocs] = useState<any[]>([]);
  const [existingJuryApprovalDocs, setExistingJuryApprovalDocs] = useState<any[]>([]);
  const [existingJuryFlagDocs, setExistingJuryFlagDocs] = useState<any[]>([]);
  const [existingGrandApprovalDocs, setExistingGrandApprovalDocs] = useState<any[]>([]);
  const [existingGrandFlagDocs, setExistingGrandFlagDocs] = useState<any[]>([]);
  const approvalFileRef = useRef<HTMLInputElement | null>(null);
  const flagFileRef = useRef<HTMLInputElement | null>(null);
  const juryApprovalFileRef = useRef<HTMLInputElement | null>(null);
  const grandApprovalFileRef = useRef<HTMLInputElement | null>(null);
  const juryFlagFileRef = useRef<HTMLInputElement | null>(null);
  const grandFlagFileRef = useRef<HTMLInputElement | null>(null);
  const [approvalFileError, setApprovalFileError] = useState("");
  const [flagFileError, setFlagFileError] = useState(""); 
  const [juryApprovalFileError, setJuryApprovalFileError] = useState("");
  const [grandApprovalFileError, setGrandApprovalFileError] = useState(""); 
  const [juryFlagFileError, setJuryFlagFileError] = useState(""); 
  const [_grandFlagFileError, setGrandFlagFileError] = useState(""); 
  const [popupComments, setPopupComments] = useState("");
  const[popupCommentsJury,setPopupCommentsJury]=useState("");
  const [popupCommentsGrand,setPopupCommentsGrand]=useState("");

  const DEFAULT_SCORE_ITEMS: ScoreItem[] = [
  { weightId: 1, title: "Integrity", score: "", comment: "" },
  { weightId: 2, title: "Idea", score: "", comment: "" },
  { weightId: 3, title: "Efforts", score: "", comment: "" },
  { weightId: 4, title: "Outcome", score: "", comment: "" }
];
  const [scores, setScores] = useState<ScoreItem[]>(DEFAULT_SCORE_ITEMS);
  const [popupErrors, setPopupErrors] = useState<PopupErrors>({
    score: {},
    comment: {},
    comments: "",
    flagComment: "",
    juryFlagComment: "",
    grandFlagComment: ""
  });
  const [openCommentsPopup, setOpenCommentsPopup] = useState(false);
  const [selectedComment, setSelectedComment] = useState("");
  const refFileRef = useRef<HTMLInputElement | null>(null);
  const [refFileError, setRefFileError] = useState("");
  const [openReferralPopup, setOpenReferralPopup] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [refStatus, setRefStatus] = useState<"Approved" | "Rejected">("Approved");
  const [refComments, setRefComments] = useState("");
  const [refFiles, setRefFiles] = useState<File[]>([]);
  const [existingRefDocs, setExistingRefDocs] = useState<any[]>([]);
  const [openApprove, setOpenApprove] = useState(false);
  const [openEvaluation, setOpenEvaluation] = useState(false);
  const [openGrandJuryEvaluation,setOpenGrandJuryEvaluation]=useState(false);
  const [openScore, setOpenScore] = useState(false);
  //const [openCard, setOpenCard] = useState<number | null>(null);
  const [_existingDocs, setExistingDocs] = useState<any[]>([]);
  const [isFlagged, setIsFlagged] = useState(false);
  const [flagComment, setFlagComment] = useState("");
  const [status, setStatus] = useState<"Approved" | "Rejected">("Approved");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [openDocPopup, setOpenDocPopup] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<any[]>([]);
  const [isFlowStopped, setIsFlowStopped] = useState(false);
  const [isJuryFlagged, setIsJuryFlagged] = useState(false);
  const [isGrandFlagged, setIsGrandFlagged] = useState(false);
  const [juryStatus, setJuryStatus] = useState<"Approved" | "Rejected">("Approved");
  const [_juryScore, setJuryScore] = useState("");
  const [juryErrors, setJuryErrors] = useState<any>({});
  const [juryFlagComment, setJuryFlagComment] = useState("");
  const [grandStatus, setGrandStatus] = useState<"Approved" | "Rejected">("Approved");
  const [grandScore, setGrandScore] = useState("");
  const [_grandErrors, setGrandErrors] = useState<any>({});
  const [grandFlagComment, setGrandFlagComment] = useState("");
  const [_form, setForm] = useState<FormState>({
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
    const getTruncatedText = (text: string,expanded: boolean,limit: number = 160) => {
      if (!text) return "";
      return expanded || text.length <= limit
        ? text
        : text.slice(0, limit) + "...";
    };
  const safeParse = (value: any) => {
    try {
      if (!value || value === " " || value === "") return [];
      return JSON.parse(value);
    } catch {
      return [];
    }
  };
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
      const res = await axios.get(
    `${apiUrl}/api/jurylevelnomination/${nominationId}/${userId}`, 
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
      const hasRejectedReferral = result.Referrals?.some(
        (r: any) =>
          r.ReferralUserID === userId && r.Status === "Rejected"
      );
      setIsFlowStopped(hasRejectedReferral);
      setData(result);
      setReferrals(result.Referrals || []);
      setDocuments(result["Supporting Documents"]|| []);
      console.log("referal data",result)
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
const handleBackward = () => {

  if (from === "nominations") {
    navigate("/my-nominations", {
      state: { tab: location1.state?.tab},
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
const referralDocuments = [
  ...existingRefDocs
    .filter((doc) => !doc.isDeleted)
    .map((doc) => ({
      source: "api",
      originalFileName: doc.originalFileName,
      fileNameGUID: doc.fileNameGUID,
      fileType: doc.fileType,
      fileUrl: doc.fileUrl,
      fileSize: doc.fileSize
    })),

  ...refFiles.map((file) => ({
    source: "local",
    originalFileName: file.name,
    file
  }))
];

const approvalDocuments = [
  ...existingApprovalDocs
    .filter((doc) => !doc.isDeleted)
    .map((doc) => ({
      source: "api",
      originalFileName: doc.originalFileName,
      fileNameGUID: doc.fileNameGUID,
      fileType: doc.fileType
    })),

  ...approvalFiles.map((file) => ({
    source: "local",
    originalFileName: file.name,
    file
  }))
];

const approvalJuryDocuments = [
  ...existingJuryApprovalDocs
    .filter((doc) => !doc.isDeleted)
    .map((doc) => ({
      source: "api",
      originalFileName: doc.originalFileName,
      fileNameGUID: doc.fileNameGUID,
      fileType: doc.fileType
    })),

  ...juryApprovalFiles.map((file) => ({
    source: "local",
    originalFileName: file.name,
    file
  }))
];

const approvalGrandDocuments = [
  ...existingGrandApprovalDocs
    .filter((doc) => !doc.isDeleted)
    .map((doc) => ({
      source: "api",
      originalFileName: doc.originalFileName,
      fileNameGUID: doc.fileNameGUID,
      fileType: doc.fileType
    })),

  ...grandApprovalFiles.map((file) => ({
    source: "local",
    originalFileName: file.name,
    file
  }))
];

const flagDocuments = [
  ...existingFlagDocs
    .filter((doc) => !doc.isDeleted)
    .map((doc) => ({
      source: "api",
      originalFileName: doc.originalFileName,
      fileNameGUID: doc.fileNameGUID,
      fileType: doc.fileType
    })),

  ...flagFiles.map((file) => ({
    source: "local",
    originalFileName: file.name,
    file
  }))
];

const flagJuryDocuments = [
  ...existingJuryFlagDocs
    .filter((doc) => !doc.isDeleted)
    .map((doc) => ({
      source: "api",
      originalFileName: doc.originalFileName,
      fileNameGUID: doc.fileNameGUID,
      fileType: doc.fileType
    })),

  ...juryFlagFiles.map((file) => ({
    source: "local",
    originalFileName: file.name,
    file
  }))
];

const flagGrandDocuments = [
  ...existingGrandFlagDocs
    .filter((doc) => !doc.isDeleted)
    .map((doc) => ({
      source: "api",
      originalFileName: doc.originalFileName,
      fileNameGUID: doc.fileNameGUID,
      fileType: doc.fileType
    })),

  ...grandFlagFiles.map((file) => ({
    source: "local",
    originalFileName: file.name,
    file
  }))
];

const removeFile = (doc: any, index: number, type: "approval" | "flag" |"referral" |"juryApproval"|
  "grandApproval"|"juryFlag"|"grandFlag") => {
  if (doc.source === "api") {
    if (type === "referral") {
      setExistingRefDocs((prev) =>
        prev.map((d) =>
          d.fileNameGUID === doc.fileNameGUID
            ? { ...d, isDeleted: true }
            : d
        )
      );
    }
    else if (type === "approval") {
      setExistingApprovalDocs((prev) =>
        prev.map((d) =>
          d.fileNameGUID === doc.fileNameGUID
            ? { ...d, isDeleted: true }
            : d
        )
      );
    } else if (type === "juryApproval") {
      setExistingJuryApprovalDocs((prev) =>
        prev.map((d) =>
          d.fileNameGUID === doc.fileNameGUID
            ? { ...d, isDeleted: true }
            : d
        )
      );
    } else if (type === "grandApproval") {
      setExistingGrandApprovalDocs((prev) =>
        prev.map((d) =>
          d.fileNameGUID === doc.fileNameGUID
            ? { ...d, isDeleted: true }
            : d
        )
      );
    } else if (type === "juryFlag") {
      setExistingJuryFlagDocs((prev) =>
        prev.map((d) =>
          d.fileNameGUID === doc.fileNameGUID
            ? { ...d, isDeleted: true }
            : d
        )
      );
    } else if (type === "grandFlag") {
      setExistingGrandFlagDocs((prev) =>
        prev.map((d) =>
          d.fileNameGUID === doc.fileNameGUID
            ? { ...d, isDeleted: true }
            : d
        )
      );
    } else {
      setExistingFlagDocs((prev) =>
        prev.map((d) =>
          d.fileNameGUID === doc.fileNameGUID
            ? { ...d, isDeleted: true }
            : d
        )
      );
    }
  } else {
    if (type === "approval") {
      setApprovalFiles((prev) => prev.filter((_, i) => i !== index));
    } 
    else if (type === "referral") {
      setRefFiles((prev) => prev.filter((_, i) => i !== index));
    }
    else if (type === "juryApproval") {
      setJuryApprovalFiles((prev) => prev.filter((_, i) => i !== index));
    }
    else if (type === "grandApproval") {
      setGrandApprovalFiles((prev) => prev.filter((_, i) => i !== index));
    }
    else if (type === "juryFlag") {
      setJuryFlagFiles((prev) => prev.filter((_, i) => i !== index));
    }
    else if (type === "grandFlag") {
      setGrandFlagFiles((prev) => prev.filter((_, i) => i !== index));
    }
    else {
      setFlagFiles((prev) => prev.filter((_, i) => i !== index));
    }
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
  
const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>,
  type:"approval" | "flag"
   |"referral" |"juryApproval"|"grandApproval"|"juryFlag"|"grandFlag") => {
  const selectedFiles = Array.from(e.target.files || []);
  if (!selectedFiles.length) return;

  if (type === "approval") setApprovalFileError("");
  else if (type === "flag") setFlagFileError("");
  else if (type === "juryApproval") setJuryApprovalFileError("");
  else if (type === "grandApproval") setGrandApprovalFileError("");
  else if (type === "juryFlag") setJuryFlagFileError("");
  else if (type === "grandFlag") setGrandFlagFileError("");
  else setRefFileError("");

  let currentFiles: File[] = [];
  let existingCount = 0;

  if (type === "approval" ) {
    currentFiles = approvalFiles;
    existingCount = existingApprovalDocs.filter(d => !d.isDeleted).length;
  } 
  else if (type === "flag") {
    currentFiles = flagFiles;
    existingCount = existingFlagDocs.filter(d => !d.isDeleted).length;
  } 
  else if (type === "juryApproval") {
    currentFiles = juryApprovalFiles;
    existingCount = existingJuryApprovalDocs.filter(d => !d.isDeleted).length;
  }
    else if (type === "grandApproval") {
    currentFiles = grandApprovalFiles;
    existingCount = existingGrandApprovalDocs.filter(d => !d.isDeleted).length;
  }
  else if (type === "juryFlag") {
    currentFiles = juryFlagFiles;
    existingCount = existingJuryFlagDocs.filter(d => !d.isDeleted).length;
  }
  else if (type === "grandFlag") {
    currentFiles = grandFlagFiles;
    existingCount = existingGrandFlagDocs.filter(d => !d.isDeleted).length;
  }

  else {
    currentFiles = refFiles;
    existingCount = existingRefDocs.filter(d => !d.isDeleted).length;
  }

  const totalFiles =
    existingCount + currentFiles.length + selectedFiles.length;

  if (totalFiles > 5) {
    const msg = "Maximum 5 files allowed.";
    if (type === "approval") setApprovalFileError(msg);
    else if (type === "flag") setFlagFileError(msg);
    else if (type  === "grandApproval") setGrandApprovalFileError(msg);
    else if (type  === "juryApproval") setJuryApprovalFileError(msg);
    else if (type  === "juryFlag") setJuryFlagFileError(msg);
    else if (type  === "grandFlag") setGrandFlagFileError(msg);
    else setRefFileError(msg);
    return;
  }

  for (const file of selectedFiles) {
    const isDuplicate = currentFiles.some(
      (f) => f.name === file.name && f.size === file.size
    );

    if (isDuplicate) {
      const msg = `"${file.name}" already added.`;
      if (type === "approval") setApprovalFileError(msg);
      else if (type === "juryApproval") setJuryApprovalFileError(msg);
      else if (type === "grandApproval") setGrandApprovalFileError(msg);
      else if (type === "flag") setFlagFileError(msg);
      else if (type === "juryFlag") setJuryFlagFileError(msg);
      else if (type === "grandFlag") setGrandFlagFileError(msg);
      else setRefFileError(msg);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      const msg = `"${file.name}" exceeds 2 MB limit.`;
      if (type === "approval") setApprovalFileError(msg);
      else if (type === "juryApproval") setJuryApprovalFileError(msg);
      else if (type === "grandApproval") setGrandApprovalFileError(msg);
      else if (type === "flag") setFlagFileError(msg);
      else if (type === "juryFlag") setJuryFlagFileError(msg);
      else if (type === "grandFlag") setGrandFlagFileError(msg);

      else setRefFileError(msg);
      return;
    }
  }
  if (type === "approval") {
    setApprovalFiles((prev) => [...prev, ...selectedFiles]);
    if (approvalFileRef.current) approvalFileRef.current.value = "";
  } 
  else if (type === "juryApproval") {
    setJuryApprovalFiles((prev) => [...prev, ...selectedFiles]);
    if (juryApprovalFileRef.current) juryApprovalFileRef.current.value = "";
  }
    else if (type === "grandApproval") {  
    setGrandApprovalFiles((prev) => [...prev, ...selectedFiles]);
    if (grandApprovalFileRef.current) grandApprovalFileRef.current.value = "";
  }

  else if (type === "flag") {
    setFlagFiles((prev) => [...prev, ...selectedFiles]);
    if (flagFileRef.current) flagFileRef.current.value = "";
  } 
  else if (type === "juryFlag") {
    setJuryFlagFiles((prev) => [...prev, ...selectedFiles]);
    if (juryFlagFileRef.current) juryFlagFileRef.current.value = "";
  }
  else if (type === "grandFlag") {
    setGrandFlagFiles((prev) => [...prev, ...selectedFiles]);
    if (grandFlagFileRef.current) grandFlagFileRef.current.value = "";
  }
  else {
    setRefFiles((prev) => [...prev, ...selectedFiles]);
    if (refFileRef.current) refFileRef.current.value = "";
  }
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

  return res.data; 
};

  const validateEvaluation = (mode: "manager" | "jury" | "grandJury") => {
  const errs: PopupErrors = {
    score: {},
    comment: {},
    comments: "",
    flagComment: "",
    juryFlagComment:"",
    grandFlagComment:""
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


  if(mode=="grandJury"){
    
    if (!popupCommentsGrand?.trim()) {
      errs.comments = "Comments are required!";
      ok = false;
    }
    else if (popupCommentsGrand.trim().length > 500) {
      errs.comments = "Max 500 characters allowed";
      ok = false;
    }
  }

  if (isFlagged  && !flagComment.trim()) {
    errs.flagComment = "Flag reason required";
    ok = false;
  }
else if (isJuryFlagged && !juryFlagComment.trim()) {
    errs.juryFlagComment = "Flag reason required";
    ok = false;
  }
  else if (isGrandFlagged && !grandFlagComment.trim()) {
    errs.grandFlagComment = "Flag reason required";
    ok = false;
  }

  setPopupErrors(errs);
  return ok;
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
   return (
     <div className="bg-gray-100 p-6 pb-20">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex items-center justify-center">
                  <p className="text-red-500 text-xl font-medium">
                    Nomination not found
                  </p>
              </div>
            <div className="flex flex-col gap-8">
                
                  <div className="flex justify-end">
                    <button
                      onClick={handleBackward}
                      className="flex items-center text-blue-600 bg-white border border-gray-300 rounded-sm px-3 py-2 font-medium hover:bg-gray-50"
                    >
                      <ArrowLeft size={14} className="mr-1" /> Back
                    </button>
                  </div>
          </div>
        </div>
    </div>
    )
  }

const approvalData = data?.ApprovalStatus || [];
const level1 = approvalData?.find((l: ApprovalItem) => l.ApprovalFlow === "Level-1");
const level2 = approvalData?.find((l: ApprovalItem) => l.ApprovalFlow === "Level-2");
const level3 = approvalData?.find((l: ApprovalItem) => l.ApprovalFlow === "Level-3");
type StageType = "referral" | "manager" | "jury" | "grand";

const stageMap: Record<string, StageType> = {
  "referral-approval": "referral",
  "approvals": "manager",
  "business-jury": "jury",
  "president-level": "grand"
};

const currentStage = stageMap[from] || "referral";

const stageOrder: Record<StageType, number> = {
  referral: 0,
  manager: 1,
  jury: 2,
  grand: 3
};

const currentLevel = stageOrder[currentStage];
const isL1Approved = level1?.Status === "Approved";
const isL2Approved = level2?.Status === "Approved";

const showManager = true; 

const showJury =
  currentLevel >= 2 && isL1Approved;

const showGrand =
  currentLevel >= 3 && isL1Approved && isL2Approved;
const showReferral = currentStage === "referral";

  const isBusinesJuryDisplay = currentStage === "jury" 
  ? level2.BusinessJuryAttributeScore!== "[]" 
  : currentStage === "grand" 
    ? level2.ApprovedAt !== "" 
    : false; 

const juryScores = JSON.parse(approvalData[1].BusinessJuryAttributeScore || "[]");

let result;

if (primaryfield === "IsPrimary" || currentStage==="grand") {
  result = { 
    name: approvalData[1].ApprovalName ,
    dept:approvalData[1].ApprovalDepartment
  };
} else {
  result = {
    name: juryScores[0]?.JuryName,
    dept: juryScores[0]?.JuryDept
  };
}

const isReferralEditable = (ref: any) =>
  currentStage === "referral" && ref.ReferralUserID === userId;

// const isManagerEditable =
//   currentStage === "manager" && level1?.ApprovalNameID === userId;

// const isJuryEditable =
//   currentStage === "jury" && userRole === "Business Jury";

// const isGrandEditable =
//   currentStage === "grand" && userRole === "President";

const isManagerDisabled = currentStage !== "manager" || level2?.Status === "Approved";
const isJuryDisabled = currentStage !== "jury" ||level1?.Status === "Not Started" 
|| level3?.Status === "Approved" || level1?.Status === "Rejected";
const isGrandDisabled = currentStage !== "grand" || level2?.Status === "Not Started" || level2?.Status === "Rejected";

const flagDetails =safeParse(level1?.Flagdetails);
const juryFlagDetails =safeParse(level2?.Flagdetails);
const GrandJuryflagDetails =safeParse(level3?.Flagdetails);
const flagData = flagDetails?.[0]; 
const flagBusinessJuryData=juryFlagDetails?.[0];
const flagGrandJuryData=GrandJuryflagDetails?.[0];

const level1Comment = level1?.ApprovalComments || "";
const level2Comment = level2?.ApprovalComments || "";
const level3Comment = level3?.ApprovalComments || "";

const isApprovalTruncated = level1Comment.length > 160;
const isJuryApprovalTruncated=level2Comment.length>160;
const isGrandJuryTruncated = level3Comment.length > 160;

const displayApprovalComment = getTruncatedText(
  level1Comment,
  expandedApprovalComments,
  160
);
const displayJuryApprovalComment = getTruncatedText(
  level2Comment,
  expandedApprovalComments,
  160
);
const displayGrandJuryComment = getTruncatedText(
  level3Comment,
  expandedApprovalComments,
  160
);

const flagReasonText = flagData?.FlagReason || "";
const flagBusinessJuryReasonText=flagBusinessJuryData?.FlagReason||"";
const flagGranJuryReasonText=flagGrandJuryData?.FlagReason||"";

const isFlagTruncated = flagReasonText.length > 160;
const isJuryFlagTruncated=flagBusinessJuryReasonText.length>160;
const isGrandJuryFlagTruncated=flagGranJuryReasonText.length>160;

const displayFlagReason = getTruncatedText(
  flagReasonText,
  expandedFlagReason,
  160
);
const displayJuryFlagReason = getTruncatedText(
  flagBusinessJuryReasonText,
  expandedFlagReason,
  160
);
const displayGrandJuryFlagReason = getTruncatedText(
  flagGranJuryReasonText,
  expandedFlagReason,
  160
);

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

const avgScoreData = safeParse(level2?.JuryMemberAvgScore);
const avgScore = avgScoreData?.[0]?.JuryMemberAvgScore || 0;
const attributeData = level2;

const juryList: JuryItem[] = getBusinessJuryEvaluations().map((j: any) => {
  const submittedDate =
    j.AttributeScore && j.AttributeScore.length > 0
      ? j.AttributeScore[0].CreatedAt  
      : "-";
  return {
    Juryname: j.JuryMemberName || "-",
    SubmittedDate: submittedDate,
    Score:
      j.ApprovalScore || 
      j.TotalScore ||
      j.AttributeAvg?.[0]?.JuryIntegrativeScore || 0,
    Flag: Array.isArray(j.FlagDetails) && j.FlagDetails.length > 0 ? 1 : 0,
    Attributes: (j.AttributeScore  || []).map((a: any) => ({
      AttributeName: a.AttributeName || "-",
      Score: a.Score ?? 0,
      Comments: a.Comments || a.Comment || "-"
    })),
    FlagReason: j.FlagDetails?.[0]?.FlagReason || ""
  };
});
console.log("jury Data",juryList)

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
  setJuryFlagComment("");
  setGrandFlagComment("");
  setApprovalFiles([]);
  setJuryApprovalFiles([]);
  setGrandApprovalFiles([]);
  setFlagFiles([]);
  setJuryFlagFiles([]);
  setGrandFlagFiles([]);
  setExistingApprovalDocs([]);
  setExistingJuryApprovalDocs([]);
  setExistingGrandApprovalDocs([]);
  setExistingFlagDocs([]);
  setExistingJuryFlagDocs([]);
  setExistingGrandFlagDocs([]);
  setExistingDocs([]);
  setPopupErrors({
    score: {},
    comment:{},
    comments: "",
    flagComment: "",
    juryFlagComment:"",
    grandFlagComment:""
  });
  setPopupCommentsJury("");
  setPopupCommentsGrand("");
  setJuryFlagComment("");
  setGrandFlagComment("");
  setStatus("Approved");
  setPopupComments("");
  setIsFlagged(false);
  setFlagComment("");
  setJuryFlagComment("");
  setGrandFlagComment("");
  setDocuments([]);         
  setExistingDocs([]); 
  setRefStatus("Approved");
  setRefComments("");
  setRefFiles([]);
  setExistingRefDocs([]);
  setRefFileError("");
  setForm(prev => ({ ...prev, files: [] }));

  if (refFileRef.current) refFileRef.current.value = "";       
  if (approvalFileRef.current) {
    approvalFileRef.current.value = "";
  }
  if (juryApprovalFileRef.current) {
    juryApprovalFileRef.current.value = "";
  }
    if (grandApprovalFileRef.current) {
    grandApprovalFileRef.current.value = "";
  }
  if (juryFlagFileRef.current) {
    juryFlagFileRef.current.value = "";
  }
  if (grandFlagFileRef.current) {
    grandFlagFileRef.current.value = "";
  }

  if (flagFileRef.current) {
    flagFileRef.current.value = "";
  }
  setApprovalFileError("");
  setJuryApprovalFileError("");
  setGrandApprovalFileError("");
  setFlagFileError("");
  setJuryFlagFileError("");
  setGrandFlagFileError("");
  setIsEditMode(false);
};

const closeApproveDrawer = () => {
  resetApproveDrawer();
  setOpenApprove(false);
  setOpenReferralPopup(false)
};

const handleCloseDrawer = () => {
  setOpenScore(false);
  setExistingDocs([]); 
  setForm(prev => ({ ...prev, files: [] })); 
  resetApproveDrawer();
};

const closeGrandJuryDrawer=()=>{
    resetApproveDrawer();
  setOpenGrandJuryEvaluation(false);
}

const handleManagerApprove = () => {
  if (!level1) return;
   if (approvalData[1].ApprovedAt!="")return;
   const isAlreadySaved = level1?.ApprovedAt !== null && level1?.ApprovedAt !== "";

  setIsEditMode(isAlreadySaved);
  setStatus(level1.Status === "Rejected" ? "Rejected" : "Approved");
  setPopupComments(level1.ApprovalComments || "");

  let parsedFlag = null;
  try {
    const parsed = level1.Flagdetails ? JSON.parse(level1.Flagdetails) : [];
    parsedFlag = parsed?.[0];
  } catch {
    parsedFlag = null;
  }

  const isFlag = Number(parsedFlag?.Flag) === 1;
  setIsFlagged(isFlag);
  setFlagComment(parsedFlag?.FlagReason || "");

  let parsedFlagAttachments: any[] = [];
  try {
    parsedFlagAttachments = level1.FlagAttachment
      ? JSON.parse(level1.FlagAttachment)
      : [];
  } catch {
    parsedFlagAttachments = [];
  }

  let parsedApprovalAttachments: any[] = [];
  try {
    parsedApprovalAttachments = level1.ApprovalAttachment
      ? JSON.parse(level1.ApprovalAttachment)
      : [];
  } catch {
    parsedApprovalAttachments = [];
  }

  const flagDocs = parsedFlagAttachments.map((file: any) => ({
    source: "api",
    AttachmentID: file.AttachmentsID,
    fileNameGUID: file.AttachmentNameGUID,
    originalFileName: file.OriginalAttachmentName,
    fileType: file.AttachmentFileType,
    fileUrl: file.AttachmentPath,
    fileSize: file.AttachmentSize
  }));

  const approvalDocs = parsedApprovalAttachments.map((file: any) => ({
    source: "api",
    AttachmentID: file.AttachmentsID,
    fileNameGUID: file.AttachmentNameGUID,
    originalFileName: file.OriginalAttachmentName,
    fileType: file.AttachmentFileType,
    fileUrl: file.AttachmentPath,
    fileSize: file.AttachmentSize
  }));

  setExistingFlagDocs(flagDocs);
  setExistingApprovalDocs(approvalDocs);

  setOpenApprove(true);
};

const handleJuryApprove = () => {
  if (!level2) return;

  const isAlreadySaved = level2.BusinessJuryAttributeScore&& level2.BusinessJuryAttributeScore !== "[]";
  setIsEditMode(isAlreadySaved);

  setJuryStatus(level2.Status === "Rejected" ? "Rejected" : "Approved");
  setPopupCommentsJury(level2.ApprovalComments || "");
  setJuryScore(level2.ApprovalScore || "");

  let parsedJuryFlag = null;
  try {
    const parsed = level2.Flagdetails ? JSON.parse(level2.Flagdetails) : [];
    parsedJuryFlag = parsed?.[0];
  } catch {
    parsedJuryFlag = null;
  }

  const isJuryFlag = Number(parsedJuryFlag?.Flag) === 1;
  setIsJuryFlagged(isJuryFlag);
  setJuryFlagComment(parsedJuryFlag?.FlagReason || "");

  let parsedJuryApprovalAttachments: any[] = [];
  try {
    parsedJuryApprovalAttachments = level2.ApprovalAttachment
      ? JSON.parse(level2.ApprovalAttachment)
      : [];
  } catch {
    parsedJuryApprovalAttachments = [];
  }


  const approvalJuryDocs = parsedJuryApprovalAttachments.map((file: any) => ({
    source: "api",
    AttachmentID: file.AttachmentsID,
    fileNameGUID: file.AttachmentNameGUID,
    originalFileName: file.OriginalAttachmentName,
    fileType: file.AttachmentFileType,
    fileUrl: file.AttachmentPath,
    fileSize: file.AttachmentSize
  }));

  setExistingJuryApprovalDocs(approvalJuryDocs);
  let parsedFlagAttachments: any[] = [];
  try {
    parsedFlagAttachments = level2.FlagAttachment
      ? JSON.parse(level2.FlagAttachment)
      : [];
  } catch {
    parsedFlagAttachments = [];
  }

  const flagJuryDocs = parsedFlagAttachments.map((file: any) => ({
    source: "api",
    AttachmentID: file.AttachmentsID,
    fileNameGUID: file.AttachmentNameGUID,
    originalFileName: file.OriginalAttachmentName,
    fileType: file.AttachmentFileType,
    fileUrl: file.AttachmentPath,
    fileSize: file.AttachmentSize
  }));

  setExistingJuryFlagDocs(flagJuryDocs);
  try {
       
  const parsed = safeParse(level2?.BusinessJuryAttributeScore);

  if (parsed.length > 0) {
    const mappedScores = parsed.map((a: any) => ({
      weightId: a.ScoreWeightageID,
      title: a.AttributeName,
      score: a.Score,
      comment: a.Comments || ""
    }));

    setScores(mappedScores);
  } else {
    setScores(structuredClone(DEFAULT_SCORE_ITEMS));
  }

  } catch {
    setScores(structuredClone(DEFAULT_SCORE_ITEMS));
  }

  setOpenScore(true);
};

const handleGrandJuryApprove = () => {
  if (!level3) return;
  const isAlreadySaved = !!level3.ApprovedAt;

  setIsEditMode(isAlreadySaved);
  setGrandStatus(level3.Status === "Rejected" ? "Rejected" : "Approved");
  setPopupCommentsGrand(level3.ApprovalComments || "");
  setGrandScore(level3.ApprovalScore || "");

  let parsedGrandFlag = null;
  try {
    const parsed = level3.Flagdetails ? JSON.parse(level3.Flagdetails) : [];
    parsedGrandFlag = parsed?.[0];
  } catch {
    parsedGrandFlag = null;
  }

  const isFlag = Number(parsedGrandFlag?.Flag) === 1;
  setIsGrandFlagged(isFlag);
  setGrandFlagComment(parsedGrandFlag?.FlagReason || "");

  let parsedGrandFlagAttachments: any[] = [];
  try {
    parsedGrandFlagAttachments = level3.FlagAttachment
      ? JSON.parse(level3.FlagAttachment)
      : [];
  } catch {
    parsedGrandFlagAttachments = [];
  }

  let parsedGrandApprovalAttachments: any[] = [];
  try {
    parsedGrandApprovalAttachments = level3.ApprovalAttachment
      ? JSON.parse(level3.ApprovalAttachment)
      : [];
  } catch {
    parsedGrandApprovalAttachments = [];
  }

  const flagGrandDocs = parsedGrandFlagAttachments.map((file: any) => ({
    source: "api",
    AttachmentID: file.AttachmentsID,
    fileNameGUID: file.AttachmentNameGUID,
    originalFileName: file.OriginalAttachmentName,
    fileType: file.AttachmentFileType,
    fileUrl: file.AttachmentPath,
    fileSize: file.AttachmentSize
  }));

  const approvalGrandDocs = parsedGrandApprovalAttachments.map((file: any) => ({
    source: "api",
    AttachmentID: file.AttachmentsID,
    fileNameGUID: file.AttachmentNameGUID,
    originalFileName: file.OriginalAttachmentName,
    fileType: file.AttachmentFileType,
    fileUrl: file.AttachmentPath,
    fileSize: file.AttachmentSize
  }));

  setExistingGrandFlagDocs(flagGrandDocs);
  setExistingGrandApprovalDocs(approvalGrandDocs);

  setOpenGrandJuryEvaluation(true);
};

const submitManagerApproval = async () => {

  if (!validateEvaluation("manager")) return;

  try {
    setLoading(true);

    let uploadedApprovalDocs: any[] = [];
    let uploadedFlagDocs: any[] = [];

    if (approvalFiles.length > 0) {
      uploadedApprovalDocs = await uploadFilesToServer(approvalFiles);
    }

    if (flagFiles.length > 0) {
      uploadedFlagDocs = await uploadFilesToServer(flagFiles);
    }

    const flags = {
      NominationFlagsID: flagData?.NominationFlagsID || 0,
      NominationID: Number(nominationId),
      IsFlag: isFlagged ? true: false,
      FlagReason: isFlagged ? flagComment : "",
      CreatedBy: userId,
      UpdatedBy: userId
    };

    const approval = {
      NominationID: Number(nominationId),
      IsManagerApproved: status === "Approved",
      ApprovalComments: popupComments,
      CreatedBy: userId,
      UpdatedBy: userId
    };

    const attachments = [
      ...existingApprovalDocs
        .filter(doc => !doc.isDeleted)
        .map(doc => ({
          AttachmentsID: doc.AttachmentID || 0,
          NominationID: Number(nominationId),
          AttachmentType: 47,
          OriginalAttachmentName: doc.originalFileName,
          AttachmentFileType: doc.fileType || "",
          AttachmentSize: doc.fileSize || "",
          AttachmentNameGUID: doc.fileNameGUID,
          AttachmentPath: doc.fileUrl || "",
          CreatedBy: userId,
          UpdatedBy: userId
        })),

      ...uploadedApprovalDocs.map(f => ({
        AttachmentsID: 0,
        NominationID: Number(nominationId),
        AttachmentType: 47,
        OriginalAttachmentName: f.originalFileName,
        AttachmentFileType: f.fileType || "",
        AttachmentSize: `${(f.fileSize / 1024).toFixed(2)} KB`,
        AttachmentNameGUID: f.fileNameGUID,
        AttachmentPath: f.fileUrl || "",
        CreatedBy: userId,
        UpdatedBy: userId
      })),

      ...(isFlagged
        ? existingFlagDocs
            .filter(doc => !doc.isDeleted)
            .map(doc => ({
              AttachmentsID: doc.AttachmentID || 0,
              NominationID: Number(nominationId),
              AttachmentType: 48,
              OriginalAttachmentName: doc.originalFileName,
              AttachmentFileType: doc.fileType || "",
              AttachmentSize: doc.fileSize || "",
              AttachmentNameGUID: doc.fileNameGUID,
              AttachmentPath: doc.fileUrl || "",
              CreatedBy: userId,
              UpdatedBy: userId
            }))
        : []),

      ...(isFlagged
        ? uploadedFlagDocs.map(f => ({
            AttachmentsID: 0,
            NominationID: Number(nominationId),
            AttachmentType: 48,
            OriginalAttachmentName: f.originalFileName,
            AttachmentFileType: f.fileType || "",
            AttachmentSize: `${(f.fileSize / 1024).toFixed(2)} KB`,
            AttachmentNameGUID: f.fileNameGUID,
            AttachmentPath: f.fileUrl || "",
            CreatedBy: userId,
            UpdatedBy: userId
          }))
        : [])
    ];

    const payload = {
      Approval: approval,
      Flags: flags,
      Attachments: attachments
    };

    console.log("FINAL PAYLOAD 👉", payload);

    const isUpdate = isEditMode;

    let res = await axios({
      method: isUpdate ? "put" : "post",
      url: isUpdate
        ? `${apiUrl}/api/managerlevelnomination/${nominationId}`
        : `${apiUrl}/api/managerlevelnomination`,
      data: payload,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      }
    });
    if (res.data > 0) {
        setSuccessMessage(
          isUpdate ? "Manager level updated successfully!" : "Manager level added successfully!"
        );
      } else {
        setErrorMessage("Operation failed");
      }

      setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 3000);
    fetchNominationDetails();
    closeApproveDrawer();

  } catch (err) {
    console.error("❌ SAVE ERROR:", err);
    setErrorMessage("Action failed. Please try again.");
  } finally {
    setLoading(false);
  }
};

const submitJuryApproval = async () => {
   if (!validateEvaluation("jury")) return;

   const level2 = approvalData?.[1];
  const evaluatedCount = level2?.EvaluatedJuries || 0;

  if (primaryfield === "IsPrimary" && evaluatedCount < 3) {
    setErrorMessage("Minimum 3 Jury Member evaluations required to approve at this level.");
     handleCloseDrawer(); 

  setTimeout(() => {
    setErrorMessage("");
  }, 3000);
    return;
  }
  try{
  let uploadedJuryApprovalDocs: any[] = [];
    let uploadedJuryFlagDocs: any[] = [];

    if (juryApprovalFiles.length > 0) {
      uploadedJuryApprovalDocs = await uploadFilesToServer(juryApprovalFiles);
    }

    if (juryFlagFiles.length > 0) {
      uploadedJuryFlagDocs = await uploadFilesToServer(juryFlagFiles);
    }

    const FlagsPayload = {
      NominationFlagsID: flagBusinessJuryData?.NominationFlagsID || 0,
      NominationID: Number(nominationId),
      IsFlag: isJuryFlagged ? true: false,
      FlagReason: isJuryFlagged ? juryFlagComment : "",
      CreatedBy: userId,
      UpdatedBy: userId
    };

     const approvalPayload = {
       JuryApprovalsID: level2?.JuryApprovalsID || 0,  
       NominationID: Number(nominationId),
       BusinessJuryID: userId,
       IsBusinessJuryApproved: status === "Approved", 
       BusinessJuryComments: popupCommentsJury.trim(), 
       Active: true,
       CreatedBy: userId,
       UpdatedBy: userId
     };

   
    const attachmentsPayload = [
      ...existingJuryApprovalDocs
        .filter(doc => !doc.isDeleted)
        .map(doc => ({
          AttachmentsID: doc.AttachmentID || 0,
          NominationID: Number(nominationId),
          AttachmentType: 47,
          OriginalAttachmentName: doc.originalFileName,
          AttachmentFileType: doc.fileType || "",
          AttachmentSize: doc.fileSize || "",
          AttachmentNameGUID: doc.fileNameGUID,
          AttachmentPath: doc.fileUrl || "",
          CreatedBy: userId,
          UpdatedBy: userId
        })),

      ...uploadedJuryApprovalDocs.map(f => ({
        AttachmentsID: 0,
        NominationID: Number(nominationId),
        AttachmentType: 47,
        OriginalAttachmentName: f.originalFileName,
        AttachmentFileType: f.fileType || "",
        AttachmentSize: `${(f.fileSize / 1024).toFixed(2)} KB`,
        AttachmentNameGUID: f.fileNameGUID,
        AttachmentPath: f.fileUrl || "",
        CreatedBy: userId,
        UpdatedBy: userId
      })),

      ...(isJuryFlagged
        ? existingJuryFlagDocs
            .filter(doc => !doc.isDeleted)
            .map(doc => ({  
              AttachmentsID: doc.AttachmentID || 0,
              NominationID: Number(nominationId),
              AttachmentType: 48,
              OriginalAttachmentName: doc.originalFileName,
              AttachmentFileType: doc.fileType || "",
              AttachmentSize: doc.fileSize || "",
              AttachmentNameGUID: doc.fileNameGUID,
              AttachmentPath: doc.fileUrl || "",
              CreatedBy: userId,
              UpdatedBy: userId
            }))
        : []),

      ...(isJuryFlagged
        ? uploadedJuryFlagDocs.map(f => ({
            AttachmentsID: 0,
            NominationID: Number(nominationId),
            AttachmentType: 48,
            OriginalAttachmentName: f.originalFileName,
            AttachmentFileType: f.fileType || "",
            AttachmentSize: `${(f.fileSize / 1024).toFixed(2)} KB`,
            AttachmentNameGUID: f.fileNameGUID,
            AttachmentPath: f.fileUrl || "",
            CreatedBy: userId,
            UpdatedBy: userId
          }))
        : [])
    ];

    const finalPayload = {
    Scores: scores.map(s => ({
    // JuryScoresID: s.juryScoresID || 0, 
    NominationID: Number(nominationId),
    WeightageID: s.weightId,
    Score: Number(s.score),
    Comments: s.comment,
    CreatedBy: userId,
    UpdatedBy: userId
  })),
    Flags: FlagsPayload,
    Attachments: attachmentsPayload,
    ...(primaryfield === "IsPrimary" && { Approval: approvalPayload }),
  };
  console.log("Jury Final",finalPayload);

  const isUpdate = isEditMode;

    let res = await axios({
      method: isUpdate ? "put" : "post",
      url: isUpdate
        ? `${apiUrl}/api/businessjurylevelnomination/${nominationId}`
        : `${apiUrl}/api/businessjurylevelnomination`,
      data: finalPayload,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      params: {  EvalutionType: (primaryfield === "IsPrimary") ? 1 : 2  }
    });
    if (res.data > 0) {
        setSuccessMessage(
          isUpdate ? "Business Jury level updated successfully!" : "Business Jury level added successfully!"
        );
      } else {
        setErrorMessage("Operation failed");
      }
      setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
      }, 3000);
    fetchNominationDetails();
    handleCloseDrawer();
  }catch (err) {
    console.error("❌ SAVE ERROR:", err);
    setErrorMessage("Action failed. Please try again.");
  } finally {
    setLoading(false);
  }
};

const submitGrandJuryApproval = async () => {
  if (!validateEvaluation("grandJury")) return;

  try {
    setLoading(true);

    let uploadedGrandApprovalDocs: any[] = [];
    let uploadedGrandFlagDocs: any[] = [];

    if (grandApprovalFiles.length > 0) {
      uploadedGrandApprovalDocs = await uploadFilesToServer(grandApprovalFiles);
    }

    if (grandFlagFiles.length > 0) {
      uploadedGrandFlagDocs = await uploadFilesToServer(grandFlagFiles);
    }
    const flags = {
      NominationFlagsID: flagGrandJuryData?.NominationFlagsID || 0,
      NominationID: Number(nominationId),
      IsFlag: isGrandFlagged  ? true: false,
      FlagReason: isGrandFlagged  ? grandFlagComment  : "",
      CreatedBy: userId,
      UpdatedBy: userId
    };

    const approval = {
      JuryApprovalsID:level3.JuryApprovalsID,
      NominationID: Number(nominationId),
      PresidentID:userId,
      IsPresidentApproved: status === "Approved",
      PresidentComments: popupCommentsGrand,
      PresidentScore: grandScore ? Number(grandScore) : 0,
      Active:true,
      CreatedBy: userId,
      UpdatedBy: userId
    };

    const attachments = [
      ...existingGrandApprovalDocs
        .filter(doc => !doc.isDeleted)
        .map(doc => ({
          AttachmentsID: doc.AttachmentID || 0,
          NominationID: Number(nominationId),
          AttachmentType: 47,
          OriginalAttachmentName: doc.originalFileName,
          AttachmentFileType: doc.fileType || "",
          AttachmentSize: doc.fileSize || "",
          AttachmentNameGUID: doc.fileNameGUID,
          AttachmentPath: doc.fileUrl || "",
          CreatedBy: userId,
          UpdatedBy: userId
        })),

      ...uploadedGrandApprovalDocs.map(f => ({
        AttachmentsID: 0,
        NominationID: Number(nominationId),
        AttachmentType: 47,
        OriginalAttachmentName: f.originalFileName,
        AttachmentFileType: f.fileType || "",
        AttachmentSize: `${(f.fileSize / 1024).toFixed(2)} KB`,
        AttachmentNameGUID: f.fileNameGUID,
        AttachmentPath: f.fileUrl || "",
        CreatedBy: userId,
        UpdatedBy: userId
      })),

      ...(isGrandFlagged
        ? existingGrandFlagDocs
            .filter(doc => !doc.isDeleted)
            .map(doc => ({  
              AttachmentsID: doc.AttachmentID || 0,
              NominationID: Number(nominationId),
              AttachmentType: 48,
              OriginalAttachmentName: doc.originalFileName,
              AttachmentFileType: doc.fileType || "",
              AttachmentSize: doc.fileSize || "",
              AttachmentNameGUID: doc.fileNameGUID,
              AttachmentPath: doc.fileUrl || "",
              CreatedBy: userId,
              UpdatedBy: userId
            }))
        : []),

      ...(isGrandFlagged
        ? uploadedGrandFlagDocs.map(f => ({
            AttachmentsID: 0,
            NominationID: Number(nominationId),
            AttachmentType: 48,
            OriginalAttachmentName: f.originalFileName,
            AttachmentFileType: f.fileType || "",
            AttachmentSize: `${(f.fileSize / 1024).toFixed(2)} KB`,
            AttachmentNameGUID: f.fileNameGUID,
            AttachmentPath: f.fileUrl || "",
            CreatedBy: userId,
            UpdatedBy: userId
          }))
        : [])
    ];

    const payload = {
      Approval: approval,
      Flags: flags,
      Attachments: attachments
    };

    console.log("Grand Jury Payload", payload);

    const isUpdate = isEditMode;

    let res = await axios({
      method: isUpdate ? "put" : "post",
      url: isUpdate
        ? `${apiUrl}/api/grandjurylevelnomination/${nominationId}`
        : `${apiUrl}/api/grandjurylevelnomination`,
      data: payload,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      }
    });
    if (res.data > 0) {
        setSuccessMessage(
          isUpdate ? "Grand Jury level updated successfully!" : "Grand Jury level added successfully!"
        );
      } else {
        setErrorMessage("Operation failed");
      }

      setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 3000);
    fetchNominationDetails();
    closeGrandJuryDrawer();

  } catch (err) {
    console.error("❌ SAVE ERROR:", err);
    setErrorMessage("Action failed. Please try again.");
  } finally {
    setLoading(false);
  }
};

const handleReferralApprove = (ref: any) => {
  setSelectedReferral(ref);

  const isEdit = !!ref.ApprovedAt;
  setIsEditMode(isEdit);
  setRefStatus(ref.Status === "Rejected" ? "Rejected" : "Approved");
  setRefComments(ref.ApprovalComments || "");

  let parsedDocs: any[] = [];
  try {
    parsedDocs = ref.ApprovalAttachment || [];
  } catch {
    parsedDocs = [];
  }
  const docs = parsedDocs.map((file: any) => ({
    source: "api",
    AttachmentID: file.AttachmentsID,
    fileNameGUID: file.AttachmentNameGUID,
    originalFileName: file.OriginalAttachmentName,
    fileType: file.AttachmentFileType,
    fileUrl: file.AttachmentPath,
    fileSize: file.AttachmentSize
  }));

  setExistingRefDocs(docs);

  setOpenReferralPopup(true);
};

const submitReferral = async () => {
  try {
    setLoading(true);

    let uploadedDocs: any[] = [];

    if (refFiles.length > 0) {
      uploadedDocs = await uploadFilesToServer(refFiles);
    }

    const payload = {
      Approval: 
        {
          ReferralID: selectedReferral.ReferralID,
          NominationID: Number(nominationId),
          ReferralUserID: selectedReferral.ReferralUserID,
          IsReferralApproved: refStatus === "Approved",
          ApprovalComments: refComments,
          Active: true,
          UpdatedBy: userId
        },

      Flags: 
        {
          NominationFlagsID: 0,
          NominationID: Number(nominationId),
          IsFlag: false,
          FlagReason: "",
          CreatedBy: userId,
          UpdatedBy: userId
        },
    
      Attachments: [
        ...existingRefDocs
          .filter(doc => !doc.isDeleted)
          .map(doc => ({
            AttachmentsID: doc.AttachmentID || 0,
            NominationID: Number(nominationId),
            AttachmentType: 47, // ✅ FIXED
            OriginalAttachmentName: doc.originalFileName,
            AttachmentFileType: doc.fileType || "",
            AttachmentSize: doc.fileSize || "",
            AttachmentNameGUID: doc.fileNameGUID,
            AttachmentPath: doc.fileUrl || "",
            CreatedBy: userId,
            UpdatedBy: userId
          })),

        ...uploadedDocs.map(f => ({
          AttachmentsID: 0,
          NominationID: Number(nominationId),
          AttachmentType: 47, 
          OriginalAttachmentName: f.originalFileName,
          AttachmentFileType: f.fileType || "",
          AttachmentSize: `${(f.fileSize / 1024).toFixed(2)} KB`,
          AttachmentNameGUID: f.fileNameGUID,
          AttachmentPath: f.fileUrl || "",
          CreatedBy: userId,
          UpdatedBy: userId
        }))
      ]
    };

    console.log("REFERRAL PAYLOAD 👉", payload);

    const res = await axios({
      method: isEditMode ? "put" : "post",
      url: isEditMode
        ? `${apiUrl}/api/referrallevel/${selectedReferral.ReferralID}`
        : `${apiUrl}/api/referrallevel`,
      data: payload,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      }
    });

    if (res.data > 0) {
      setSuccessMessage(isEditMode ? "Referral Updated!" : "Referral Saved!");
    } else {
      setErrorMessage("Operation failed");
    }
    setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 3000);
    fetchNominationDetails();
    setOpenReferralPopup(false);

  } catch (err) {
    console.error("❌ REFERRAL SAVE ERROR:", err);
    setErrorMessage("Save failed");
  } finally {
    setLoading(false);
  }
};

const handleFilePreview = async (doc: any) => {
  const fileName = doc.originalFileName || doc.name;
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  try {
    if (doc.source === "api") {
      const response = await axios.get(
        `${apiUrl}/api/download?fileName=${doc.fileNameGUID}`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const blob = response.data;

      if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
        const url = URL.createObjectURL(blob);
        window.open(url);
      } 
      else if (ext === "pdf") {
        const pdfUrl = URL.createObjectURL(
          new Blob([blob], { type: "application/pdf" })
        );
        window.open(pdfUrl);
      } 
      else {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
      }
    }
    else {
      const file = doc.file;
      if (!(file instanceof File)) return;

      if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
        const url = URL.createObjectURL(file);
        window.open(url);
      } 
      else if (ext === "pdf") {
        const pdfUrl = URL.createObjectURL(
          new Blob([file], { type: "application/pdf" })
        );
        window.open(pdfUrl);
      } 
      else {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(file);
        link.download = file.name;
        link.click();
      }
    }
  } catch {
    alert("File not found");
  }
};

const getDocs = (item: any) => {
  if (!item?.ApprovalAttachment) return [];

  try {
    return typeof item.ApprovalAttachment === "string"
      ? JSON.parse(item.ApprovalAttachment)
      : item.ApprovalAttachment;
  } catch {
    return [];
  }
};

const openDocsPopup = (docs: any[]) => {
  setSelectedDocs(
    docs.map((d: any) => ({
      originalFileName: d.originalFileName || d.OriginalAttachmentName,
      fileNameGUID: d.fileNameGUID || d.AttachmentNameGUID,
      source: d.source || "api",
      file: d.file || null
    }))
  );
  setOpenDocPopup(true);
};

const openCommentPopup = (ref: any) => {
  setSelectedComment(ref.ApprovalComments || "No comments available");
  setOpenCommentsPopup(true);
};

const parsedFlagDocs = safeParse(level1?.FlagAttachment);
const parsedApprovalDocs = safeParse(level1?.ApprovalAttachment);
const parsedJuryFlagDocs = safeParse(level2?.FlagAttachment);
const parsedJuryApprovalDocs = safeParse(level2?.ApprovalAttachment);
const parsedGrandJuryFlagDocs = safeParse(level3?.FlagAttachment);
const parsedGranJuryApprovalDocs = safeParse(level3?.ApprovalAttachment);

return (
 <div className="bg-gray-100 p-6 pb-20">
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
    <div className="flex gap-6 items-start w-full">
     <div className="flex flex-col items-start gap-3">
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
    <table className="w-full text-sm border-collapse">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left">Nominee Name</th>
          <th className="px-4 py-3 text-left">Tenant</th>
          <th className="px-4 py-3 text-left">Department</th>
          <th className="px-4 py-3 text-left">Email ID</th>
          <th className="px-4 py-3 text-left">Approved Date</th>
          <th className="px-4 py-3 text-left">Status</th>
          <th className="px-4 py-3 text-left">Action</th>
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
            <td className="px-4 py-3">{ref.ApprovedAt}</td>
            <td><button
                  disabled={!isReferralEditable(ref)}
                  onClick={() => isReferralEditable(ref) && handleReferralApprove(ref)}
                  className={`px-4 py-1.5 rounded-lg text-sm border 
                  ${levelColors[ref.Status] || "bg-gray-50 border-gray-300"} 
                  ${levelTextColors[ref.Status] || "text-gray-700"}`}>
                  {ref.Status}
                </button></td>
            <td className="px-4 py-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded hover:bg-gray-100">
                    <Menu size={18} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end"
                  className="bg-white border border-[#08805e] rounded-md shadow-md p-1 min-w-[150px]">
                  <DropdownMenuItem
                    onClick={() =>
                      getDocs(ref).length > 0 && openDocsPopup(getDocs(ref))
                    }
                    className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs
                      hover:bg-gray-100 transition
                      ${getDocs(ref).length === 0
                        ? "text-gray-400 cursor-not-allowed pointer-events-none"
                        : "cursor-pointer"}`}>
                    
                    <Eye size={14} />
                    <span>
                      {getDocs(ref).length > 0 ? "View Documents" : "No Documents"}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      ref.ApprovalComments && openCommentPopup(ref)
                    }
                    className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs
                      hover:bg-gray-100 transition
                      ${!ref.ApprovalComments
                        ? "text-gray-400 cursor-not-allowed pointer-events-none"
                        : "cursor-pointer"}`}>
                    
                    <Eye size={14} />
                    <span>
                      {ref.ApprovalComments ? "View Comments" : "No Comments"}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
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
  {!isFlowStopped && !showReferral && (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6">
      <h2 className="text-base font-semibold mb-6">
        Nomination Status Flow
      </h2>
      {/* ================= LEVEL 1 ================= */}
      {showManager && level1 && (
        <div className="flex gap-4 relative">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
              <Check size={16} className="text-white" />
            </div>
            {approvalData?.[0].ApprovedAt==""?"": <div className="w-[2px] h-full bg-gray-300 mt-1"></div>} 
         </div>
          <div className="flex-1 pb-8">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium text-gray-900">
                {approvalData[0].ApprovalFlow} - {approvalData[0].ApprovalType}
              </p>
              <button
                  disabled={isManagerDisabled}
                  onClick={() => !isManagerDisabled && handleManagerApprove()}
                  className={`px-4 py-1.5 rounded-lg text-sm border 
                  ${levelColors[level1.Status] || "bg-gray-50 border-gray-300"} 
                  ${levelTextColors[level1.Status] || "text-gray-700"}`}>
                  {level1.Status}
                </button>
            </div>
            {approvalData?.[0].ApprovedAt==""?"":
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
                  <span className="font-medium">{approvalData?.[0].ApprovedAt}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-500">{Number(flagData?.Flag) === 1 ? "Flagged :" : "Not Flagged :"}</span>
                  <div className="flex items-center gap-2">
                    <Flag
                      size={16}
                      className={
                        Number(flagData?.Flag) === 1
                          ? "text-red-600 fill-red-600"
                          : "text-gray-400 fill-gray-300"
                      }/>
                  </div>
                </div>
                <div>
               {parsedFlagDocs?.length > 0 && (
                  <span
                    onClick={() => {
                      setSelectedDocs(
                        parsedFlagDocs.map((f: any) => ({
                          originalFileName: f.OriginalAttachmentName,
                          fileNameGUID: f.AttachmentNameGUID,
                          source: "api" 
                        }))
                      );
                      setOpenDocPopup(true);
                    }}
                    className="text-blue-600 cursor-pointer underline">
                    Flag Documents ({parsedFlagDocs.length})
                  </span>
               )}
                </div>
                <div>
                  {parsedApprovalDocs?.length > 0 && (
                    <span
                      onClick={() => {
                        setSelectedDocs(
                          parsedApprovalDocs.map((f: any) => ({
                            originalFileName: f.OriginalAttachmentName,
                            fileNameGUID: f.AttachmentNameGUID,
                            source: "api" 
                          }))
                        );
                        setOpenDocPopup(true);
                      }}
                      className="text-blue-600 cursor-pointer underline">
                      Approval Documents ({parsedApprovalDocs.length})
                    </span>
                  )}
                </div>
                <div>
                </div>
              </div>
              <div className="flex gap-12">
              <div>
                <span className="text-gray-500">Approval Comments :</span>
                <div className="font-medium mt-1 text-sm text-gray-600">
                  {displayApprovalComment}
                  {isApprovalTruncated && (
                    <button
                      onClick={() => setApprovalComments(!expandedApprovalComments)}
                      className="ml-1 text-blue-600 underline text-sm">
                      {expandedApprovalComments ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>
              </div>
            </div>
             <div className="flex gap-12">
              <div>
                {displayFlagReason==""?"":<span className="text-gray-500">Flag Reason :</span>}
                <div className="font-medium mt-1 text-sm text-gray-600">
                  {displayFlagReason}
                  {isFlagTruncated && (
                    <button
                      onClick={() => setExpandedFlagReason(!expandedFlagReason)}
                      className="ml-1 text-blue-600 underline text-sm">
                      {expandedFlagReason ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>
              </div>
            </div>
            </div>
            }
          </div>
        </div>
      )}
      {/* ================= LEVEL 2 ================= */}
      {showJury && level2 && (
        <div className="flex gap-4 relative">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
              <Check size={16} className="text-white" />
            </div>
              {approvalData[1].ApprovedAt==""?"":<div className="w-[2px] h-full bg-gray-300 mt-1"></div>}
          </div>
          <div className="flex-1 pb-8">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium text-gray-900">
                {approvalData[1].ApprovalFlow} - {approvalData[1].ApprovalType}
              </p>
              <div className="flex gap-3">
                {(primaryfield==="IsPrimary" || currentStage==="grand")&& (
                  <button
                   // onClick={() => setOpenEvaluation(true)}
                   onClick={() => setOpenEvaluation(true)}
                   
                   className="px-4 py-1.5 rounded-lg border border-blue-500 text-blue-600 text-sm hover:bg-blue-50">
                    View Business Jury Evaluations
                  </button>
                )}
                <button
                  disabled={isJuryDisabled}
                  onClick={() => !isJuryDisabled && handleJuryApprove()}
                  className={`px-4 py-1.5 rounded-lg text-sm border 
                  ${levelColors[approvalData[1].Status] || "bg-gray-50 border-gray-300"} 
                  ${levelTextColors[approvalData[1].Status] || "text-gray-700"}`}>
                  {approvalData[1].Status}
                </button>
              </div>
            </div>

             {isBusinesJuryDisplay?
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
              <div className="flex gap-12">
                <div>
                  <span className="text-gray-500">Name :</span>{" "}
                  <span className="font-medium">
                    {result.name}({result.dept})
                  </span>
                </div>
               
               {(primaryfield==="IsPrimary" || currentStage==="grand" )&&
                <div className="flex gap-12">
                  {approvalData[1].ApprovedAt!=""&&
                    <div>
                      <span className="text-gray-500">Approved Date :</span>{" "}
                      <span className="font-medium">{approvalData[1].ApprovedAt}</span>
                    </div>
                  }

                  <div>
                    <span className="text-gray-500">Total Jury Evaluations :</span>{" "}
                    <span className="font-medium">
                      {approvalData[1].EvaluatedJuries}/{approvalData[1].TotalEvalutions}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500">Average Score :</span>{" "}
                    <span className="font-medium">
                      {avgScore}
                    </span>
                  </div>

                 <div>
                  <span className="text-gray-500">Total Flag :</span>{" "}
                  <span className="font-medium">
                    {approvalData[1].TotalFlagCount}
                  </span>
                </div>

                </div>
}
              </div>
              <div className="flex gap-12">
                  <div className="flex gap-12">
                <div className="flex items-start gap-2">
                  <span className="text-gray-500">{Number(flagBusinessJuryData?.Flag) === 1 ? "Flagged :" : "Not Flagged :"}</span>
                  <div className="flex items-center gap-2">
                    <Flag
                      size={16}
                      className={
                        Number(flagBusinessJuryData?.Flag) === 1
                          ? "text-red-600 fill-red-600"
                          : "text-gray-400 fill-gray-300"
                      }/>
                  </div>
                </div>
                <div>
               {parsedJuryFlagDocs?.length > 0 && (
                  <span
                    onClick={() => {
                      setSelectedDocs(
                        parsedJuryFlagDocs.map((f: any) => ({
                          originalFileName: f.OriginalAttachmentName,
                          fileNameGUID: f.AttachmentNameGUID,
                          source: "api" 
                        }))
                      );
                      setOpenDocPopup(true);
                    }}
                    className="text-blue-600 cursor-pointer underline">
                    Flag Documents ({parsedJuryFlagDocs.length})
                  </span>
               )}
                </div>
                <div>
                  {parsedJuryApprovalDocs?.length > 0 && (
                    <span
                      onClick={() => {
                        setSelectedDocs(
                          parsedJuryApprovalDocs.map((f: any) => ({
                            originalFileName: f.OriginalAttachmentName,
                            fileNameGUID: f.AttachmentNameGUID,
                            source: "api" 
                          }))
                        );
                        setOpenDocPopup(true);
                      }}
                      className="text-blue-600 cursor-pointer underline">
                      Approval Documents ({parsedJuryApprovalDocs.length})
                    </span>
                  )}
                </div>
              </div>
              </div>

            {approvalData[1].ApprovedAt !="" &&
              <div className="flex gap-12">
                  <div>
                  <span className="text-gray-500">Approval Comments :</span>
                  <div className="font-medium mt-1 text-sm text-gray-600">
                    {displayJuryApprovalComment}
                    {isJuryApprovalTruncated && (
                      <button
                        onClick={() => setApprovalComments(!expandedApprovalComments)}
                        className="ml-1 text-blue-600 underline text-sm">
                        {expandedApprovalComments ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>
              </div>
            </div>
            }
              {approvalData[1].FlagReason!="" &&
              
             <div className="flex gap-12">
              <div>
               {displayJuryFlagReason==""?"":<span className="text-gray-500">Flag Reason :</span>}
                <div className="font-medium mt-1 text-sm text-gray-600">
                  {displayJuryFlagReason}
                  {isJuryFlagTruncated && (
                    <button
                      onClick={() => setExpandedFlagReason(!expandedFlagReason)}
                      className="ml-1 text-blue-600 underline text-sm">
                      {expandedFlagReason ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>
              </div>
            </div>
              }
            </div>
            :""
            }
          </div>
        </div>
      )}
      {/* ================= LEVEL 3 ================= */}
      {showGrand && level3 && (
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
                 disabled={isGrandDisabled}
                 onClick={() => !isGrandDisabled && handleGrandJuryApprove()}
                 className={`px-4 py-1.5 rounded-lg text-sm border 
                  ${levelColors[approvalData[2].Status] || "bg-gray-50 border-gray-300"} 
                  ${levelTextColors[approvalData[2].Status] || "text-gray-700"}`}>
                {approvalData[2].Status}
              </button>
            </div>
            {approvalData[2].ApprovedAt==""?"":
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
              <div className="flex gap-12">
                <div className="flex items-start gap-2">
                  <span className="text-gray-500">{Number(flagGrandJuryData?.Flag) === 1 ? "Flagged :" : "Not Flagged :"}</span>
                  <div className="flex items-center gap-2">
                    <Flag
                      size={16}
                      className={
                        Number(flagGrandJuryData?.Flag) === 1
                          ? "text-red-600 fill-red-600"
                          : "text-gray-400 fill-gray-300"
                      }/>
                  </div>
                </div>

                <div>
               {parsedGrandJuryFlagDocs?.length > 0 && (
                  <span
                    onClick={() => {
                      setSelectedDocs(
                        parsedGrandJuryFlagDocs.map((f: any) => ({
                          originalFileName: f.OriginalAttachmentName,
                          fileNameGUID: f.AttachmentNameGUID,
                          source: "api" 
                        }))
                      );
                      setOpenDocPopup(true);
                    }}
                    className="text-blue-600 cursor-pointer underline">
                    Flag Documents ({parsedGrandJuryFlagDocs.length})
                  </span>
               )}
                </div>

                <div>
                  {parsedGranJuryApprovalDocs?.length > 0 && (
                    <span
                      onClick={() => {
                        setSelectedDocs(
                          parsedGranJuryApprovalDocs.map((f: any) => ({
                            originalFileName: f.OriginalAttachmentName,
                            fileNameGUID: f.AttachmentNameGUID,
                            source: "api" 
                          }))
                        );
                        setOpenDocPopup(true);
                      }}
                      className="text-blue-600 cursor-pointer underline">
                      Approval Documents ({parsedGranJuryApprovalDocs.length})
                    </span>
                  )}
                </div>

              </div>
              <div className="flex gap-12">
                <div>
                <span className="text-gray-500">Approval Comments :</span>
                <div className="font-medium mt-1 text-sm text-gray-600">
                  {displayGrandJuryComment}
                  {isGrandJuryTruncated && (
                    <button
                      onClick={() => setApprovalComments(!expandedApprovalComments)}
                      className="ml-1 text-blue-600 underline text-sm">
                      {expandedApprovalComments ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>
             </div>
           </div>

             <div className="flex gap-12">
              <div>
                {displayGrandJuryFlagReason==""?"":<span className="text-gray-500">Flag Reason :</span>}
                <div className="font-medium mt-1 text-sm text-gray-600">
                  {displayGrandJuryFlagReason}
                  {isGrandJuryFlagTruncated && (
                    <button
                      onClick={() => setExpandedFlagReason(!expandedFlagReason)}
                      className="ml-1 text-blue-600 underline text-sm">
                      {expandedFlagReason ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>
              </div>
            </div>
            </div>      
            }
          </div>
        </div>
      )}
    </div>
    )}
    <div className="fixed bottom-0 left-0 w-full h-15 bg-white border-t border-gray-200 flex items-center pl-[260px] pr-6">
      <div className="flex justify-end space-x-4 ml-auto" >  
         <button onClick={handleBackward} className="flex items-center text-blue-600 bg-white border rounded-sm px-2 py-1 font-medium">
         <span className=""><ArrowLeft size={14}/></span> Back
          </button>
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
        {/* <div className="px-6 py-6 text-sm text-gray-800"> */}
        <div className="px-6 py-6 text-sm text-gray-800 overflow-y-auto h-[calc(100%-70px)]">
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
          </div>
           <div className="mb-[18px]">
            <div className="mt-4">
              <Label.Root className="block text-sm font-medium">
                Supporting Documents 
                <span className="text-red-500">(Maximum 5 files allowed & File must be below 2 MB)</span>
              </Label.Root>
              <label
                htmlFor="approvalUpload"
                className="inline-block bg-gray-100 text-gray-700 border border-gray-300 px-6 py-2 rounded cursor-pointer mt-2 hover:bg-gray-200">
                Choose File
              </label>
              <input
                id="approvalUpload"
                ref={approvalFileRef}
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, "approval")}
                className="hidden" />
              {approvalFileError  && <p className="text-red-500 text-sm mt-1">{approvalFileError }</p>}
            </div>         
           <div className="mt-3 flex flex-wrap gap-2">
              {approvalDocuments.map((doc: any, index: number) => (
                <div
                  key={doc.source === "api" ? doc.fileNameGUID : index}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg shadow-sm border">
                  <span
                    className="text-sm truncate max-w-[180px] cursor-pointer text-blue-600 hover:underline"
                    onClick={() => handleFilePreview(doc)}>
                    {doc.originalFileName || doc.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFile(doc, index, "approval")}
                    className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">
                    ×
                  </button>
                </div>
              ))}
            </div>
             </div> 
          <div className="flex items-center gap-2 mb-[18px]">
            <Flag size={18} className={isFlagged ? "text-red-600" : "text-gray-400"}/>
            <span className="font-medium">Flag :</span>
            <input type="checkbox" checked={isFlagged}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsFlagged(checked);
                if (checked) {
                  setAttachmentMode("flag");
                  setTimeout(() => textareaRef.current?.focus(), 100);
                } else {
                  setFlagComment("");
                  setAttachmentMode("approval");
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
            {isFlagged && (
          <>
          <div className="mt-4">
              <Label.Root className="block text-sm font-medium">
                Flag Documents 
                <span className="text-red-500">(Maximum 5 files allowed & File must be below 2 MB)</span>
              </Label.Root>
              <label
                htmlFor="flagUpload"
                className="inline-block bg-gray-100 text-gray-700 border border-gray-300 px-6 py-2 rounded cursor-pointer mt-2 hover:bg-gray-200">
                Choose File
              </label>
              <input
                id="flagUpload"
                ref={flagFileRef}
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, "flag")}
                className="hidden" />
              {flagFileError && <p className="text-red-500 text-sm mt-1">{flagFileError}</p>}
            </div>         
           <div className="mt-3 flex flex-wrap gap-2">
              {flagDocuments.map((doc: any, index: number) => (
                <div
                  key={doc.source === "api" ? doc.fileNameGUID : index}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg shadow-sm border">
                  <span
                    className="text-sm truncate max-w-[180px] cursor-pointer text-blue-600 hover:underline"
                    onClick={() => handleFilePreview(doc)}>
                    {doc.originalFileName || doc.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFile(doc, index, "flag")}
                    className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">
                    ×
                  </button>
                </div>
              ))}
            </div>
            </>
          )}        
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={closeApproveDrawer} 
              className="h-[42px] px-6 border border-gray-300 rounded-[6px] text-gray-700">
              Cancel
            </button>
            <button onClick={submitManagerApproval}
              className="h-[44px] px-8 rounded-md shadow btn-theme">
               {isEditMode ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>
     {/* <div
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
           <div className="text-sm">Total Evaluations</div>
            <div className="text-xl font-semibold">
              {attributeData?.EvaluatedJuries || 0}
            </div>
          </div>
          <div className="border border-gray-300 rounded-lg p-4 text-center bg-blue-50 text-blue-700">
           <div className="text-sm">Average Score</div>
            <div className="text-xl font-semibold">
             {avgScore || 0}
            </div>
          </div>
          <div className="border border-gray-300 rounded-lg p-4 text-center bg-red-50 text-red-700">
           <div className="text-sm">Flagged</div>
            <div className="text-xl font-semibold">
              {attributeData?.TotalFlagCount || 0}
            </div>
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
    </div>    */}
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
        {primaryfield=="IsPrimary" &&
        <div>
        <div className="mb-[18px] flex gap-4 items-end">
          <div className="flex-1">
            <label className="block mb-2 font-medium">
              Status
            </label>
            <select 
              value={juryStatus}
              onChange={(e) => setJuryStatus(e.target.value as "Approved" | "Rejected")}
              className="w-full h-[42px] px-3 border border-gray-300 rounded-[6px]">
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

        </div>
        <div className="mb-[18px]">
          <label className="block mb-2 font-medium">
            Comments
          </label>
          <textarea rows={3} value={popupCommentsJury}
            onChange={(e) => {
              const value = e.target.value;
              setPopupCommentsJury(value);
              if (value.trim()) {
                setJuryErrors((prev:any) => ({
                  ...prev,
                  comments: ""
                }));
              }
            }}
            placeholder="Enter your comments"
            className={`w-full px-3 py-2 border rounded-[6px]
              ${juryErrors.comments ? "border-red-500" : "border-gray-300"}`}/>
          {juryErrors.comments && (
            <p className="text-red-600 text-xs mt-1">{juryErrors.comments}</p>
          )}
        </div>
         <div className="mt-4">
              <Label.Root className="block text-sm font-medium">
                Supporting Documents 
                <span className="text-red-500">(Maximum 5 files allowed & File must be below 2 MB)</span>
              </Label.Root>
              <label
                htmlFor="juryUpload"
                className="inline-block bg-gray-100 text-gray-700 border border-gray-300 px-6 py-2 rounded cursor-pointer mt-2 hover:bg-gray-200">
                Choose File
              </label>
              <input
                id="juryUpload"
                ref={juryApprovalFileRef}
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, "juryApproval")}
                className="hidden" />
              {juryApprovalFileError && <p className="text-red-500 text-sm mt-1">{juryApprovalFileError}</p>}
         </div>  

          <div className="mt-3 flex flex-wrap gap-2">
              {approvalJuryDocuments.map((doc: any, index: number) => (
                <div
                  key={doc.source === "api" ? doc.fileNameGUID : index}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg shadow-sm border">
                  <span
                    className="text-sm truncate max-w-[180px] cursor-pointer text-blue-600 hover:underline"
                    onClick={() => handleFilePreview(doc)}>
                    {doc.originalFileName || doc.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFile(doc, index, "juryApproval")}
                    className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">
                    ×
                  </button>
                </div>
              ))}
          </div>  
        </div>
        }
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

         <div className="flex items-center gap-2 mb-[18px]">
            <Flag size={18} className={isJuryFlagged ? "text-red-600" : "text-gray-400"}/>
            <span className="font-medium">Flag :</span>
            <input type="checkbox" checked={isJuryFlagged}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsJuryFlagged(checked);
                if (checked) {
                  setAttachmentMode("juryFlag");
                  setTimeout(() => textareaRef.current?.focus(), 100);
                } else {
                  setJuryFlagComment("");
                  setAttachmentMode("juryApproval");
                  setPopupErrors(prev => ({ ...prev, flagComment: "" }));
                }
              }}
              className="w-4 h-4 mt-[1px] accent-red-600 cursor-pointer"/>
          </div>
            <textarea ref={textareaRef} rows={3} value={juryFlagComment}
              onChange={(e) => {
                const value = e.target.value;
                setJuryFlagComment(value);
                if (value.trim()) {
                  setPopupErrors(prev => ({ ...prev, juryFlagComment: "" }));
                }
              }}
              disabled={!isJuryFlagged}
              placeholder="Flagged reason here"
              className={`w-full px-3 py-2 rounded-[6px]
                ${isJuryFlagged
                  ? "border border-red-300 bg-red-50"
                  : "border border-gray-200 bg-gray-100 cursor-not-allowed"}`}/>
            {juryErrors.comments && (
              <p className="text-red-600 text-xs mt-1">
                {juryErrors.comments}
              </p>
            )}
            {isJuryFlagged && (
          <>
          <div className="mt-4">
              <Label.Root className="block text-sm font-medium">
                Flag Documents 
                <span className="text-red-500">(Maximum 5 files allowed & File must be below 2 MB)</span>
              </Label.Root>
              <label
                htmlFor="juryflagUpload"
                className="inline-block bg-gray-100 text-gray-700 border border-gray-300 px-6 py-2 rounded cursor-pointer mt-2 hover:bg-gray-200">
                Choose File
              </label>
              <input
                id="juryflagUpload"
                ref={juryFlagFileRef}
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, "juryFlag")}
                className="hidden" />
              {juryFlagFileError && <p className="text-red-500 text-sm mt-1">{juryFlagFileError}</p>}
            </div>         
           <div className="mt-3 flex flex-wrap gap-2">
              {flagJuryDocuments.map((doc: any, index: number) => (
                <div
                  key={doc.source === "api" ? doc.fileNameGUID : index}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg shadow-sm border">
                  <span
                    className="text-sm truncate max-w-[180px] cursor-pointer text-blue-600 hover:underline"
                    onClick={() => handleFilePreview(doc)}>
                    {doc.originalFileName || doc.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFile(doc, index, "juryFlag")}
                    className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">
                    ×
                  </button>
                </div>
              ))}
            </div>
            </>
          )} 
            
        <div className="flex justify-end gap-3 pt-6">
           <button
              onClick={handleCloseDrawer} 
              className="h-[42px] px-6 border border-gray-300 rounded-[6px] text-gray-700">
              Cancel
            </button>
            <button  onClick={submitJuryApproval}
              className="h-[44px] px-8 rounded-md shadow btn-theme">                
              {isEditMode ? "Update" : "Save"}
            </button>
        </div>
      </div>
    </div>
     <div className={`fixed top-0 right-0 h-full w-[680px] bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${openGrandJuryEvaluation ? "translate-x-0" : "translate-x-full"}
        `}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-[16px] font-semibold text-gray-900">
            Level 3 - Grand Jury
          </h2>
          <button onClick={closeGrandJuryDrawer}>
            <X size={20} />
          </button>
        </div>
        {/* <div className="px-6 py-6 text-sm text-gray-800"> */}
        <div className="px-6 py-6 text-sm text-gray-800 overflow-y-auto h-[calc(100%-70px)]">
          <div className="mb-[18px] flex gap-4 items-end">
            {/* Status - Left Side */}
            <div className="flex-1">
              <label className="block mb-2 font-medium">
                Status
              </label>
              <select 
                value={grandStatus}
                onChange={(e) => setGrandStatus(e.target.value as "Approved" | "Rejected")}
                className="w-full h-[42px] px-3 border border-gray-300 rounded-[6px]">
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Score - Right Side */}
            <div className="w-[120px]">
              <span className="text-gray-500 text-sm">Score</span>
              <input
                type="number"
                min={1}
                max={100}
                value={grandScore}
                onChange={(e) => {
                  const val = e.target.value;
                  setGrandScore(val);
                  if(val.trim()){
                    setGrandErrors((prev:any)=>({
                      ...prev,
                      score:""
                    }));
                  }
                }}
                className="w-full h-[42px] px-3 border border-gray-300 rounded-[6px] text-center"
              />
            </div>
          </div>
          
          <div className="mb-[18px]">
            <label className="block mb-2 font-medium">
              Comments
            </label>
            <textarea rows={3} value={popupCommentsGrand}
              onChange={(e) => {
                const value = e.target.value;
                setPopupCommentsGrand(value); 
              }}
              placeholder="Enter your comments"
              className={`w-full px-3 py-2 border rounded-[6px]
                ${popupErrors.comments ? "border-red-500" : "border-gray-300"}`}/>
            {popupErrors.comments && (
              <p className="text-red-600 text-xs mt-1">{popupErrors.comments}</p>
            )}
          </div>
           <div className="mb-[18px]">
            <div className="mt-4">
              <Label.Root className="block text-sm font-medium">
                Supporting Documents 
                <span className="text-red-500">(Maximum 5 files allowed & File must be below 2 MB)</span>
              </Label.Root>
              <label
                htmlFor="grandUpload"
                className="inline-block bg-gray-100 text-gray-700 border border-gray-300 px-6 py-2 rounded cursor-pointer mt-2 hover:bg-gray-200">
                Choose File
              </label>
              <input
                id="grandUpload"
                ref={grandApprovalFileRef}
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, "grandApproval")}
                className="hidden" />
              {grandApprovalFileError  && <p className="text-red-500 text-sm mt-1">{grandApprovalFileError }</p>}
            </div>         
           <div className="mt-3 flex flex-wrap gap-2">
              {approvalGrandDocuments.map((doc: any, index: number) => (
                <div
                  key={doc.source === "api" ? doc.fileNameGUID : index}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg shadow-sm border">
                  <span
                    className="text-sm truncate max-w-[180px] cursor-pointer text-blue-600 hover:underline"
                    onClick={() => handleFilePreview(doc)}>
                    {doc.originalFileName || doc.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFile(doc, index, "grandApproval")}
                    className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">
                    ×
                  </button>
                </div>
              ))}
            </div>
           </div> 
          <div className="flex items-center gap-2 mb-[18px]">
            <Flag size={18} className={isGrandFlagged ? "text-red-600" : "text-gray-400"}/>
            <span className="font-medium">Flag :</span>
            <input type="checkbox" checked={isGrandFlagged}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsGrandFlagged(checked);
                if (checked) {
                  setAttachmentMode("grandFlag");
                  setTimeout(() => textareaRef.current?.focus(), 100);
                } else {
                  setGrandFlagComment("");
                  setAttachmentMode("grandApproval");
                  setPopupErrors(prev => ({ ...prev, flagComment: "" }));
                }
              }}
              className="w-4 h-4 mt-[1px] accent-red-600 cursor-pointer"/>
          </div>
            <textarea ref={textareaRef} rows={3} value={grandFlagComment}
              onChange={(e) => {
                const value = e.target.value;
                setGrandFlagComment(value);
                if (value.trim()) {
                  setPopupErrors(prev => ({ ...prev, flagComment: "" }));
                }
              }}
              disabled={!isGrandFlagged}
              placeholder="Flagged reason here"
              className={`w-full px-3 py-2 rounded-[6px]
                ${isGrandFlagged
                  ? "border border-red-300 bg-red-50"
                  : "border border-gray-200 bg-gray-100 cursor-not-allowed"}`}/>
            {popupErrors.flagComment && (
              <p className="text-red-600 text-xs mt-1">
                {popupErrors.flagComment}
              </p>
            )}
            {isGrandFlagged && (
          <>
          <div className="mt-4">
              <Label.Root className="block text-sm font-medium">
                Flag Documents 
                <span className="text-red-500">(Maximum 5 files allowed & File must be below 2 MB)</span>
              </Label.Root>
              <label
                htmlFor="grandflagUpload"
                className="inline-block bg-gray-100 text-gray-700 border border-gray-300 px-6 py-2 rounded cursor-pointer mt-2 hover:bg-gray-200">
                Choose File
              </label>
              <input
                id="grandflagUpload"
                ref={grandFlagFileRef}
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, "grandFlag")}
                className="hidden" />
              {flagFileError && <p className="text-red-500 text-sm mt-1">{flagFileError}</p>}
            </div>         
           <div className="mt-3 flex flex-wrap gap-2">
              {flagGrandDocuments.map((doc: any, index: number) => (
                <div
                  key={doc.source === "api" ? doc.fileNameGUID : index}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg shadow-sm border">
                  <span
                    className="text-sm truncate max-w-[180px] cursor-pointer text-blue-600 hover:underline"
                    onClick={() => handleFilePreview(doc)}>
                    {doc.originalFileName || doc.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFile(doc, index, "grandFlag")}
                    className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">
                    ×
                  </button>
                </div>
              ))}
            </div>
            </>
          )}        
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={closeGrandJuryDrawer} 
              className="h-[42px] px-6 border border-gray-300 rounded-[6px] text-gray-700">
              Cancel
            </button>
            <button onClick={submitGrandJuryApproval}
              className="h-[44px] px-8 rounded-md shadow btn-theme">
               {isEditMode ? "Update" : "Save"}
            </button>
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
    {openReferralPopup && (
      <div
        className={`fixed top-0 right-0 h-full w-[680px] bg-white shadow-2xl z-50
        transform transition-transform duration-300 ease-in-out
        ${openReferralPopup ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-[16px] font-semibold text-gray-900">
            Referral Approval
          </h2>
          <button onClick={closeApproveDrawer}>
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-6 text-sm text-gray-800 overflow-y-auto h-[calc(100%-70px)]">
          <div className="mb-[18px]">
            <label className="block mb-2 font-medium">Status</label>
            <select
              value={refStatus}
              onChange={(e) =>
                setRefStatus(e.target.value as "Approved" | "Rejected")
              }
              className="w-full h-[42px] px-3 border border-gray-300 rounded-[6px]">
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="mb-[18px]">
            <label className="block mb-2 font-medium">Comments</label>
            <textarea
              rows={3}
              value={refComments}
              onChange={(e) => setRefComments(e.target.value)}
              placeholder="Enter your comments"
              className="w-full px-3 py-2 border rounded-[6px] border-gray-300"/>
          </div>
          <div className="mb-[18px]">
            <Label.Root className="block text-sm font-medium">
              Supporting Documents
              <span className="text-red-500">
                (Max 5 files & below 2MB)
              </span>
            </Label.Root>
            <label
              htmlFor="refUpload"
              className="inline-block bg-gray-100 text-gray-700 border border-gray-300 px-6 py-2 rounded cursor-pointer mt-2 hover:bg-gray-200">
              Choose File
            </label>
            <input
              id="refUpload"
              ref={refFileRef}
              type="file"
              multiple
              onChange={(e) => handleFileUpload(e, "referral")}
              className="hidden"/>
              {refFileError && <p className="text-red-500 text-sm mt-1">{refFileError}</p>}
           <div className="mt-3 flex flex-wrap gap-2">
              {referralDocuments.map((doc: any, index: number) => (
                <div
                  key={doc.source === "api" ? doc.fileNameGUID : index}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg shadow-sm border">
                  <span
                    className="text-sm truncate max-w-[180px] cursor-pointer text-blue-600 hover:underline"
                    onClick={() => handleFilePreview(doc)}>
                    {doc.originalFileName || doc.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(doc, index, "referral")}
                    className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={closeApproveDrawer}
              className="h-[42px] px-6 border border-gray-300 rounded-[6px]">
              Cancel
            </button>
            <button
              onClick={submitReferral}
              className="h-[44px] px-8 rounded-md shadow btn-theme">
              {isEditMode ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>
    )}
   {openDocPopup && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white w-[500px] rounded-lg shadow-lg p-5">
          
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Documents</h3>
            <button onClick={() => setOpenDocPopup(false)}>✕</button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-auto">
            {selectedDocs.map((doc: any) => (
              <div
                key={doc.fileNameGUID}
                className="border rounded px-3 py-2 hover:bg-gray-50">
                
                <span
                  onClick={() => handleFilePreview(doc)}
                  className="text-blue-600 cursor-pointer hover:underline">
                  {doc.originalFileName}
                </span>

              </div>
            ))}
          </div>

        </div>
      </div>
    )}
    {openCommentsPopup && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white w-[500px] rounded-lg shadow-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Comments</h3>
            <button onClick={() => setOpenCommentsPopup(false)}>✕</button>
          </div>
          <div className="max-h-[300px] overflow-auto border rounded p-3 bg-gray-50">
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {selectedComment}
            </p>
          </div>
        </div>
      </div>
    )}
    <BusinessJuryEvaluation
      openEvaluation={openEvaluation}
      setOpenEvaluation={setOpenEvaluation}
      juryList={juryList}
      attributeData={attributeData}
      avgScore={avgScore}
       level={level2.FlagAttachment}
    />
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
