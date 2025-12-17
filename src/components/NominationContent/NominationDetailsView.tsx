import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { X, ArrowLeft } from "lucide-react";
import StatusFlow from "../StatusFlow";
import { useAuth } from "../ContextAPI/AuthContext";
import * as Dialog from "@radix-ui/react-dialog";
import { useLocation } from "react-router-dom";

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
};
interface ReferralItem {
  ReferralID: number;
}
const NominationDetailView: React.FC<NominationDetailViewProps> = ({
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
  const location = useLocation();
  const from = location.state?.from;
  const tab = location.state?.tab;

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
      console.log("sucess",res.data)
      setReferrals(result["Referrals ID"] || []);
      setDocuments(result["Supporting Documents"]|| []);
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
//  const handleBackward = () => {
//   navigate("/my-nominations");
//   };
  const handleBackward = () => {
  if (from === "my-nominations") {
    navigate("/my-nominations");
  } 
  else if (from === "other-nominations") {
    navigate("/my-nominations", { state: { tab: tab || "form" } });
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
    onClose(); 
    setSuccessMessage("Nomination Withdrawn Successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
    //setShowSuccessModal(true); 

  } catch (error) {
    console.error("Withdraw failed:", error);
    alert("Failed to withdraw nomination");
  }
};

  
return (
  <div className="min-h-screen bg-gray-100 flex flex-col">
    {/* Fixed Header */}
    <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0 sticky top-0 z-20 shadow-sm">
      <h1 className="text-2xl font-semibold">Nomination Details</h1>
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
                data.Status === "Pending"
                  ? "bg-orange-100 text-orange-800"
                  : data.Status === "Approved"
                  ? "bg-green-100 text-green-800"
                  : data.Status === "Rejected"
                  ? "bg-red-100 text-red-800"
                  : data.Status === "Under Review"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {data.Status}
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
      </div>
    </div>

    {/* Fixed Footer */}
    <div className="bg-white border-t border-gray-200 px-6 py-4 shrink-0 sticky bottom-0 z-20 shadow-sm">
      <div className="flex justify-end gap-3">
        <button
          onClick={handleBackward}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back
        </button>

        {!hasFinalStatus && (
          <button
            onClick={() => setIsWithdrawDialogOpen(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Withdraw
          </button>
        )}
      </div>
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


export default NominationDetailView;

