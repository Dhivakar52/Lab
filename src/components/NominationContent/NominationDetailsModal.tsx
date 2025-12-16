import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useState, useEffect } from "react";
import { useAuth } from "../ContextAPI/AuthContext";
import axios from "axios";
import StatusFlow from "../StatusFlow";

//import { data } from 'react-router-dom';

interface NominationDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  //onRefresh: () => void;
  data: {
    nominationId: string;
    nominee: string;
    entity: string;
    category: string;
    nominatedBy: string;
    submissionDate: string;
    contestType: string;
    status: string;
    managerEmail: string;
    referrals: string[];
    description: string | undefined;
    managerEmailID : string;
    "Referrals ID": {
    Email: string;
    TenantName: string;
    DeptName: string;
    ReferralName:string;
    ReferralStatus:string;
  }[];

  "Supporting Documents": {
    OriginalFileName: string;
    FileType: string;
    FileNameGUID: string;
    FilePath: string;
  }[];
  "ApprovalStatus": {
   Status: string;
  ApprovalType: string;
  ApprovalFlow: string;
  }[];
  };
  setSuccessMessage: React.Dispatch<React.SetStateAction<string>>;
}
const apiUrl = import.meta.env.VITE_API_URL;

const NominationDetailsModal: React.FC<NominationDetailsProps> = ({ isOpen, onClose, onRefresh, data, setSuccessMessage }) => {
  console.log("Nomination Details Modal Data : ", data);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const { authToken, userId } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const referrals = data["Referrals ID"] || [];
  const visibleReferrals = expanded ? referrals : referrals.slice(0, 3);
  const toggleExpanded = () => setExpanded(!expanded);
  useEffect(() => {
    if (isOpen) {
    setExpanded(false);
    setExpandedDescription(false);
    }
  }, [isOpen]);

  const description = data.description?.trim() || "No description provided";
  const maxLength = 300; 
  const isTruncated = description.length > maxLength;
  const displayText = expandedDescription || !isTruncated 
    ? description 
    : description.slice(0, maxLength) + "...";
  const handleWithdraw = async () => {
  try {
    const payload = {
    nomination: {
    cycleID: 0,
    awardCategoryID:  0,
    nominationTitle:  "",
    userID: userId,
    isSelf: true,
    nominationCreatedBy:  0,
    descriptions:  "",
    approvalTypeID:  0,
    isManagerApproved:  false,
    approvalComments:  "",
    statusID: 0,
    active: false,   
    businessJuryID:  0,
    createdBy: 0,
    updatedBy: userId
  },
  referralIDs: data["Referrals ID"]?.map(ref => ({
    referralID: 0,
    nominationID: 0,
    referralUserID:  0,
    isReferralApproved: true,
    approvalComments:  "",
    active: true,
    createdBy: 0,
    updatedBy: 0
  })) || [],
  
  documents: data["Supporting Documents"]?.map(doc => ({
    nominationFileID:  0,
    nominationID: 0,
    originalFileName: 0,
    fileType: 0,
    fileSize:  "",
    fileNameGUID: 0,
    filePath: "",
    active: true,
    createdBy: 0,
    updatedBy: 0
  })) || []
};
    const res = await axios.delete(
      `${apiUrl}/api/nominations/${data.nominationId}`,
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
    onRefresh();
    //setShowSuccessModal(true); 

  } catch (error) {
    console.error("Withdraw failed:", error);
    alert("Failed to withdraw nomination");
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
    const fallbackUrl = "File not found"; 

const approvalFlow = data?.ApprovalStatus?.map(a => ({
  type: a.ApprovalType,
  status: a.Status,
  level: a.ApprovalFlow
})) ?? [];

const hasFinalStatus = approvalFlow.some(s =>
  s.status === "Approved" || s.status === "Rejected"
);

  return (
      <>
    <Dialog.Root
  open={isOpen}
  onOpenChange={(open) => { if (!open) { onClose(); } }}>
     {/* <Dialog.Root open={isOpen} onOpenChange={onClose}> */}
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/10" />
        
        {/* Slide-over panel */}
          <Dialog.Content className="fixed top-0 right-0 h-full w-full max-w-3xl bg-white border-l border-gray-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Nomination Details
            </Dialog.Title>
            <Dialog.Close className="p-1 rounded-md hover:bg-gray-100 transition-colors">
              <X size={20} className="text-gray-500" />
            </Dialog.Close>
          </div>

          {/* Content */}
          {/* <div className="px-6 py-6"> */}
          <div className="px-6 py-6 flex-1 overflow-y-auto">
            <div className="space-y-4">
              {/* Row 1 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Nominee</div>
                  <div className="text-sm text-gray-600">{data.nominee}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Tenant</div>
                  <div className="text-sm text-gray-600">{data.entity}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Category</div>
                  <div className="text-sm text-gray-600">{data.category}</div>
                </div>
              </div>
              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-4">
                
              </div>
              {/* Row 3 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Nominated By</div>
                  <div className="text-sm text-gray-600">{data.nominatedBy}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Submission Date</div>
                  <div className="text-sm text-gray-600">{data.submissionDate}</div>
                </div>
                <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-900">Status</div>
                    <div className="flex">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          data.status === "Pending"
                            ? "bg-orange-100 text-orange-800"
                            : data.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : data.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : data.status === "Under Review"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                        {data.status}
                      </span>
                    </div>
                  </div>
              </div>
               {/* Row 4 */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  {/* <div className="text-sm font-medium text-gray-900">Nomination Status Flow</div> */}
                  <StatusFlow steps={approvalFlow} />
                </div>
              </div>
              {/* Row 5 */}
              <div className="grid grid-cols-3 gap-8">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Reporting To</div>
                  <div className="text-sm text-gray-600">{data.managerEmail}</div>
                </div>
                {/* <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Manager Email ID</div>
                  <div className="text-sm text-gray-600">{data.managerEmailID}</div>
                </div> */}
              </div> 
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
                <span className="px-2 text-gray-500"> </span>
                <span className={`px-3 py-1 text-xs border rounded-full font-medium
                ${ref.ReferralStatus === "Approved" ? "bg-green-100 text-green-800 border-green-300" :
                ref.ReferralStatus === "Rejected" ? "bg-red-100 text-red-800 border-red-300" :
                ref.ReferralStatus === "Pending" ? "bg-orange-100 text-orange-800 border-red-300" :
                ref.ReferralStatus === "Under Review" ? "bg-yellow-100 text-yellow-800 border-yellow-300" :
               "bg-gray-100 text-gray-700 border-gray-300"} `}>
               {ref.ReferralStatus}</span>
              </p>
            </div>
          ))}
          {referrals.length > 3 && (
            <p className="text-sm text-blue-500 cursor-pointer"
              onClick={toggleExpanded} >
              {expanded ? "less" : `+${referrals.length - 3} more`}
            </p>
          )}
        </>
      ) : (
        <p className="text-gray-500 text-sm">No referral details available</p>
      )}
    </div>
              {/* Description - Full width */}
               <div className="space-y-1">
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
              {/* <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Description</div>
                <div className="text-sm text-gray-600">{data.description && data.description.trim() !== ""
                ? data.description : "No description provided"}</div>
              </div> */}
              {/* Supporting Documents */}
            <div>
            <div className="text-sm font-medium text-gray-900">Supporting Documents</div>
            <div className="mt-2 space-y-2">
  {data["Supporting Documents"]?.length ? (
    data["Supporting Documents"].map((doc, i) => {
      return (
        <div
  key={i}
  className="flex items-center gap-3 text-blue-600 cursor-pointer hover:underline"
  onClick={async () => {
  const ext = doc.OriginalFileName.split('.').pop()?.toLowerCase() || "";
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
    if (["xls", "xlsx"].includes(ext)) {
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = doc.OriginalFileName; 
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    }
    if (["doc", "docx", "csv"].includes(ext)) {
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
    // setPreviewType("error");
    // setPreviewFile(fallbackUrl);
    // setPreviewOpen(true);
  }
}}
>
  <img src={getFileIcon(doc.OriginalFileName)} className="w-6 h-6"/>
  <span>{doc.OriginalFileName}</span>
</div>
      );
    })
  ) : (
    <p className="text-gray-500 text-sm">No documents uploaded</p>
  )}
</div>
             </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-white">
          {!hasFinalStatus && (
             <button onClick={() => setIsWithdrawDialogOpen(true)}
             className="px-2 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition flex items-center">
             Withdraw </button>
             )}
          </div>
         {/* <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-white">
            {data.status !== "Approved" && (
            <button 
             onClick={() => setIsWithdrawDialogOpen(true)}
            className="px-2 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition flex items-center"> Withdraw </button>
            )}
            </div>  */}
        </Dialog.Content>
         {/* Withdraw Confirmation Dialog */}
       {isWithdrawDialogOpen && (
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/20" />
    <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-md shadow-lg">
      <Dialog.Title className="text-center text-lg font-semibold text-gray-900">
        Are you sure you want to withdraw this nomination?
      </Dialog.Title>
      <div className="mt-6 flex justify-center gap-4">
        <button onClick={() => setIsWithdrawDialogOpen(false)}
          className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100">No
        </button>
        <button onClick={handleWithdraw}
          className="px-3 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700">Yes
        </button>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
)}
{previewOpen && (
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/40" />

    <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] h-[80%] max-w-3xl -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-xl overflow-hidden">

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
)}
      </Dialog.Portal>
    </Dialog.Root>
  </>
  );
};

export default NominationDetailsModal;