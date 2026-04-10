import { useEffect, useState} from "react";
import * as Label from "@radix-ui/react-label";
import { Outlet } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../ContextAPI/AuthContext";
import type { AddNominationState } from "../../dataTypes/nomination";
import Select from "react-select";
import { useParams,useNavigate } from "react-router-dom";

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

// const emptyForm: AddNominationState = {
//   title: "",
//   nomineeName: "",
//   nomineeData: [],
//   department: [],
//   email: "",
//   mobile: "",
//   managerEmail: "",
//   contestType: "",
//   description: "",
//   entityName: [],
//   file: null,
// };

const apiUrl = import.meta.env.VITE_API_URL;

export default function AddNomination() {
  const [contest, setContest] = useState([]);
  const [allDepartments, setAllDepartments] = useState<DepartmentType[]>([]); 
  const [filteredDepartments, setFilteredDepartments] = useState<DepartmentType[]>([]); 
  const [allUsers, setAllUsers] = useState<UserType[]>([]); 
  const [_filteredUsers, setFilteredUsers] = useState<UserType[]>([]); 
  const [users, setUsers] = useState<any[]>([]);
 
  // const [entitydropdown, setEntityName] = useState<any[]>([]);
  const [successMsg, _setSuccessMsg] = useState("");
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showList, setShowList] = useState(false);
  const [selectedUserID, setSelectedUserID] = useState<number | null>(null);
  const [_selectedTenantID, setSelectedTenantID] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [form, setForm] = useState<AddNominationState>({
    title: "",
    nomineeName: "",
    nomineeData: [],
    department: [],
    email: "",
    mobile: "",
    managerEmail: "",
    contestType: "",
    description: "",
    entityName: [],
    file: null as File | null,
  });
  // const [nominee, setNominee] = useState("");
  // const [category, setCategory] = useState("");
  // const [entity, setEntity] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [referrals, setReferrals] = useState<any[]>([]);
  // const [data, setData] = useState<any>(null);
  // const [loading, setLoading] = useState(true);
  const { nominationId } = useParams<{ nominationId: string }>();
  const [errorMessage, setErrorMessage] = useState("");
  const isEditMode = Boolean(nominationId);
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

    console.log("Form Submitted");
  const { authToken, userId } = useAuth();
    const loggedInUserId = Number(userId);

  const navigate = useNavigate();
const disableFields = isEditMode;

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
       const filteredResults = (response.data || []).filter(
          (user: any) => Number(user.UserID) !== Number(userId)
        );

        setResults(filteredResults);
        setShowList(true);
      } catch (error) {
        console.error("User Search API Error:", error);
      }
    };

    const delay = setTimeout(fetchData, 400);
    return () => clearTimeout(delay);
  }, [searchText, apiUrl, authToken]);

  // ✔ Select result → fill textbox
   const handleSelect = (item: any) => {
  const formattedLabel = `${item.UserName} - ${item.DeptName} - ${item.TenantName}`;
 
  setSearchText(formattedLabel);
  setShowList(false);
 
  setSelectedUserID(item.UserID);
  setSelectedTenantID(item.TenantID);
 
  setForm(prev => ({
    ...prev,
    managerEmail: item.ManagerEmail || "",  
  }));
 
  setErrors(prev => ({
    ...prev,
    nomineeSearch: "",
    managerEmail: "",
  }));
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
        setUsers(res4.data.Users|| []);

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
          email: user?.Email || "",
          mobile: user?.PhoneNo || "",
        }));

      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, [authToken, userId]);

useEffect(() => {
  if (!isEditMode || !nominationId) return;

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

     // const userId = data?.UserID;
 
      const userData = await axios.get(
          `${apiUrl}/api/users?userId=${res.data[0].UserID}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

      setForm(prev => ({
        ...prev,
        title: data.NominationTitle ?? "",
        nomineeName: data.Nominee ?? "",
        department: data.NomineeDepartment ?? "",
        description: data.Descriptions ?? "",
        email: prev.email ?? "",
        mobile: prev.mobile ?? "",
        managerEmail:  userData.data[0].ManagerEmail ?? "",
        contestType: data.AwardCategoryID
          ? String(data.AwardCategoryID)
          : "",
      }));
       setSearchText(
      `${data.Nominee} - ${data.NomineeDepartment} - ${data.Tenant}`
    );
    setSelectedUserID(data.UserID);
    setSelectedTenantID(data.TenantID);
       setForm(prev => ({
      ...prev,
      nomineeName: data.UserName,
      managerEmail: userData.data[0].ManagerEmail,
    }));
    
      setReferrals(
      data["Referrals ID"]?.map((r: any) => ({
        UserID: r.UserID,
        UserInfo: r.Email,
        ReferralID:r.ReferralID     
      })) || []
    );
    } catch (err) {
      console.error("❌ Error fetching nomination:", err);
    }
  };

  fetchNominationById();
}, [nominationId, isEditMode, authToken]);

  // Filter departments when entity (tenant) is selected
  useEffect(() => {
    if (form.entityName) {
      const filteredDepts = allDepartments.filter(
        (dept) => dept.TenantID === Number(form.entityName)
      );
      setFilteredDepartments(filteredDepts);
      
      // Clear department and nominee when entity changes
      setForm(prev => ({ ...prev, department: [], nomineeData: [] }));
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
        (dept) => dept.DeptName === form.department[0]
      );
      if (selectedDept) {
        filtered = filtered.filter(
          (user) => user.DeptID === selectedDept.DeptID
        );
      }
    }

    setFilteredUsers(filtered);
  }, [form.entityName, form.department, allUsers, filteredDepartments]);

  
  const handleBackward = () => {
    navigate("/my-nominations", {
      state: { tab: "others" }   
    });
  };

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
    navigate("/my-nominations", { state: { tab: "others" } });
  };
  const handleClear = () => {
  // Reset main form fields
  setForm(prevForm => ({
    ...prevForm,
    title: "",
    contestType: "",
    description: "",
    managerEmail: "",
    // Keep fields that shouldn't change
    nomineeName: prevForm.nomineeName,
    department: prevForm.department,
    email: prevForm.email,
    mobile: prevForm.mobile,
    //managerEmail: prevForm.managerEmail,
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
  if (!authToken) {
    alert("⚠️ You are not authorized. Please log in again.");
    return;
  }

const payload = {
    nomination: {
      cycleID: 1,
      nominationID: isEditMode ? Number(nominationId) : 0,
      awardCategoryID: Number(form.contestType),
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
        referralID: ref.ReferralID,
        nominationID: isEditMode ? Number(nominationId) : 0,
        referralUserID: ref.UserID,
        isReferralApproved: true,
        approvalComments: "",
        active: true,
        createdBy: Number(userId),
        updatedBy: Number(userId),
        referralEmail: ref.UserInfo
      })),    
  };

  try {    
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
      setShowErrorModal(true);
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
    {successMsg && (
      <div
        className="fixed top-4 left-1/2 transform -translate-x-1/2 
                   bg-green-500 text-white px-6 py-3 rounded shadow-lg 
                   z-50 text-sm font-medium">
        {successMsg}
      </div>
    )}
    <div className='p-5 pb-[96px]'>
      <div className="bg-gray-100 flex flex-col"> 
        <div className="w-full px-1 py-1">
         <form className="px-8 py-8 pb-[96px] rounded-lg bg-white shadow nominate-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="">
            <Label.Root htmlFor="title" className="block text-sm font-medium">
              Title of Submission<span className="text-red-500"> *</span>
            </Label.Root>
            <input id="title" type="text" placeholder="Best Innovation" value={form.title} 
            disabled={disableFields} maxLength={100}
              // onChange={(e) => setForm({ ...form, title: e.target.value })}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {const value = e.target.value;
              setForm(prevForm => ({...prevForm,title: value }));
              if (value) {setErrors(prevErrors => ({...prevErrors, title: ""}));}}}
              className="w-full mt-1 border rounded px-3 py-2 disabled:bg-gray-100"/>
             {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
             <p className="text-gray-500 text-sm mt-1">{form.title.length}/100 characters</p>
             </div>
             <div className="">
          <Label.Root htmlFor="title" className="block text-sm font-medium">
            Nominee<span className="text-red-500"> *</span>
          </Label.Root>
          <div className="relative mb-3">
             <input type="text" placeholder="Nomination search" value={searchText}
              disabled={disableFields} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const target = e.target as HTMLInputElement;
              const value = target.value;
              setSearchText(value);
              if (value) { setErrors(prevErrors => ({...prevErrors, nomineeSearch: "" }));  } }}
              className="w-full mt-1 border rounded px-3 py-2 disabled:bg-gray-100"/>  
              {showList && results.length > 0 && (
                <ul
                  className="list-none m-0 p-1 absolute top-[45px] w-full bg-white border border-gray-300 
                  rounded max-h-[220px] overflow-y-auto z-50 ">
                  {results.map((item, index) => (
                    <li
                      key={index}
                      onClick={() => handleSelect(item)}
                      className="p-2 border-b border-gray-200 cursor-pointer">
                      <strong>{item.UserName}</strong> – {item.DeptName} - {item.TenantName}{" "}
                    </li>
                  ))}
                </ul>
              )}
                {errors.nomineeSearch && <p className="text-red-500 text-sm mt-1">{errors.nomineeSearch}</p>}
            </div>
          </div>
          </div>
          {/* Nominated By & Manager Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <Label.Root className="block text-sm font-medium">
                Nominated by<span className="text-red-500"> *</span>
              </Label.Root>
              <input
                type="text"
                value={form.nomineeName || ""}
                disabled
                className="w-full mt-1 border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed select-none pointer-events-none caret-transparent outline-none"/>
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
                className="w-full mt-1 border rounded bg-gray-100 px-3 py-2"/>
             {errors.managerEmail && <p className="text-red-500 text-sm mt-1">{errors.managerEmail}</p>}
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
          {/*Contest Type & Referrals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
             <div className="">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contest Type<span className="text-red-500"> *</span>
              </label>
              <Select isDisabled={isEditMode} name="contestType" value={contest
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
                className="text-sm"/>
                {errors.contestType && <p className="text-red-500 text-sm mt-1">{errors.contestType}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Referrals Email ID 
              </label>
              <Select
                options={users
                  .filter((u) => u.UserID !== loggedInUserId &&
                   !referrals.some((ref) => ref.UserID === u.UserID))
                  .map((u) => ({
                  value: u.UserID,
                  label: u.UserInfo,
                }))}
                value={referrals.length ? { value: referrals[referrals.length - 1].UserID, 
                label: referrals[referrals.length - 1].UserInfo } : null}
                onChange={handleSelectReferral}
                placeholder="Search and select referral..."
                isSearchable
                className="text-sm" />
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
           {/* </div>
           </div> */}
        </form>   
        <Outlet />
        </div>
         </div> 
           {/* Buttons */}
      <div className="fixed bottom-0 left-0 w-full h-15 bg-white border-t border-gray-200 flex items-center pl-[260px] pr-6">
        <div className="flex justify-end space-x-4 ml-auto" >
          {/* <div className="flex justify-end space-x-4"> */}
            <button onClick={handleBackward} className="flex items-center text-blue-600 bg-white border rounded-sm px-2 py-1 font-medium">
             <span className=""><ArrowLeft size={14}/></span> Back
             </button>
            <button type="button"  onClick={() => {
            if (isEditMode) {
              navigate(-1);
            } else {
              handleClear(); 
            }
          }}
          // className="px-4 py-2 bg-white border border-blue-600 rounded text-gray-600 hover:bg-blue-50"
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100" >
            {isEditMode ? "Cancel" : "Clear"}
            </button>
            { <button
              onClick={handleSubmit} type="submit" className="px-4 py-2 btn-theme">
             {isEditMode ? "Update Nomination" : "Submit Nomination"}
            </button> }
          </div>
      </div>
 </div>
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-96 text-center">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Error</h2>
            <p className="mb-6">Failed to submit nomination. Please try again</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              OK
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
              : "Nomination submitted successfully!"}</p>
                <button onClick={handleModalOk }  className="px-4 py-2 btn-theme">OK</button>
              </div>
            </div>
          )}
        </>
      );
}
