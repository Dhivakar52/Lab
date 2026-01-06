import * as Label from "@radix-ui/react-label";
import { useEffect, useState,useRef } from "react";
import { Outlet } from "react-router-dom";
import axios from "axios";
import type { FormState } from "../../dataTypes/nomination";
import { useAuth } from "../ContextAPI/AuthContext";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react"; 
import Pagination from "../Pagination";

// interface OptionType {
//   value: number;
//   label: string;
// }
interface UploadedDocument {
  originalFileName: string;
  fileType: string;
  fileSize: number;
  fileNameGUID: string;
  fileUrl: string;
}
type ExistingDoc = {
  fileNameGUID: string;
  originalFileName: string;
  fileType: string;
  fileSize: string;
  filePath: string;
  source: "api";
  isDeleted: boolean;   
};
type NewDoc = {
  file: File;
  source: "local";
};
type Referral = {
  userId: number;
  isRemoved: boolean;
};

const apiUrl = import.meta.env.VITE_API_URL;

export default function AddNomination() {
  // const [referrals, setReferrals] = useState([
  //   "sathishkumar312@srm.com",
  //   "kumaran@srm.com",
  //   "manikandan@srm.com",
  // ]);
  
  const [contest, setContest]= useState([]);
  const [users, setUsers] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const {  authToken, userId } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { nominationId } = useParams<{ nominationId: string }>();
  const isEditMode = Boolean(nominationId);
  const [existingDocs, setExistingDocs] = useState<any[]>([]);
  const navigate = useNavigate();
  const isReadOnly = isEditMode;


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
//  const [nominee, setNominee] = useState("");
//   const [category, setCategory] = useState("");
//   const [entity, setEntity] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [fileError, setFileError] = useState("");
  const [totalSelfNominations, setTotalSelfNominations] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const validateForm = () => {
  const newErrors: { [key: string]: string } = {};

  if (!form.title.trim()) newErrors.title = "Title is required.";
  if (!form.contestType) newErrors.contestType = "Contest type is required.";
  //if (referrals.length < 3) newErrors.referrals = "Please select atleast 3 referrals.";

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
useEffect(() => {
  if (!isEditMode || !authToken) return;

  const fetchNominationById = async () => {
    try {
      const res = await axios.get(
        `${apiUrl}/api/nominations/${nominationId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const data = res.data[0];
      console.log("sucess",res.data)

      setForm(prev => ({
        ...prev,
        title: data.NominationTitle ?? "",
        nomineeName: data.Nominee ?? "",
        department: data.NomineeDepartment ?? "",
        description: data.Descriptions ?? "",
        email: prev.email ?? "",
        mobile: prev.mobile ?? "",
        managerEmail: data.ManagerName ?? "",
        contestType: data.AwardCategoryID
          ? String(data.AwardCategoryID)
          : "",
      }));
       setReferrals(
      data["Referrals ID"]?.map((r: any) => ({
        UserID: r.UserID,
        UserInfo: r.Email,
        ReferralID:r.ReferralID     
      })) || []
    );
     if (data?.["Supporting Documents"]) {
      const apiDocsAsFiles = data["Supporting Documents"].map((doc: any) => ({
        source: "api",           
        originalFileName: doc.OriginalFileName,
        fileNameGUID: doc.FileNameGUID,
        filePath: doc.FilePath,
        nominationFileID: doc.NominationFileID,
        fileType: doc.FileType,
        fileSize: doc.FileSize,
        isDeleted: false,
      }));

      setExistingDocs(apiDocsAsFiles);
    }

    } catch (err) {
      console.error("❌ Error fetching nomination:", err);
    }
  };

  fetchNominationById();
}, [nominationId, isEditMode, authToken]);

// const allDocuments = [
//   ...existingDocs.filter(d => !d.isDeleted),
//   ...form.files.map(file => ({
//     source: "new",
//     file,
//     originalFileName: file.name,
//   })),
// ];
// const allDocuments = [
//   ...existingDocs.filter(doc => !doc.isDeleted).map(doc => ({ ...doc, source: "api" })),
//   ...form.files 
// ];
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

useEffect(() => {
  const fetchSelfNominationsCount = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/nominationsbyuser`, {
        params: { userID: userId, NominatedBy: 0 },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setTotalSelfNominations(res.data[0]?.TotalRowCount || 0);
    } catch (err) {
      console.error("❌ Error fetching nominations count:", err);
      setTotalSelfNominations(0);
    }
  };

  fetchSelfNominationsCount();
}, [authToken, userId]);

const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFiles = Array.from(e.target.files || []);
  setFileError("");
  if (!selectedFiles.length) return;

  // Clear the input immediately
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
  // Check duplicates and size
  for (const file of selectedFiles) {

    // Duplicate check
    const isDuplicate = form.files.some(
      (f) => f.name === file.name && f.size === file.size
    );

    if (isDuplicate) {
      setFileError(`"${file.name}" already added.`);
      return;
    }

    // Size check
    if (file.size > 2 * 1024 * 1024) {
      setFileError(`"${file.name}" exceeds 2 MB limit.`);
      return;
    }
  }

  // Max 5 validation
  if (form.files.length + selectedFiles.length > 5) {
    setFileError("Maximum 5 files allowed.");
    return;
  }
  const wrappedFiles = selectedFiles.map((file) => ({
    source: "local",
    originalFileName: file.name,
    file,
    fileType: file.type,
    fileSize: file.size,
  }));

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
const newFiles = form.files; // only local files

// let uploadedDocs: UploadedDocument[] = [];

// if (newFiles.length > 0) {
//   uploadedDocs = await uploadFilesToServer(newFiles);
// }

const handleRemoveFile = (index: number) => {
  const updatedFiles = [...form.files];
  updatedFiles.splice(index, 1);

  setForm((prev) => ({ ...prev, files: updatedFiles }));

  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
};

useEffect(() => {
  const fetchUser = async () => {
    try {
      const res2 = await axios.get(
        `${apiUrl}/api/users?userId=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
     const user = res2.data[0]; 
    console.log("✅ Success User Data:", user);

const res3 = await axios.get(`${apiUrl}/api/awardCategory`, {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
  },
});

setContest(res3.data); 
console.log("Contest Type", res3.data); 

const res4 = await axios.get(`${apiUrl}/api/usersbyname?pageNumber=1&pageSize=100`, {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
  },
});
setUsers(res4.data.Users || []);
console.log("Contest Type", res4.data);    
 setForm((prev) => ({
        ...prev,
        nomineeName: user?.UserName?.trim() || "",
        department: user?.DeptName || "",
        managerEmail: user?.ManagerEmail || "",
        email: user?.Email || "",
        mobile: user?.PhoneNo || "",
      }));

    } catch (err) {
      console.error("❌ Error fetching user:", err);
    }
  };

  fetchUser();
}, [authToken, userId]);

const handleSelectReferral = (selected: { value: string; label: string } | null) => {
  if (!selected) return;
  if (!referrals.some((r) => r.UserID === selected.value)) {
    setReferrals([...referrals, { UserID: selected.value, UserInfo: selected.label }]);
  }
};

  const removeReferral = (userID: number) => {
    setReferrals(referrals.filter((r) => r.UserID !== userID));
  };

const handleModalOk = () => {
    setShowSuccessModal(false);
    navigate("/my-nominations");
  };
const handleClear = () => {
  setForm({
    title: "",
    nomineeName: form.nomineeName,
    department: form.department,
    email: form.email,
    mobile: form.mobile,
    managerEmail: form.managerEmail,
    contestType: "",
    description: "",
    files: [],
    nomineeData: form.nomineeData ?? null, 
    file: null, 
  });

  setReferrals([]);
  setErrors({});
};
const contestSelectStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: isReadOnly ? "#f3f4f6" : "#fff", 
    borderColor: isReadOnly ? "#d1d5db" : base.borderColor, 
    cursor: isReadOnly ? "not-allowed" : "default",
    pointerEvents: isReadOnly ? "none" : "auto", 
  }),
  singleValue: (base: any) => ({
    ...base,
    color: isReadOnly ? "#4b5563" : base.color, 
  }),
  placeholder: (base: any) => ({
    ...base,
    color: isReadOnly ? "#6b7280" : base.color, 
  }),
  dropdownIndicator: (base: any) => ({
    ...base,
    display: isReadOnly ? "none" : "flex", 
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return; 
  if (!authToken) {
    alert("⚠️ You are not authorized. Please log in again.");
    return;
  }
let uploadedDocs = [];
if (form.files && form.files.length > 0) {
  uploadedDocs = await uploadFilesToServer(form.files);
} else {
  uploadedDocs = [];
}
const documentsPayload = [
  ...existingDocs.map(doc => ({
    nominationFileID: 0,
    nominationID: isEditMode ? Number(nominationId) : 0,
    originalFileName: doc.originalFileName,
    fileType: doc.fileType,
    fileSize: doc.fileSize,
    fileNameGUID: doc.fileNameGUID,
    filePath: doc.filePath,
    active: !doc.isDeleted,   
    createdBy: userId,
    updatedBy: userId
  })),

  ...uploadedDocs.map((doc: UploadedDocument) => ({
    nominationFileID: 0,
    nominationID: isEditMode ? Number(nominationId) : 0,
    originalFileName: doc.originalFileName,
    fileType: doc.fileType,
    fileSize: `${(doc.fileSize / 1024).toFixed(2)} KB`,
    fileNameGUID: doc.fileNameGUID,
    filePath: doc.fileUrl,
    active: true,
    createdBy: userId,
    updatedBy: userId
  }))
];
const referralPayload = referrals.map(ref => ({
  referralID: ref.ReferralID,
  nominationID: isEditMode ? Number(nominationId) : 0,
  referralUserID: ref.UserID,
  isReferralApproved: true,
  approvalComments: "",
  active: true,
  createdBy: Number(userId),
  updatedBy: Number(userId),
  referralEmail: ref.UserInfo

}));

  const payload = {
    nomination: {
      cycleID: 1,
      nominationID: isEditMode ? Number(nominationId) : 0,
      awardCategoryID: Number(form.contestType),
      userID: Number(userId),
      nominationTitle: form.title,
      isSelf: true,
      nominationCreatedBy: Number(userId),
      descriptions: form.description,
      approvalTypeID: 1,
      isManagerApproved: true,
      approvalComments: "Submitted via UI",
      statusID: 1,
      active: true,
      businessJuryID: 0,
      createdBy: Number(userId),
      updatedBy: Number(userId),
    },
    referralIDs: referralPayload,
    documents: documentsPayload,
    // referralIDs: referrals.map((ref) => ({
    //   referralID: ref.UserID,
    //   nominationID: Number(nominationId || 0),
    //   referralUserID: ref.UserID,
    //   isReferralApproved: true,
    //   approvalComments: "",
    //   active: true,
    //   createdBy: Number(userId),
    //   updatedBy: Number(userId),
    //    referralEmail: ref.UserInfo
    // })),
    // documents: uploadedDocs.map((doc:any) => ({
    //     nominationFileID: Number(userId),
    //     nominationID: Number(nominationId || 0),
    //     originalFileName: doc.originalFileName,
    //     fileType: doc.fileType,
    //     fileSize: `${(doc.fileSize / 1024).toFixed(2)} KB`,
    //     fileNameGUID: doc.fileNameGUID,
    //     filePath: doc.fileUrl, // <<< correct path
    //     active: true,
    //     createdBy: Number(userId),
    //     updatedBy: Number(userId),
    //   })),
  };

  console.log("📦 Sending payload:", payload);
  try {
    // const res = await axios.post(
    //   // "http://172.16.5.106:5195/api/nomination",
    //   `${apiUrl}/api/nomination`,
    //   payload,
    //   {
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${authToken}`, 
    //     },
    //   }
    // );
     const url = isEditMode
      ? `${apiUrl}/api/nominations/${nominationId}`
      : `${apiUrl}/api/nomination`;

    const method = isEditMode ? "put" : "post";

    const res = await axios({
      method,
      url,
      data: payload,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
    const returnVal = res.data?.nominationID ?? res.data;
    
    if (returnVal === -100) {
      setErrorMessage("Duplicate nomination. Please try diffrent contest type.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
       setShowSuccessModal(true);

    console.log("✅ Success:", res.data);
  } catch (err) {
    console.error("❌ Error submitting nomination:", err);
    setShowErrorModal(true);
  }
};
 return (
  <>
    {/* Success message on top
    {successMsg && (
      <div
        className="fixed top-4 left-1/2 transform -translate-x-1/2 
                   bg-green-500 text-white px-6 py-3 rounded shadow-lg 
                   z-50 text-sm font-medium">
        {successMsg}
      </div>
    )} */}
    <div className="fixed bg-white border-b border-t border-gray-200 w-full h-15 flex items-center  top-20 left-0  pl-[260px] pr-6 z-10">
      <div className="flex justify-between w-full">
        <div className="space-x-4 flex items-center ml-auto mr-25">
            {/* <h2 className="text-xl font-semibold">Self Nominate Form</h2> */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (totalSelfNominations > 0) {
                  navigate("/my-nominations");
                }
              }}
  
              className={totalSelfNominations > 0
                ? "text-blue-600  cursor-pointer px-4 py-2 btn-theme"
                : "text-gray-500 cursor-default no-underline px-4 py-2 btn-theme" }>
              You have {totalSelfNominations} nominations
            </a>
        </div>
        </div>
    </div>
    <div className="bg-gray-100 flex flex-col p-6 pt-15"> 
      <div className="w-full h-full px-1 py-1 pb-[50px]" >
        <form
          onSubmit={handleSubmit}
          className="px-2 py-4 rounded-lg bg-white shadow nominate-form">
      <div className="flex-1 bg-white">
        <div className="w-full h-full px-6 py-4">    
        

        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {/* Title */}
            <div >
              <Label.Root htmlFor="title" className="block text-sm font-medium">
                Title of Submission<span className="text-red-500"> *</span>
              </Label.Root>
              <input
                id="title"
                type="text"
                placeholder="Best Innovation"
                value={form.title}
                disabled={isReadOnly}
                maxLength={100}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {const value = e.target.value.slice(0, 100);
                setForm(prevForm => ({...prevForm,title: value }));
                if (value) {setErrors(prevErrors => ({...prevErrors, title: ""}));}}}         
                className={`w-full mt-1 border rounded px-3 py-2
                  ${isReadOnly ? "bg-gray-100 text-gray-700 cursor-not-allowed" : "bg-white text-black"}`}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              <p className="text-gray-500 text-sm mt-1">{form.title.length}/100 characters</p>

            </div>

            {/* Nominee */}
            <div>
              <Label.Root className="block text-sm font-medium">Nominee Name</Label.Root>
              <input
                type="text"
                value={form.nomineeName || ""}
                disabled
                tabIndex={-1}
                aria-disabled="true"
                onMouseDown={(e) => e.preventDefault()}
                onFocus={(e) => e.currentTarget.blur()}
                onKeyDown={(e) => e.preventDefault()}
                style={{ userSelect: "none", pointerEvents: "none", caretColor: "transparent", outline: "none" }}
                className="w-full mt-1 border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"            />
            </div>
          </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {/* Department */}
            <div>
              <Label.Root className="block text-sm font-medium">Department</Label.Root>
              <input
                type="text"
                value={form.department}
                disabled
                tabIndex={-1}
                aria-disabled="true"
                onMouseDown={(e) => e.preventDefault()}
                onFocus={(e) => e.currentTarget.blur()}
                onKeyDown={(e) => e.preventDefault()}
                style={{ userSelect: "none", pointerEvents: "none", caretColor: "transparent", outline: "none" }}
                className="w-full mt-1 border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"            />
            </div>

            {/* Email */}
            <div>
              <Label.Root className="block text-sm font-medium">Email ID</Label.Root>
              <input
                type="email"
                value={form.email || ""}
                disabled
                tabIndex={-1}
                aria-disabled="true"
                onMouseDown={(e) => e.preventDefault()}
                onFocus={(e) => e.currentTarget.blur()}
                onKeyDown={(e) => e.preventDefault()}
                style={{ userSelect: "none", pointerEvents: "none", caretColor: "transparent", outline: "none" }}
                className="w-full mt-1 border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"            />
            </div>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {/* Mobile */}
            <div>
              <Label.Root className="block text-sm font-medium">Mobile Number</Label.Root>
              <input
                type="tel"
                value={form.mobile}
                disabled
                tabIndex={-1}
                aria-disabled="true"
                onMouseDown={(e) => e.preventDefault()}
                onFocus={(e) => e.currentTarget.blur()}
                onKeyDown={(e) => e.preventDefault()}
                style={{ userSelect: "none", pointerEvents: "none", caretColor: "transparent", outline: "none" }}
                className="w-full mt-1 border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"            />
            </div>

            {/* Manager*/}
              <div className="mb-2">
                <Label.Root className="block text-sm font-medium">
                  Manager Email ID
                </Label.Root>
                <input
                  type="email"
                  value={form.managerEmail}
                  disabled
                  tabIndex={-1}
                  aria-disabled="true"
                  onMouseDown={(e) => e.preventDefault()}
                  onFocus={(e) => e.currentTarget.blur()}
                  onKeyDown={(e) => e.preventDefault()}
                  style={{ userSelect: "none", pointerEvents: "none", caretColor: "transparent", outline: "none" }}
                  className="w-full mt-1 border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"            />
            </div>

          </div>

          {/* Description */}
          <div className="">
            <Label.Root className="block text-sm font-medium">Description  (Max 1000 chars)</Label.Root>
            <textarea
              rows={2}
              placeholder="Describe the nomination..."
              value={form.description}
              onChange={(e) => { const value = e.target.value;
              if (value.length <= 1000) {
              setForm({ ...form, description: value });
              }
            }}
              className="w-full mt-1 border rounded px-3 py-2 resize-none"
              // className="w-full mt-1 border rounded px-3 py-2 h-28 resize-none"
            />
            <p className="text-gray-500 text-sm mt-1">{form.description.length}/1000 characters</p>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">  
            {/* Contest Dropdown */}
          <div >
            <label className="block text-sm font-medium mb-2">Contest Type
              <span className="text-red-500"> *</span>
            </label>
            <Select
              name="contestType"
              value={
                contest
                  .filter((c: any) => c.AwardCategoryID === Number(form.contestType))
                  .map((c: any) => ({
                    value: c.AwardCategoryID,
                    label: c.CategoryName,
                  }))[0] || null
              }
              onChange={(selectedOption: { value: string } | null) => {setForm(prevForm => ({
                ...prevForm,
                contestType: selectedOption?.value ?? ""
                }));
              if (selectedOption?.value) {
                setErrors(prevErrors => ({...prevErrors, contestType: ""
                }));
                }}}
              options={contest.map((c: any) => ({
                value: c.AwardCategoryID,
                label: c.CategoryName,
                }))}
              placeholder="Select Contest Type"
              className="text-sm"
              styles={contestSelectStyles}
            />
            {errors.contestType && <p className="text-red-500 text-sm mt-1">{errors.contestType}</p>}

            {/* Supporting Documents   */}
            <div className="mt-4">
              <Label.Root className="block text-sm font-medium">
                Supporting Documents 
                <span className="text-red-500">(Maximum 5 files allowed & File must be below 2 MB)</span>
              </Label.Root>

              <label
                htmlFor="fileUpload"
                className="inline-block bg-gray-100 text-gray-700 border border-gray-300 px-6 py-2 rounded cursor-pointer mt-2 hover:bg-gray-200"
              >
                Choose File
              </label>
              <input
                id="fileUpload"
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />

              {fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}

            </div>
                        {/* Render both existing API files and newly uploaded files */}
            <div className="mt-3 flex flex-wrap gap-2">
              {allDocuments.map((doc: any, index: number) => (
                <div
                  key={doc.source === "api" ? doc.fileNameGUID : index}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg shadow-sm border relative"
                >
                  {/* File Name */}
                  <span
                    className="text-sm truncate max-w-[180px] cursor-pointer text-blue-600 hover:underline"
                    onClick={async () => {
                      const ext = (doc.originalFileName || doc.name).split(".").pop()?.toLowerCase();

                      if (doc.source === "api") {
                        try {
                          const downloadUrl = `${apiUrl}/api/download?fileName=${doc.fileNameGUID}`;
                          const response = await axios.get(downloadUrl, {
                            responseType: "blob",
                            headers: { Authorization: `Bearer ${authToken}` },
                          });
                          const blobUrl = URL.createObjectURL(response.data);

                          if (["jpg","jpeg","png","gif"].includes(ext || "")) {
                            setPreviewType(ext);
                            setPreviewFile(blobUrl);
                            setPreviewOpen(true);
                          } else if (ext === "pdf") window.open(blobUrl, "_blank");
                          else {
                            const link = document.createElement("a");
                            link.href = blobUrl;
                            link.download = doc.originalFileName;
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                          }
                        } catch (err) {
                          console.error("Download failed:", err);
                          alert("File not found");
                        }
                      } else {
                        const blobUrl = URL.createObjectURL(doc);
                        if (["jpg","jpeg","png","gif"].includes(ext || "")) {
                          setPreviewType(ext);
                          setPreviewFile(blobUrl);
                          setPreviewOpen(true);
                        } else {
                          const link = document.createElement("a");
                          link.href = blobUrl;
                          link.download = doc.name;
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                        }
                      }
                    }}
                  >
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
                    className="text-red-500 hover:text-red-700 font-bold text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>


          </div>    

            {/* Referrals */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Referrals Email ID 
              </label>
              <Select
                options={users.map((u) => ({
                  value: u.UserID,
                  label: u.UserInfo,
                }))}
                value={referrals.length ? { value: referrals[referrals.length - 1].UserID, 
                label: referrals[referrals.length - 1].UserInfo } : null}
                onChange={handleSelectReferral}
                placeholder="Search and select referral..."
                isSearchable
                className="text-sm"
              />
              {/* Selected Referrals */}
                  <div className="mt-3 space-y-2 max-h-[180px] overflow-y-auto pr-2">
                    {referrals.map((ref) => (
                      <div
                        key={ref.UserID}
                        className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded"
                      >
                        <span className="truncate">
                          {ref.UserInfo}
                        </span>
                  
                        <button
                          type="button"
                          onClick={() => removeReferral(ref.UserID)}
                          className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  
              {errorMessage && (
                <div className="fixed top-5 right-5 z-[9999] bg-red-600 text-white px-5 py-3 
                rounded-lg shadow-xl text-sm font-medium animate-slide-in">
                  {errorMessage}
                </div>
              )}

            </div>

          </div>
         



        </div>  
          </div> 
          
        </form>
      </div>
    </div>
    {/* Buttons */}
    {/* <div className="bg-white border-t border-gray-200 px-6 py-4 shrink-0 sticky bottom-0 w-405 shadow-md padding: 16px;"> */}
    <div className="fixed bottom-0 left-0 w-full h-15 bg-white border-t border-gray-200 flex items-center pl-[260px] pr-6">
        <div className="flex justify-end space-x-4 ml-auto" >
          <button
          type="button"
          onClick={() => {
            if (isEditMode) {
              navigate(-1);
            } else {
              handleClear(); 
            }
          }}
          className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">
          {isEditMode ? "Cancel" : "Clear"}
        </button>
          {/* <button onClick={handleClear}
          type="button" className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">
            Clear
          </button> */}
          <button onClick={handleSubmit} type="submit" className="px-4 py-2 btn-theme">
            {isEditMode ? "Update Nomination" : "Save Nomination"}
          </button>
        </div> 
    </div>

    {showErrorModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-md w-96 text-center">
      <h2 className="text-lg font-semibold mb-4 text-red-600">Error</h2>
      <p className="mb-6">Failed to submit nomination. Please try again</p>
      <button
        onClick={() => setShowErrorModal(false)}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">OK
      </button>
    </div>
  </div>
)}
   {showSuccessModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-md w-96 text-center">
      {/* <h2 className="text-lg font-semibold mb-4">Success!</h2> */}
       <p className="mb-6">
{isEditMode
          ? "Nomination updated successfully!"
          : "Nomination submitted successfully!"}
</p>
      <button onClick={handleModalOk }  className="px-4 py-2 btn-theme">OK</button>
    </div>
  </div>
)}
<Dialog.Root open={previewOpen} onOpenChange={setPreviewOpen}>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
    <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[90%] h-[80%] max-w-3xl -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-xl overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Document Preview</h2>
        <button className="p-1 hover:bg-gray-200 rounded" onClick={() => setPreviewOpen(false)}>
          <X size={20} />
        </button>
      </div>
      <div className="w-full h-full border rounded overflow-auto flex justify-center items-center bg-gray-50">
        {["jpg","jpeg","png","gif"].includes(previewType || "") && (
          <img src={previewFile!} alt="Preview" className="max-h-full max-w-full object-contain" />
        )}
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
  </>
);
}
