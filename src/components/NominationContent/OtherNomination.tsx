import { useEffect, useState, useRef } from "react";
import * as Label from "@radix-ui/react-label";
import { Outlet } from "react-router-dom";
import axios, {  } from "axios";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../ContextAPI/AuthContext";
import type { AddNominationState } from "../../dataTypes/nomination";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import type { ClearIndicatorProps } from "react-select";

// interface OptionType {
//   value: number;
//   label: string;
// }
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

export default function OtherNomination() {
  const [contest, setContest] = useState([]);
  const [allDepartments, setAllDepartments] = useState<DepartmentType[]>([]); 
  const [filteredDepartments, setFilteredDepartments] = useState<DepartmentType[]>([]); 
  const [allUsers, setAllUsers] = useState<UserType[]>([]); 
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]); 
  const [_users, setUsers] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  // const [entitydropdown, setEntityName] = useState<any[]>([]);
  const [successMsg, _setSuccessMsg] = useState("");
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showList, setShowList] = useState(false);
  const [selectedUserID, setSelectedUserID] = useState<number | null>(null);
  const [selectedTenantID, setSelectedTenantID] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [entitydropdown, setEntityName] = useState<any[]>([]);
  // const [nomineeEmail, setNomineeEmail] = useState("");
  const [form, setForm] = useState<AddNominationState>({
    title: "",
    nomineeName: "",
    // nomineeData: "",
    // department: "",
    // entityName: "",
    nomineeData:[],
    department:[],
    entityName:[],
    email: "",
    mobile: "",
    managerEmail: "",
    contestType: "",
    description: "",
    file: null as File | null,
  });
  // const [nominee, setNominee] = useState("");
  // const [category, setCategory] = useState("");
  // const [entity, setEntity] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showErrorModal, setShowErrorModal] = useState(false);

  const validateForm = () => {
  const newErrors: { [key: string]: string } = {};

  if (!form.title.trim()) newErrors.title = "Title is required.";
  if (!form.contestType) newErrors.contestType = "Contest type is required.";
  if (!form.nomineeName?.trim()) newErrors.nomineeName = "Nominated by is required.";
  if (!form.managerEmail?.trim()) newErrors.managerEmail = "Manager email is required.";
  //if (referrals.length < 3) newErrors.referrals = "Please select 3 referrals.";
  if (!selectedUserID) newErrors.nomineeSearch = "Please select a nominee from the search list.";

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
const emailRef = useRef<HTMLTextAreaElement>(null);

useEffect(() => {
  if (emailRef.current) {
    emailRef.current.style.height = "auto"; // reset
    emailRef.current.style.height = emailRef.current.scrollHeight + "px"; // set new height
  }
}, [form.email]); // runs whenever emails change

const NoClearIndicator = (_props: ClearIndicatorProps<any, true>) => {
  return null;
};
    console.log("Form Submitted");
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
    setForm({
      ...form,
      nomineeName: item.UserName,
      managerEmail: item.Email,
    });
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
          department:  [],
          nomineeData: [],
          managerEmail: user?.ManagerEmail || "",
          //email: user?.Email || "",
          email:"",
          mobile: user?.PhoneNo || "",
        }));

      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, [authToken, userId]);

 useEffect(() => {
  setFilteredDepartments(allDepartments ?? []);
  setFilteredUsers(allUsers ?? []);
}, [allDepartments, allUsers]);

 useEffect(() => {
  if (form.entityName.length > 0) {
    const selectedTenantIDs = form.entityName;

    const depts = allDepartments.filter(d =>
      selectedTenantIDs.includes(d.TenantID)
    );

    const users = allUsers.filter(u =>
      selectedTenantIDs.includes(Number(u.TenantID))
    );

    setFilteredDepartments(depts);
    setFilteredUsers(users);
  } else {
    setFilteredDepartments(allDepartments ?? []);
    setFilteredUsers(allUsers ?? []);
  }
}, [form.entityName, allDepartments, allUsers]);
useEffect(() => {
  if (form.department.length > 0) {
    const filtered = allUsers.filter(u =>
      form.department.includes(u.DeptName)
    );

    setFilteredUsers(filtered);
  } else {
    // restore based on entities
    if (form.entityName.length > 0) {
      setFilteredUsers(
        allUsers.filter(u =>
          form.entityName.includes(Number(u.TenantID))
        )
      );
    } else {
      setFilteredUsers(allUsers ?? []);
    }
  }
}, [form.department, form.entityName, allUsers]);

 
  const handleEntityChange = (selected: any) => {
  const tenantIDs = selected?.map((x: any) => x.value) ?? [];

  setForm((prev) => ({
    ...prev,
    entityName: tenantIDs,
    department: [],
    nomineeData: [],
    email: ""
  }));
};
const handleDepartmentChange = (selected: any) => {
  const deptNames = selected?.map((x: any) => x.value) ?? [];

  setForm((prev) => ({
    ...prev,
    department: deptNames,
    nomineeData: [],
    email: ""
  }));
};
const handleNomineeChange = (selected: any) => {
  const nomineeNames = selected?.map((x: any) => x.value) ?? [];

  const selectedUsers = filteredUsers.filter(u =>
    nomineeNames.includes(u.UserName)
  );

  const emails = selectedUsers.map(u => u.Email).join(", ");

  setForm((prev) => ({
    ...prev,
    nomineeData: nomineeNames,
    email: emails
  }));
};

//   const handleSelectReferral = (selected: { value: string; label: string } | null) => {
//   if (!selected) return;
//   if (!referrals.some((r) => r.UserID === selected.value)) {
//     setReferrals([...referrals, { UserID: selected.value, UserInfo: selected.label }]);
//   }
// };

//   const removeReferral = (userID: number) => {
//     setReferrals(referrals.filter((r) => r.UserID !== userID));
//   };
  //const [tab, setTab] = useState<"table" | "form">("table");
  const handleBackward = () => {
  navigate("/my-nominations", { state: { tab: "form" } });
  };
  const handleModalOk = () => {
    setShowSuccessModal(false);
    navigate("/my-nominations", { state: { tab: "form" } });
  };
  const handleClear = () => {
  // Reset main form fields
  setForm(prevForm => ({
    ...prevForm,
    title: "",
    contestType: "",
    description: "",
    // Keep fields that shouldn't change
    nomineeName: prevForm.nomineeName,
    department: prevForm.department,
    email: prevForm.email,
    mobile: prevForm.mobile,
    managerEmail: prevForm.managerEmail,
    nomineeData: prevForm.nomineeData ?? null,
    file: null,
    files: [],
  }));

  // Reset referral list and nominee search textbox
  setReferrals([]);
  setSearchText("");

  // Reset any errors
  setErrors({});
};
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return; 

    console.log("Form submitted successfully", form, referrals);
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
      setShowSuccessModal(true);
      console.log("✅ Success:", res.data);
    
      // alert("Nomination submitted successfully!");
      // navigate("/my-nominations");
    } catch (err) {
      console.error("❌ Error submitting nomination:", err);
     setShowErrorModal(true);
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
          <div className="">
            <Label.Root htmlFor="title" className="block text-sm font-medium">
              Title of Submission<span className="text-red-500"> *</span>
            </Label.Root>
            <input
              id="title"
              type="text"
              placeholder="Best Innovation"
              value={form.title}
              // onChange={(e) => setForm({ ...form, title: e.target.value })}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {const value = e.target.value;
              setForm(prevForm => ({...prevForm,title: value }));
              if (value) {setErrors(prevErrors => ({...prevErrors, title: ""}));}}}
              className="w-full mt-1 border rounded px-3 py-2"
            />
             {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
             </div>
            <div className="">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contest Type<span className="text-red-500"> *</span>
              </label>
              <Select
                name="contestType"
                value={contest
                  .filter((c: any) => c.AwardCategoryID === Number(form.contestType))
                  .map((c: any) => ({
                    value: c.AwardCategoryID,
                    label: c.CategoryName,
                  }))[0] || null}
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
          <div className="">
          <Label.Root htmlFor="title" className="block text-sm font-medium">
                Nominee<span className="text-red-500"> *</span>
              </Label.Root>
          <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Nomination search"
                  value={searchText}
                  //onChange={(e) => setSearchText(e.target.value)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const target = e.target as HTMLInputElement;
                    const value = target.value;
                    setSearchText(value);
                    if (value) { setErrors(prevErrors => ({...prevErrors, nomineeSearch: "" }));  } }}
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
                {errors.nomineeSearch && <p className="text-red-500 text-sm mt-1">{errors.nomineeSearch}</p>}
            </div>
            </div>
          {/* Nominated By & Manager Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div >
              <Label.Root className="block text-sm font-medium">
                Nominated by<span className="text-red-500"> *</span>
              </Label.Root>
              <input
                type="text"
                value={form.nomineeName || ""}
                disabled
                className="w-full mt-1 border rounded px-3 py-2"
              />
                {errors.nomineeName && <p className="text-red-500 text-sm mt-1">{errors.nomineeName}</p>}
            </div>
            <div>
              <Label.Root className="block text-sm font-medium">
                Manager Email Id<span className="text-red-500"> *</span>
              </Label.Root>
              <input
                type="email"
                placeholder="Manager Email"
                value={form.managerEmail}
                disabled
                className="w-full mt-1 border rounded px-3 py-2"
              />
             {errors.managerEmail && <p className="text-red-500 text-sm mt-1">{errors.managerEmail}</p>}
            </div>
          </div>

          {/* File Upload & Referrals */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entity Name
              </label>
             <Select isMulti
              components={{ ClearIndicator: NoClearIndicator }}
              name="entityName"
              value={entitydropdown
                .filter(t => form.entityName.includes(t.TenantID))
                .map(t => ({ value: t.TenantID, label: t.TenantName }))
              }
              onChange={handleEntityChange}
              options={entitydropdown.map(t => ({
                value: t.TenantID,
                label: t.TenantName
              }))}
              placeholder="Select Entity"
              className="text-sm"
              isSearchable />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <Select isMulti
              components={{ ClearIndicator: NoClearIndicator }}
              options={filteredDepartments.map(d => ({
                value: d.DeptName,
                label: d.DeptName
              }))}
              value={form.department.map(d => ({ value: d, label: d }))}
              onChange={handleDepartmentChange}
              placeholder="Select Department"
              className="text-sm"
              isSearchable />
            </div>
            <div>
              <Label.Root className="block text-sm font-medium text-gray-700 mb-2">
                Nominee Name
              </Label.Root>
              <Select isMulti
              components={{ ClearIndicator: NoClearIndicator }}
              options={filteredUsers.map(u => ({
                value: u.UserName,
                label: u.UserName
              }))}
              value={form.nomineeData.map(n => ({ value: n, label: n }))}
              onChange={handleNomineeChange}
              placeholder="Select Nominee"
              className="text-sm"
              isSearchable />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nominee Email</label>
        <textarea
  ref={emailRef}
  value={form.email}
  readOnly
  className="w-full border rounded px-3 py-2 overflow-hidden resize-none"
  rows={1}
/>
          </div>
           </div>
          {/* Description */}
          <div className="">
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
            <button
              type="button" onClick={handleClear}
              className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100" >
              Clear
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
      {showErrorModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-md w-96 text-center">
      <h2 className="text-lg font-semibold mb-4 text-red-600">Error</h2>
      <p className="mb-6">Failed to submit nomination. Please try again</p>
      <button
        onClick={() => setShowErrorModal(false)}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        OK
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
