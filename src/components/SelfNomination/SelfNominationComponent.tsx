import * as Label from "@radix-ui/react-label";
import { useEffect, useState} from "react";
import { Outlet } from "react-router-dom";
import axios from "axios";
import type { FormState } from "../../dataTypes/nomination";
import { useAuth } from "../ContextAPI/AuthContext";






const apiUrl = import.meta.env.VITE_API_URL;




export default function AddNomination() {
  const [referrals, setReferrals] = useState([
    "sathishkumar312@srm.com",
    "kumaran@srm.com",
    "manikandan@srm.com",
  ]);

  const {  authToken, userId } = useAuth();

 


  const [form, setForm] = useState<FormState>({
    title: "",
    nomineeName:"",
    department: "",
    email: "",
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

     
      setForm((prev) => ({
        ...prev,
        nomineeName:user.UserName || "",
        department: user.DeptName || "",
        managerEmail : user.ManagerEmail || "",
        email: user.Email || "",
        mobile: user.PhoneNo || "",
      }));

      console.log("✅ Success:", user);
    } catch (err) {
      console.error("❌ Error fetching user:", err);
    }
  };

  fetchUser();
}, [authToken, userId]);
 











  const addReferral = () => setReferrals([...referrals, ""]);
  const updateReferral = (i: number, value: string) => {
    const updated = [...referrals];
    updated[i] = value;
    setReferrals(updated);
  };
  const removeReferral = (i: number) => {
    const updated = referrals.filter((_, idx) => idx !== i);
    setReferrals(updated);
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
      awardCategoryID: 1,
      userID: Number(userId),
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
      referralID: 0,
      nominationID: 0,
      referralUserID: 0,
      isReferralApproved: true,
      approvalComments: "",
      active: true,
      createdBy: Number(userId),
      updatedBy: Number(userId),
      referralEmail: ref,
    })),
    documents: form.file
      ? [
          {
            nominationFileID: 0,
            nominationID: 0,
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

    const res2= await axios.get(`http://172.16.5.106:5195/api/users?userId=${userId}`)
    console.log("✅ Success:", res2.data);

    console.log("✅ Success:", res.data);
    alert("Nomination submitted successfully!");
  } catch (err) {
    console.error("❌ Error submitting nomination:", err);
    alert("Failed to submit nomination. Please check the console.");
  }
};

















  return (
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

        {/* Nominee Name & Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <Label.Root className="block text-sm font-medium">
              Nominee Name
            </Label.Root>
            <input
              type="text"
              placeholder="Ravi Kumar"
            value={form.nomineeName || ""}
              disabled
              // onChange={(e) => setForm({ ...form, nomineeName: e.target.value })}
              className="w-full mt-1 border rounded px-3 py-2"
            />
          </div>
          <div>
            <Label.Root className="block text-sm font-medium">
              Department
            </Label.Root>
            <input
              type="text"
              placeholder="Research & Innovation"
              value={form.department}
                 disabled
              // onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full mt-1 border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Email & Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <Label.Root className="block text-sm font-medium">
              Email ID
            </Label.Root>
            <input
              type="email"
              placeholder="ravikumar@srm.com"
              value={form.email || ""}
               disabled
              // onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full mt-1 border rounded px-3 py-2"
            />
          </div>
          <div>
            <Label.Root className="block text-sm font-medium">
              Mobile Number
            </Label.Root>
            <input
              type="tel"
              placeholder="+91 98456 87321"
              value={form.mobile}
                 disabled
              // onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              className="w-full mt-1 border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Manager Email & Contest Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="mb-2">
            <Label.Root className="block text-sm font-medium">
              Manager Email ID
            </Label.Root>
            <input
              type="email"
              placeholder="prasath16@srm.com"
              value={form.managerEmail}
                 disabled
              // onChange={(e) =>
              //   setForm({ ...form, managerEmail: e.target.value })
              // }
              className="w-full mt-1 border rounded px-3 py-2 mb-3"
            />

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contest Type
              </label>
              <select
                name="contestType"
                value={form.contestType}
                onChange={(e) =>
                  setForm({ ...form, contestType: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select Contest Type</option>
                <option value="innovation">Innovation</option>
                <option value="service">Service Excellence</option>
                <option value="talent">Talent</option>
                <option value="leadership">Leadership</option>
              </select>
            </div>
          </div>

          {/* Referrals */}
          <div className="mb-6">
            <Label.Root className="block text-sm font-medium">
              Referrals Email ID{" "}
              <span className="text-red-500">(mandatory 3*)</span>
            </Label.Root>
            {referrals.map((ref, i) => (
              <div key={i} className="flex items-center mt-2">
                <input
                  type="email"
                  value={ref}
                  onChange={(e) => updateReferral(i, e.target.value)}
                  className="flex-1 border rounded px-3 py-2 mr-2"
                />
                {referrals.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeReferral(i)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addReferral}
              className="mt-2 px-3 py-1 bg-green-600 text-white rounded"
            >
              Add More
            </button>
          </div>
        </div>

        {/* Supporting Document */}
        <div className="mb-6">
          <Label.Root className="block text-sm font-medium">
            Supporting Documents
          </Label.Root>
          <input
            type="file"
            onChange={(e) =>
              setForm({ ...form, file: e.target.files?.[0] || null })
            }
            className="mt-1 border p-2 rounded w-full"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <Label.Root className="block text-sm font-medium">
            Description
          </Label.Root>
          <textarea
            placeholder="Describe your submission..."
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="w-full mt-1 border rounded px-3 py-2 h-28 resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 btn-theme">
            Submit Nomination
          </button>
        </div>
      </form>
      <Outlet />
    </div>
  );
}
