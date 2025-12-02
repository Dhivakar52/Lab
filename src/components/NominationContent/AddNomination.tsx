import * as Label from "@radix-ui/react-label";
import { useEffect, useState} from "react";
import { Outlet } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../ContextAPI/AuthContext";
import type { AddNominationState } from "../../dataTypes/nomination";
import Select from "react-select";
import type { SingleValue } from "react-select";
import { useNavigate } from "react-router-dom";
//import React, { useState, useEffect } from "react";

interface OptionType {
  value: number;
  label: string;
}
interface SearchResult {
  UserName: string;
  DeptName: string;
  TenantName: string;
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

export default function AddNomination() {
  const [contest, setContest] = useState([]);
  const [allDepartments, setAllDepartments] = useState<DepartmentType[]>([]); 
  const [filteredDepartments, setFilteredDepartments] = useState<DepartmentType[]>([]); 
  const [allUsers, setAllUsers] = useState<UserType[]>([]); 
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]); 
  const [users, setUsers] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  // const [entitydropdown, setEntityName] = useState<any[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showList, setShowList] = useState(false);
  const [selectedUserID, setSelectedUserID] = useState<number | null>(null);
  const [selectedTenantID, setSelectedTenantID] = useState<number | null>(null);
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
  const navigate = useNavigate();

useEffect(() => {
    const fetchData = async () => {
      if (searchText.length < 3) {
        setResults([]);
        setShowList(false);
        return;
      }

      try {
        const response = await axios.get(
        `${apiUrl}/api/users?searchText=${searchText}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
    console.log("Search", response.data);
        setResults(response.data);
        setShowList(true);
      } catch (error) {
        console.error("User Search API Error:", error);
      }
    };

    const delay = setTimeout(fetchData, 400);
    return () => clearTimeout(delay);
  }, [searchText, apiUrl, authToken]);

  // ✔ Select result → fill textbox
  const handleSelect = (item : any) => {
    const formatted = `${item.UserName} - ${item.DeptName} - ${item.TenantName}`;
    setSearchText(formatted);
    setShowList(false);
    setSelectedUserID(item.UserID);
    setSelectedTenantID(item.TenantID);
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

        // const entitydropdown = await axios.get(`${apiUrl}/api/tenants`, {
        //   headers: {
        //     "Content-Type": "application/json",
        //     Authorization: `Bearer ${authToken}`,
        //   },
        // });
        // setEntityName(entitydropdown.data);

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

  // const handleEntityChange = (selectedOption: any) => {
  //   const tenantID = selectedOption?.value || "";
  //   setForm({ ...form, entityName: tenantID, department: "", nomineeData: "" });
  // };

  // const handleDepartmentChange = (selectedOption: any) => {
  //   const deptName = selectedOption?.value || "";
  //   setForm({ ...form, department: deptName, nomineeData: "" });
  // };

  // const handleNomineeChange = (selectedOption: any) => {
  //   const nomineeName = selectedOption?.value || "";
  //   const selectedUser = filteredUsers.find(user => user.UserName === nomineeName);
    
  //   setForm({ 
  //     ...form, 
  //     nomineeData: nomineeName,
  //     email: selectedUser?.Email || "",
  //     mobile: selectedUser?.PhoneNo || "",
  //     managerEmail: selectedUser?.ManagerEmail || ""
  //   });
  // };

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
        // awardCategoryID: Number(form.contestType),
        // userID: Number(userId),
        awardCategoryID: selectedTenantID,
        userID: selectedUserID,
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
      setSuccessMsg("Nomination submitted successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        navigate("/my-nominations");
      }, 2000);
      // alert("Nomination submitted successfully!");
      // navigate("/my-nominations");
    } catch (err) {
      console.error("❌ Error submitting nomination:", err);
      alert("Failed to submit nomination. Please check the console.");
    }
  };

  return (
    <>
    {successMsg && (
      <div
        className="fixed top-4 left-1/2 transform -translate-x-1/2 
                   bg-green-500 text-white px-6 py-3 rounded shadow-lg 
                   z-50 text-sm font-medium"
      >
        {successMsg}
      </div>
    )}

      <div className='p-5'>
        <button onClick={handleBackward} className="flex items-center text-blue-600 bg-white border-gray-100 rounded-sm px-2 py-1 font-medium">
          <span className="me-2"><ArrowLeft size={14}/></span> Back
        </button>

        <form className="mt-8 p-6 border rounded-lg bg-white shadow nominate-form">
          <h2 className="text-xl font-semibold mb-6">Others Nominate Form </h2>
      
          {/* Title */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="mb-6">
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
          </div>
        
<div className="relative mb-3">
      <input
        type="text"
        placeholder="Nomination search"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="w-full p-2.5 rounded border border-gray-300"
      />

      {showList && results.length > 0 && (
        <ul
           className="list-none m-0 p-1 absolute top-[45px] w-full bg-white border border-gray-300 
           rounded max-h-[220px] overflow-y-auto z-50 "
        >
          {results.map((item, index) => (
            <li
              key={index}
              onClick={() => handleSelect(item)}
              className="p-2 border-b border-gray-200 cursor-pointer"
            >
              <strong>{item.UserName}</strong> – {item.DeptName} - {item.TenantName}{" "}
              
            </li>
          ))}
        </ul>
      )}
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
            {/* <button type="submit" className="px-4 py-2 btn-theme">
            Submit Nomination
          </button> */}
            { <button
              onClick={handleSubmit}
              type="submit"
              className="px-4 py-2 btn-theme"
            >
              Submit Nomination
            </button> }
          </div>
        </form>

        <Outlet />
      </div>
    </>
  );
}