import * as Label from "@radix-ui/react-label";
import { useEffect, useState} from "react";
import { Outlet } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../ContextAPI/AuthContext";
import type { AddNominationState } from "../../dataTypes/nomination";
import Select from "react-select";
import type { SingleValue } from "react-select";

interface OptionType {
  value: number;
  label: string;
}

interface DepartmentType {
  DeptID: number;
  DeptName: string;
  DeptCode: string;
  TenantID: number;
  TenantName: string;
}

interface UserType {
  UserID: number;
  UserName: string;
  DeptID: number;
  DeptName: string;
  Email: string;
  TenantID: number;
  TenantName: string;
  PhoneNo : string;
  ManagerEmail : string;
}

const apiUrl = import.meta.env.VITE_API_URL;

export default function OtherNominationForm() {
  const [contest, setContest] = useState([]);
  const [allDepartments, setAllDepartments] = useState<DepartmentType[]>([]); 
  const [filteredDepartments, setFilteredDepartments] = useState<DepartmentType[]>([]); 
  const [allUsers, setAllUsers] = useState<UserType[]>([]); 
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]); 
  const [users, setUsers] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [entitydropdown, setEntityName] = useState<any[]>([]);
  const [form, setForm] = useState<AddNominationState>({
    title: "",
    nomineeName: "",
    nomineeData: "",
    department: "",
    email: "",
    mobile: "",
    managerEmail: "",
    contestType: "",
    description: "",
    entityName: "",
    file: null as File | null,
  });

  const { authToken, userId } = useAuth();

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

        const res3 = await axios.get(`${apiUrl}/api/awardCategory`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
        setContest(res3.data);

        const res4 = await axios.get(`${apiUrl}/api/usersbyname?pageNumber=1&pageSize=100`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
        setUsers(res4.data.Users || []);

        // Fetch all departments
        const departmentResponse = await axios.get(`${apiUrl}/api/departments`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
        setAllDepartments(departmentResponse.data);
        console.log("All Departments:", departmentResponse.data);

        const entitydropdown = await axios.get(`${apiUrl}/api/tenants`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
        setEntityName(entitydropdown.data);

        // Fetch all users for nominee names
        const usersResponse = await axios.get(`${apiUrl}/api/users`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
        setAllUsers(usersResponse.data);
        console.log("All Users:", usersResponse.data);

        setForm((prev) => ({
          ...prev,
          nomineeName: user?.UserName?.trim() || "",
          department: user?.DeptName || "",
          managerEmail: user?.ManagerEmail || "",
          email: user?.Email || "",
          mobile: user?.PhoneNo || "",
        }));

      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, [authToken, userId]);

  // Filter departments when entity (tenant) is selected
  useEffect(() => {
    if (form.entityName) {
      const filteredDepts = allDepartments.filter(
        (dept) => dept.TenantID === Number(form.entityName)
      );
      setFilteredDepartments(filteredDepts);
      console.log("Filtered Departments for Tenant", form.entityName, ":", filteredDepts);
      
      // Clear department and nominee when entity changes
      setForm(prev => ({ ...prev, department: "", nomineeData: "" }));
    } else {
      setFilteredDepartments([]);
    }
  }, [form.entityName, allDepartments]);

  // Filter users based on selected entity and department
  useEffect(() => {
    let filtered = allUsers;

    // Filter by entity (tenant) if selected
    if (form.entityName) {
      filtered = filtered.filter(
        (user) => user.TenantID === Number(form.entityName)
      );
    }

    // Filter by department if selected
    if (form.department) {
      // Find the department ID from the department name
      const selectedDept = filteredDepartments.find(
        (dept) => dept.DeptName === form.department
      );
      if (selectedDept) {
        filtered = filtered.filter(
          (user) => user.DeptID === selectedDept.DeptID
        );
      }
    }

    setFilteredUsers(filtered);
    console.log("Filtered Users:", filtered);
  }, [form.entityName, form.department, allUsers, filteredDepartments]);

  const handleEntityChange = (selectedOption: any) => {
    const tenantID = selectedOption?.value || "";
    setForm({ ...form, entityName: tenantID, department: "", nomineeData: "" });
  };

  const handleDepartmentChange = (selectedOption: any) => {
    const deptName = selectedOption?.value || "";
    setForm({ ...form, department: deptName, nomineeData: "" });
  };

  const handleNomineeChange = (selectedOption: any) => {
    const nomineeName = selectedOption?.value || "";
    const selectedUser = filteredUsers.find(user => user.UserName === nomineeName);
    
    setForm({ 
      ...form, 
      nomineeData: nomineeName,
      email: selectedUser?.Email || "",
      mobile: selectedUser?.PhoneNo || "",
      managerEmail: selectedUser?.ManagerEmail || ""
    });
  };

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

  const handleBackward = () => {
    window.history.back();
  }

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
        isSelf: false,
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
        `${apiUrl}/api/nomination`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      console.log("✅ Success:", res.data);
      alert("Nomination submitted successfully!");
    } catch (err) {
      console.error("❌ Error submitting nomination:", err);
      alert("Failed to submit nomination. Please check the console.");
    }
  };

  return (
    <>
      <div className=''>

        <form className="mt-8 p-6 border rounded-lg bg-white shadow nominate-form">
          <h2 className="text-xl font-semibold mb-6">Others Nominate Form </h2>

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

          {/* Award Category & Entity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contest Type
              </label>
              <Select
                name="contestType"
                value={contest
                  .filter((c: any) => c.AwardCategoryID === Number(form.contestType))
                  .map((c: any) => ({
                    value: c.AwardCategoryID,
                    label: c.CategoryName,
                  }))[0] || null}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entity Name
              </label>
              <Select
                name="entityName"
                value={
                  entitydropdown
                    .filter((t: any) => t.TenantID === Number(form.entityName))
                    .map((t: any) => ({
                      value: t.TenantID,
                      label: t.TenantName,
                    }))[0] || null
                }
                onChange={handleEntityChange}
                options={entitydropdown.map((t: any) => ({
                  value: t.TenantID,
                  label: t.TenantName,
                }))}
                placeholder="Select Entity"
                className="text-sm"
              />
            </div>
          </div>

          {/* Department & Nominee Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <Select
                options={filteredDepartments.map((dept) => ({
                  value: dept.DeptName,
                  label: dept.DeptName,
                }))}
                value={
                  form.department
                    ? { value: form.department, label: form.department }
                    : null
                }
                onChange={handleDepartmentChange}
                placeholder={form.entityName ? "Select Department" : "Select Department"}
                isDisabled={!form.entityName}
                className="w-full text-sm"
              />
              {!form.entityName && (
                <p className="text-xs text-gray-500 mt-1">Please select an Entity first</p>
              )}
            </div>

            <div>
              <Label.Root className="block text-sm font-medium">
                Nominee Name
              </Label.Root>
              <Select
                options={filteredUsers.map((user) => ({
                  value: user.UserName,
                  label: user.UserName,
                }))}
                value={
                  form.nomineeData
                    ? { value: form.nomineeData, label: form.nomineeData }
                    : null
                }
                onChange={handleNomineeChange}
                placeholder={
                  !form.entityName ? "Select  Nominee Name" :
                  !form.department ? "Select  Nominee Name" :
                  "Select Nominee"
                }
                isDisabled={!form.entityName || !form.department}
                className="w-full text-sm"
              />
              {!form.entityName && (
                <p className="text-xs text-gray-500 mt-1">Please select an Entity first</p>
              )}
              {form.entityName && !form.department && (
                <p className="text-xs text-gray-500 mt-1">Please select a Department</p>
              )}
            </div>
          </div>

          {/* Nominated By & Manager Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <Label.Root className="block text-sm font-medium">
                Nominated by
              </Label.Root>
              <input
                type="text"
                value={form.nomineeName || ""}
                disabled
                className="w-full mt-1 border rounded px-3 py-2"
              />
            </div>
            <div>
              <Label.Root className="block text-sm font-medium">
                Manager Email Id
              </Label.Root>
              <input
                type="email"
                placeholder="Manager Email"
                value={form.managerEmail}
                disabled
                className="w-full mt-1 border rounded px-3 py-2"
              />
            </div>
          </div>

          {/* File Upload & Referrals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="mb-4">
              <Label.Root className="block text-sm font-medium">
                Supporting documents
              </Label.Root>
              <input 
                type="file"
                onChange={(e) =>
                  setForm({ ...form, file: e.target.files?.[0] || null })
                }
                className="mt-1 border-1 p-3 rounded-sm" 
              />
            </div>

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

          {/* Description */}
          <div className="mb-6">
            <Label.Root className="block text-sm font-medium">
              Description (Max 1000 chars)
            </Label.Root>
            <textarea
              placeholder="Describe the nomination..."
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
            <button
              onClick={handleSubmit}
              type="submit"
              className="px-4 py-2 btn-theme"
            >
              Submit Nomination
            </button>
          </div>
        </form>

        <Outlet />
      </div>
    </>
  );
}