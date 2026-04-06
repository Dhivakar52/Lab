import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Edit, X, ArrowLeft, Menu, Eye } from "lucide-react";
import { useAuth } from "../ContextAPI/AuthContext";
import * as Dialog from "@radix-ui/react-dialog";
import { useLocation } from "react-router-dom";
import { User, Building2, Tag, 
  CalendarDays, FileText, Mail, BadgeCheck } from "lucide-react";
import { levelColors, levelTextColors } from "../../statusColors.ts";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

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
// type ApprovalFlowItem = {
//   type: string;
//   status: string;
//   level: string;
//   comments?: string;
//   approvedAt:string;
//   score:string;
// };

const NominationDetailView: React.FC<NominationDetailViewProps> = ({
 isOpen}) => {
  const { nominationId } = useParams<{ nominationId: string }>();
  const navigate = useNavigate();
  const { authToken, userId } = useAuth();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [data, setData] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [_documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const visibleReferrals = expanded ? referrals : referrals.slice(0, 3);
  const location = useLocation();
  const from = location.state?.from;
  //const tab = location.state?.tab;
  const withdrawAllowedFrom = ["nominations"];
    const [_selectedReferral, setSelectedReferral] = useState<any>(null);
    const [_refStatus, setRefStatus] = useState<"Approved" | "Rejected">("Approved");
    const [_refComments, setRefComments] = useState("");
    const [_existingRefDocs, setExistingRefDocs] = useState<any[]>([]);
    const [_isEditMode, setIsEditMode] = useState(false);
    const [_openReferralPopup, setOpenReferralPopup] = useState(false);
    const [_selectedDocs, setSelectedDocs] = useState<any[]>([]);
    const [_openDocPopup, setOpenDocPopup] = useState(false);
    const [selectedComment, setSelectedComment] = useState("");
    const [openCommentsPopup, setOpenCommentsPopup] = useState(false);

   const [IsSelf, setIsSelf] = useState<boolean | null>(null);
  //const fileInputRef = useRef<HTMLInputElement | null>(null);

  //const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  // const [form, setForm] = useState<FormState>({
  //     title: "",
  //     nomineeName:"",
  //     department: "",
  //     email: "",
  //     nomineeData:"",
  //     mobile: "",
  //     managerEmail: "",
  //     contestType: "",
  //     description: "",
  //     files: [], 
  //     file: null as File | null,
  //   });    
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
 
//   const approvalFlow: ApprovalFlowItem[] = (data?.ApprovalStatus || []).map(
//   (a: any) => ({
//     type: a.ApprovalType,
//     status: a.Status,
//     level: a.ApprovalFlow,
//     comments: a.ApprovalComments,
//     approvedAt: a.ApprovedAt,
//     score:a.ApprovalScore,
//   })
// );

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

const handleEdit = () => {
  const id = location.pathname.split("/").pop();  
  if (IsSelf) {
      navigate(`/self-nominations/${id}`);
    } else {
      navigate(`/my-nominations/add-nomination/${id}`);
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

const getCleanStatus = (status?: string) => {
  if (!status) return "";
  const dashIndex = status.indexOf("-");
  return dashIndex >= 0
    ? status.substring(dashIndex + 1).trim()
    : status.trim();
};
const mainStatus = getCleanStatus(data.Status);
const showWithdrawButton =
  withdrawAllowedFrom.includes(from) &&
  !["approved", "rejected"].includes(mainStatus.toLowerCase());
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
     <table className="w-full text-sm border-collapse">
       <thead className="bg-gray-50">
         <tr>
           <th className="px-4 py-3 text-left">Nominee Name</th>
           <th className="px-4 py-3 text-left">Tenant</th>
           <th className="px-4 py-3 text-left">Department</th>
           <th className="px-4 py-3 text-left">Email ID</th>
           <th className="px-4 py-3 text-left">Approved Date</th>
           {/* <th className="px-4 py-3 text-left">Comments</th> */}
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
             <td className="px-4 py-s3">{ref.Email}</td>
             <td className="px-4 py-3">{ref.ApprovedAt}</td>
             {/* <td className="px-4 py-3">{ref.ApprovalComments}</td> */}
             <td><button
                   onClick={() => handleReferralApprove(ref)}
                   className={`px-4 py-1.5 rounded-lg text-sm border 
                   ${levelColors[ref.ReferralStatus] || "bg-gray-50 border-gray-300"} 
                   ${levelTextColors[ref.ReferralStatus] || "text-gray-700"}`}>
                   {ref.ReferralStatus}
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
 
export default NominationDetailView;
