import * as Label from "@radix-ui/react-label";
import { useEffect, useState,useRef } from "react";
import type { FormState } from "../../dataTypes/nomination";
import { useAuth } from "../ContextAPI/AuthContext";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { X, User, Building2, Mail,Phone } from "lucide-react";
import {getNomination,getNominationsByUser,uploadFiles,getUserById,getAwardCategories,getUsersByName,
  downloadFile,saveNomination,updateNomination} from "../../services/nominationService"

interface UploadedDocument {
  originalFileName: string;
  fileType: string;
  fileSize: number;
  fileNameGUID: string;
  fileUrl: string;
}

// const apiUrl = import.meta.env.VITE_API_URL;

export default function AddNomination() {
  // const [referrals, setReferrals] = useState([
  //   "sathishkumar312@srm.com",
  //   "kumaran@srm.com",
  //   "manikandan@srm.com",
  // ]);
  
  const [contest, setContest]= useState([]);
  const [users, setUsers] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const {  authToken, userId } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { nominationId } = useParams<{ nominationId: string }>();
  const isEditMode = Boolean(nominationId);
  const [existingDocs, setExistingDocs] = useState<any[]>([]);
  const navigate = useNavigate();
  const isReadOnly = isEditMode;
  const loggedInUserId = Number(userId);


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
  const[srmExperience,setSrmExperience]=useState("");
  const[doj,setDoj]=useState("");
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
const openPreview = (file: Blob, ext: string) => {
  const blobUrl = URL.createObjectURL(file);
  setPreviewType(ext);
  setPreviewFile(blobUrl);
  setPreviewOpen(true);
};
useEffect(() => {
  return () => {
    if (previewFile) URL.revokeObjectURL(previewFile);
  };
}, [previewFile]);

useEffect(() => {
  if (!isEditMode || !authToken) return;

  const fetchNominationById = async () => {
    try {
      // const res = await axios.get(
      //   `${apiUrl}/api/nominations/${nominationId}`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${authToken}`,
      //     },
      //   }
      // );
      const res = await getNomination(Number(nominationId));
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
      const res = await getNominationsByUser(Number(userId));
      // const res = await axios.get(`${apiUrl}/api/nominationsbyuser`, {
      //   params: { userID: userId, NominatedBy: 0 },
      //   headers: { Authorization: `Bearer ${authToken}` },
      // });
      setTotalSelfNominations(res.data[0]?.TotalRowCount || 0);
      setDoj(res.data[0]?.DateOfJoining || "");
      setSrmExperience(res.data[0]?.SRMExperience || "");
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
  const res = await uploadFiles(files);
  // const res = await axios.post(`${apiUrl}/api/upload`, formData, {
  //   headers: {
  //     "Content-Type": "multipart/form-data",
  //     Authorization: `Bearer ${authToken}`,
  //   },
  // });
  return res.data;
};

useEffect(() => {
  const fetchUser = async () => {
    try {
      // const res2 = await axios.get(
      //   `${apiUrl}/api/users?userId=${userId}`,
      //   {
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${authToken}`,
      //     },
      //   }
      // );
    const res2 = await getUserById(Number(userId));
    const user = res2.data[0]; 
    const res3 = await getAwardCategories();
//     const res3 = await axios.get(`${apiUrl}/api/awardCategory`, {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${authToken}`,
//       },
// });

setContest(res3.data); 
const res4 = await getUsersByName();
// const res4 = await axios.get(`${apiUrl}/api/usersbyname?pageNumber=1&pageSize=100`, {
//   headers: {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${authToken}`,
//   },
// });
setUsers(res4.data.Users || []); 
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
  };

  try {
    
    // const url = isEditMode
    //   ? `${apiUrl}/api/nominations/${nominationId}`
    //   : `${apiUrl}/api/nomination`;

    // const method = isEditMode ? "put" : "post";
    let res;

    if (isEditMode) {
      res = await updateNomination(Number(nominationId), payload);
    } else {
      res = await saveNomination(payload);
    }
    // const res = await axios({
    //   method,
    //   url,
    //   data: payload,
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${authToken}`,
    //   },
    // });
    const returnVal = res.data?.nominationID ?? res.data;
    
    if (returnVal === -100) {
      setErrorMessage("Duplicate nomination. Please try diffrent contest type.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
       setShowSuccessModal(true);
  } catch (err) {
    console.error("❌ Error submitting nomination:", err);
    setShowErrorModal(true);
  }
};

 return (
  <>
 <div className="bg-gray-100 flex flex-col"> 
  <div className="w-full h-full px-1 py-1 pb-[60px]" >
    <form onSubmit={handleSubmit} className="px-2 py-4 rounded-lg bg-white shadow nominate-form">
      <div className="flex-1 bg-white">
        <div className="w-full h-full px-6 py-4">         
           <div className="flex gap-6 items-start w-full">
            <div
              className="w-24 h-24 rounded-full border-4 border-emerald-500 flex items-center justify-center text-white font-bold text-5xl"
              style={{
                background: "linear-gradient(90deg, rgb(8, 128, 94) 16%, rgb(24, 97, 174) 100%)",
              }}>
              {form.nomineeName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Self Nominate Form
                </h2>
                <div className="text-sm text-gray-600">
                 <div className="flex justify-end"> <a
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
                </a></div> 
                </div>
              </div>
              <div className="grid grid-cols-3 gap-x-10 gap-y-6 text-sm w-full">
                <div>
                  <p className="text-gray-500">Nominee</p>
                  <div className="flex items-center font-medium text-gray-900">
                    <User size={16} className="text-gray-400 mr-2" />{form.nomineeName}
                  </div>
                </div>
                 <div>
                  <p className="text-gray-500">DOJ & Age in SRM</p>
                  <div className="flex items-center font-medium">
                  {doj}, {srmExperience}
                  </div>
                </div>
                <div>
                  <p className="text-gray-500">Department</p>
                  <div className="flex items-center font-medium">
                    <Building2 size={16} className="text-gray-400 mr-2" />{form.department}
                  </div>
                </div>
                 <div>
                  <p className="text-gray-500">Email Id</p>
                  <div className="flex items-center font-medium">
                    <Mail size={16} className="text-gray-400 mr-2" />{form.email}
                  </div>
                </div>
                 <div>
                  <p className="text-gray-500">Mobile Nnumber</p>
                  <div className="flex items-center font-medium">
                    <Phone size={16} className="text-gray-400 mr-2" />{form.mobile}
                  </div>
                </div>
                 <div>
                  <p className="text-gray-500">Manager Email Id</p>
                  <div className="flex items-center font-medium">
                    <Mail size={16} className="text-gray-400 mr-2" />{form.managerEmail}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-b border-gray-200 mt-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 mt-6">
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
                  ${isReadOnly ? "bg-gray-100 text-gray-700 cursor-not-allowed" : "bg-white text-black"}`}/>
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              <p className="text-gray-500 text-sm mt-1">{form.title.length}/100 characters</p>
            </div>
            <div>
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
              styles={contestSelectStyles} />
            {errors.contestType && <p className="text-red-500 text-sm mt-1">{errors.contestType}</p>}
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
              className="w-full mt-1 border rounded px-3 py-2 resize-none"/>
            <p className="text-gray-500 text-sm mt-1">{form.description.length}/1000 characters</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">  
          <div >
            {/* Supporting Documents   */}
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
          {/* Render both existing API files and newly uploaded files */}
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
                          const response = await downloadFile(doc.fileNameGUID);
                          // const response = await axios.get(
                          //   `${apiUrl}/api/download?fileName=${doc.fileNameGUID}`,
                          //   {
                          //     responseType: "blob",
                          //     headers: { Authorization: `Bearer ${authToken}` },
                          //   }
                          // );
                        //  const blobUrl = URL.createObjectURL(response.data);
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
                    className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">
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
                options={users
                  .filter((u) => u.UserID !== loggedInUserId &&
                   !referrals.some((ref) => ref.UserID === u.UserID)
                )
                  .map((u) => ({
                  value: u.UserID,
                  label: u.UserInfo,
                }))}
                value={referrals.length ? { value: referrals[referrals.length - 1].UserID, 
                label: referrals[referrals.length - 1].UserInfo } : null}
                onChange={handleSelectReferral}
                placeholder="Search and select referral..."
                isSearchable
                className="text-sm"/>
              {/* Selected Referrals */}
                  <div className="mt-3 space-y-2 max-h-[180px] overflow-y-auto pr-2">
                    {referrals.map((ref) => (
                      <div
                        key={ref.UserID}
                        className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
                        <span className="truncate">
                          {ref.UserInfo}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeReferral(ref.UserID)}
                          className="ml-2 px-2 py-1 bg-red-500 text-white rounded">
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
          className="px-4 py-2 border text-gray-700 hover:bg-gray-100 border-gray-300 rounded-[6px]">
          {isEditMode ? "Cancel" : "Clear"}
        </button>
          <button onClick={handleSubmit} type="submit" className="px-4 py-2 btn-theme">
            {isEditMode ? "Update Nomination" : "Save Nomination"}
          </button>
        </div> 
       </div>     
        </form>
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
              onClick={() => setPreviewOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="w-full h-full border rounded overflow-auto flex justify-center items-center bg-gray-50">
            {["jpg", "jpeg", "png", "gif"].includes(previewType || "") && (
              <img
                src={previewFile!}
                alt="Preview"
                className="max-h-full max-w-full object-contain"/>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
      </>
    );
    }
