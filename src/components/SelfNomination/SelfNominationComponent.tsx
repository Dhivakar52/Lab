import * as Label from "@radix-ui/react-label";
import { useEffect, useState,useRef } from "react";
import { Outlet } from "react-router-dom";
import axios from "axios";
import type { FormState } from "../../dataTypes/nomination";
import { useAuth } from "../ContextAPI/AuthContext";
import Select from "react-select";
import type { SingleValue } from "react-select";
import { useNavigate } from "react-router-dom";

interface OptionType {
  value: number;
  label: string;
}
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

 const navigate = useNavigate();


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

  const validateForm = () => {
  const newErrors: { [key: string]: string } = {};

  if (!form.title.trim()) newErrors.title = "Title is required.";
  if (!form.contestType) newErrors.contestType = "Contest type is required.";
  //if (referrals.length < 3) newErrors.referrals = "Please select 3 referrals.";

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

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

const handleSingleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFiles = Array.from(e.target.files || []);
  setFileError("");

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
 
  // const handleSelectReferral = (selectedOption: SingleValue<OptionType>) => {
  //   if (!selectedOption) return;

  //   const exists = referrals.some((r) => r.UserID === selectedOption.value);
  //   // if (referrals.length >= 3) {
  //   //   //alert("⚠️ You can select only up to 3 referrals");
  //   //   return;
  //   // }
  //   if (!exists) {
  //     setReferrals([
  //       ...referrals,
  //       { UserID: selectedOption.value, UserInfo: selectedOption.label },
  //     ]);
  //   }
  // };
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

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return; 
  if (!authToken) {
    alert("⚠️ You are not authorized. Please log in again.");
    return;
  }

  const payload = {
    nomination: {
      cycleID: 1,
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
    referralIDs: referrals.map((ref) => ({
      referralID: ref.UserID,
      nominationID: 0,
      referralUserID: ref.UserID,
      isReferralApproved: true,
      approvalComments: "",
      active: true,
      createdBy: Number(userId),
      updatedBy: Number(userId),
       referralEmail: ref.UserInfo
    })),
    documents: form.files.map((file) => ({
    nominationFileID: Number(userId),
    nominationID: Number(userId),
    originalFileName: file.name,
    fileType: file.type,
    fileSize: `${(file.size / 1024).toFixed(2)} KB`,
    fileNameGUID: crypto.randomUUID(),
    filePath: `/uploads/${file.name}`,
    active: true,
    createdBy: Number(userId),
    updatedBy: Number(userId),
  })),
  };

  console.log("📦 Sending payload:", payload);
  try {
    const res = await axios.post(
      "http://172.16.5.106:5195/api/nomination",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`, 
        },
      }
    );
       setShowSuccessModal(true);

    console.log("✅ Success:", res.data);
  } catch (err) {
    console.error("❌ Error submitting nomination:", err);
    setShowErrorModal(true);
  }
};

 return (
  <>
    {/* Success message on top */}
    {successMsg && (
      <div
        className="fixed top-4 left-1/2 transform -translate-x-1/2 
                   bg-green-500 text-white px-6 py-3 rounded shadow-lg 
                   z-50 text-sm font-medium">
        {successMsg}
      </div>
    )}

    <div className="p-5">
      <form
        onSubmit={handleSubmit}
        className="p-6 border rounded-lg bg-white shadow nominate-form">
      <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Self Nominate Form</h2>
           <a
            href={totalSelfNominations > 0 ? "/my-nominations" : undefined}
            onClick={(e) => {
              if (totalSelfNominations === 0) {
                e.preventDefault();
              }
            }}
            className="text-blue-600 underline cursor-pointer">
            You have {totalSelfNominations} nominations
          </a>
          {/* <a
            href={totalSelfNominations > 0 ? "/my-nominations" : undefined}
            onClick={(e) => {
              if (totalSelfNominations === 0) {
                e.preventDefault();
              }
            }}
            className="text-blue-600 underline cursor-pointer"
          >
            You have {totalSelfNominations} nominations
          </a> */}
        </div>
        {/* Title */}
        <div className="mb-4">
          <Label.Root htmlFor="title" className="block text-sm font-medium">
            Title of Submission<span className="text-red-500"> *</span>
          </Label.Root>
          <input
            id="title"
            type="text"
            placeholder="Best Innovation"
            value={form.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {const value = e.target.value;
            setForm(prevForm => ({...prevForm,title: value }));
            if (value) {setErrors(prevErrors => ({...prevErrors, title: ""}));}}}         
            className="w-full mt-1 border rounded px-3 py-2"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Nominee & Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <Label.Root className="block text-sm font-medium">Nominee Name</Label.Root>
            <input
              type="text"
              value={form.nomineeName || ""}
              disabled
              className="w-full mt-1 border rounded px-3 py-2"
            />
          </div>

          <div>
            <Label.Root className="block text-sm font-medium">Department</Label.Root>
            <input
              type="text"
              value={form.department}
              disabled
              className="w-full mt-1 border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Email & Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <Label.Root className="block text-sm font-medium">Email ID</Label.Root>
            <input
              type="email"
              value={form.email || ""}
              disabled
              className="w-full mt-1 border rounded px-3 py-2"
            />
          </div>
          <div>
            <Label.Root className="block text-sm font-medium">Mobile Number</Label.Root>
            <input
              type="tel"
              value={form.mobile}
              disabled
              className="w-full mt-1 border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Manager & Contest */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="mb-2">
            <Label.Root className="block text-sm font-medium">
              Manager Email ID
            </Label.Root>
            <input
              type="email"
              value={form.managerEmail}
              disabled
              className="w-full mt-1 border rounded px-3 py-2 mb-3"
            />

            {/* Contest Dropdown */}
            <div className="mb-6">
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
                // onChange={(selectedOption: any) =>
                //   setForm({ ...form, contestType: selectedOption?.value || "" })
                  
                // }
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
              />
              {errors.contestType && <p className="text-red-500 text-sm mt-1">{errors.contestType}</p>}
            </div>
          </div>

          {/* Referrals */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Referrals Email ID <span className="text-red-500">(Mandatory 3*)</span>
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
            <div className="mt-3 space-y-2">
              {referrals.map((ref) => (
                <div
                  key={ref.UserID}
                  className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded"
                >
                  <span>{ref.UserInfo}</span>
                  <button
                    type="button"
                    onClick={() => removeReferral(ref.UserID)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
         <div className="mb-6">
          <Label.Root className="block text-sm font-medium">
            Supporting Documents <span className="text-red-500">(Maximum 5 files allowed & File must be below 2 MB)</span>
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
            onChange={handleSingleFileUpload}
            className="hidden"
            //className="mt-1 border p-2 rounded w-full"
          />
          {fileError && (
            <p className="text-red-500 text-sm mt-1">{fileError}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {form.files?.map((file, index) => (
            <div
             key={index}
             className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg shadow-sm border relative">
             <span className="text-sm truncate max-w-[180px]"> {file.name}</span>
            <button
             type="button" 
             onClick={() => handleRemoveFile(index)}
             className="text-red-500 hover:text-red-700 font-bold text-lg leading-none"> ×
            </button>
           </div>
            ))}
         </div>
        </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <Label.Root className="block text-sm font-medium">Description  (Max 1000 chars)</Label.Root>
          <textarea
            placeholder="Describe the nomination..."
            value={form.description}
            onChange={(e) => { const value = e.target.value;
            if (value.length <= 1000) {
            setForm({ ...form, description: value });
            }
           }}
            // onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full mt-1 border rounded px-3 py-2 h-28 resize-none"
          />
           <p className="text-gray-500 text-sm mt-1">
    {form.description.length}/1000 characters
  </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <button onClick={handleClear}
          type="button" className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">
            Clear
          </button>
          <button onClick={handleSubmit} type="submit" className="px-4 py-2 btn-theme">
            Submit Nomination
          </button>
        </div>
      </form>

      <Outlet />
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
      <p className="mb-6">Nomination submitted successfully!</p>
      <button onClick={handleModalOk } className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">OK</button>
    </div>
  </div>
)}
  </>
);
}
