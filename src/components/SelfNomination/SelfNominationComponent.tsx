import * as Label from "@radix-ui/react-label";
import { useEffect, useState} from "react";
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
    file: null as File | null,
  });



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
 
  const handleSelectReferral = (selectedOption: SingleValue<OptionType>) => {
    if (!selectedOption) return;

    const exists = referrals.some((r) => r.UserID === selectedOption.value);
    if (referrals.length >= 3) {
      alert("⚠️ You can select only up to 3 referrals");
      return;
    }
    if (!exists) {
      setReferrals([
        ...referrals,
        { UserID: selectedOption.value, UserInfo: selectedOption.label },
      ]);
    }
  };

  const removeReferral = (userID: number) => {
    setReferrals(referrals.filter((r) => r.UserID !== userID));
  };



const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  
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
    documents: form.file
      ? [
          {
            nominationFileID: Number(userId),
            nominationID: Number(userId),
            originalFileName: form.file.name,
            fileType: form.file.type,
            fileSize: `${(form.file.size / 1024).toFixed(2)} KB`,
            fileNameGUID: crypto.randomUUID(),
            filePath: `/uploads/${form.file.name}`,
            active: true,
            createdBy: Number(userId),
            updatedBy: Number(userId),
          },
        ]
      : [],
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

 
    console.log("✅ Success:", res.data);
   // alert("Nomination submitted successfully!");
   setSuccessMsg("Nomination submitted successfully!");

      setTimeout(() => {
        setSuccessMsg("");
        navigate("/my-nominations");
      }, 2000);
    //navigate("/my-nominations");
  } catch (err) {
    console.error("❌ Error submitting nomination:", err);
    alert("Failed to submit nomination. Please check the console.");
  }
};

















 return (
  <>
    {/* Success message on top */}
    {successMsg && (
      <div
        className="fixed top-4 left-1/2 transform -translate-x-1/2 
                   bg-green-500 text-white px-6 py-3 rounded shadow-lg 
                   z-50 text-sm font-medium"
      >
        {successMsg}
      </div>
    )}

    <div className="p-5">
      <form
        onSubmit={handleSubmit}
        className="p-6 border rounded-lg bg-white shadow nominate-form"
      >
        <h2 className="text-xl font-semibold mb-6">Self Nominate Form</h2>

        {/* Title */}
        <div className="mb-4">
          <Label.Root htmlFor="title" className="block text-sm font-medium">
            Title of Submission
          </Label.Root>
          <input
            id="title"
            type="text"
            placeholder="Best Innovation"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full mt-1 border rounded px-3 py-2"
          />
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
              <label className="block text-sm font-medium mb-2">Contest Type</label>

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
                onChange={(selectedOption: any) =>
                  setForm({ ...form, contestType: selectedOption?.value || "" })
                }
                options={contest.map((c: any) => ({
                  value: c.AwardCategoryID,
                  label: c.CategoryName,
                }))}
                placeholder="Select Contest Type"
                className="text-sm"
              />
            </div>
          </div>

          {/* Referrals */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Referrals Email ID <span className="text-red-500">(mandatory 3*)</span>
            </label>

            <Select
              options={users.map((u) => ({
                value: u.UserID,
                label: u.UserInfo,
              }))}
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
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <Label.Root className="block text-sm font-medium">
            Supporting Documents
          </Label.Root>
          <input
            type="file"
            onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
            className="mt-1 border p-2 rounded w-full"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <Label.Root className="block text-sm font-medium">Description</Label.Root>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full mt-1 border rounded px-3 py-2 h-28 resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <button type="button" className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 btn-theme">
            Submit Nomination
          </button>
        </div>
      </form>

      <Outlet />
    </div>
  </>
);
}
