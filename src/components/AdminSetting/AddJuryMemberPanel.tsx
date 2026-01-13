import React, { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { useAuth } from "../ContextAPI/AuthContext";

const apiUrl = import.meta.env.VITE_API_URL;

interface Tenant {
  TenantID: number;
  TenantName: string;
}

interface UserSearch {
  
   UserID: number;
  UserName: string;
  TenantID: number;
  TenantName: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  editData?: any;
}

const AddJuryMemberPanel: React.FC<Props> = ({
  isOpen,
  onClose,
  isEdit = false,
  editData,
}) => {
  const { authToken, userId } = useAuth();

  const [name, setName] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [role, setRole] = useState<"Business" | "General" | null>(null);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);

  /* 🔍 USER SEARCH STATES */
  const [users, setUsers] = useState<UserSearch[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  /* 🔴 VALIDATION ERRORS */
  const [errors, setErrors] = useState<{
    tenant?: string;
    name?: string;
    role?: string;
  }>({});

  /* ================= FETCH TENANTS ================= */
  useEffect(() => {
    if (!isOpen || isEdit) return;

    const fetchTenants = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiUrl}/api/tenants`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setTenants(res.data || []);
      } catch (error) {
        console.error("Tenant fetch error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
    setName("");
    setTenantId("");
    setRole(null);
     setErrors({});
  }, [isOpen, isEdit, authToken]);

  /* ================= EDIT MODE PREFILL ================= */
  useEffect(() => {
    if (isEdit && editData) {
      setName(editData.UserName || "");
      setTenantId(editData.TenantID?.toString() || "");
      setTenantName(editData.TenantName || "");

      if (editData.RoleName === "Business Jury") setRole("Business");
      else if (editData.RoleName === "General Jury") setRole("General");
      else setRole(null);
    }
  }, [isEdit, editData]);

  /* ================= USER SEARCH ================= */
  useEffect(() => {
    if (!name || isEdit) {
      setUsers([]);
      setShowDropdown(false);
      return;
    }

    const debounce = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await axios.get(`${apiUrl}/api/usersrole`, {
          params: { searchText: name },
          headers: { Authorization: `Bearer ${authToken}` },
        });

        setUsers(res.data || []);
        setShowDropdown(true);
      } catch (err) {
        console.error("User search error", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [name, isEdit, authToken]);
   /* ================= VALIDATION ================= */
  const validateForm = () => {
    const newErrors: any = {};

    if (!tenantId) newErrors.tenant = "Tenant is required";
    if (!name) newErrors.name = "Name is required";
    if (!role) newErrors.role = "Please select jury role";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      debugger;
     const payload = {
       userID: isEdit ? editData.UserID : selectedUserId,
     //userID: editData.UserID : selectedUserId,
      roleID: role === "Business" ? 3 : 4,
      active: true,
      submittedBy: userId,
    };

   debugger;
      if (isEdit && editData?.UserRoleID) {
        debugger;
        await axios.put(
          `${apiUrl}/api/usersrole/${editData.UserRoleID}`,
          payload,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
      } else {
        await axios.post(`${apiUrl}/api/usersrole`, payload, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
      }

      onClose();
       window.location.reload();
    } catch (error) {
      console.error("Save failed", error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-[420px] bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Jury Member" : "Add Jury Member"}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 flex-1">
           {/* Tenant */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tenant {!isEdit && <span className="text-red-500">*</span>}
            </label>

            {isEdit ? (
              <div className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100">
                {tenantName}
              </div>
            ) : (
              <select
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Select entity</option>
                {loading && <option>Loading...</option>}
                {!loading &&
                  tenants.map((t) => (
                    <option key={t.TenantID} value={t.TenantID.toString()}>
                      {t.TenantName}
                    </option>
                  ))}
              </select>
              
            )}
             {errors.tenant && (
              <p className="text-xs text-red-500">{errors.tenant}</p>
            )}
          </div>
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Name {!isEdit && <span className="text-red-500">*</span>}
            </label>

            <div className="relative">
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSelectedUserId(null);
                  setShowDropdown(true);
                }}
                readOnly={isEdit}
                className={`w-full border rounded-md px-3 py-2 text-sm
                  ${isEdit
                    ? "bg-gray-100 cursor-not-allowed border-gray-300"
                    : "border-gray-300"}
                `}
              />

              {!isEdit && showDropdown && (
                <div className="absolute z-50 w-full bg-white border rounded-md shadow mt-1 max-h-40 overflow-auto">
                  {searchLoading && (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Searching...
                    </div>
                  )}

                  {!searchLoading && users.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No users found
                    </div>
                  )}

                  {/* {!searchLoading &&
                    users.map((u) => (
                      <div
                        key={u.UserID}
                        onClick={() => {
                          setName(u.UserName);
                          setSelectedUserId(u.UserID);
                          setShowDropdown(false);
                        }}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                      >
                        {u.UserName}
                      </div>
                    ))} */}
                    {!searchLoading &&
                  users.map((u) => (
                    <div
                      key={u.UserID}
                      onClick={() => {
                        setName(u.UserName);
                        setSelectedUserId(u.UserID);

                        // ✅ AUTO SET TENANT
                        setTenantId(u.TenantID.toString());
                        setTenantName(u.TenantName);

                        setShowDropdown(false);
                      }}
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                    >
                      {u.UserName}
                    </div>
                  ))}
                 
                </div>
                
              )}
            </div>
             {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}

          </div>

         

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-2">Jury Role</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value={3}
                  checked={role === "Business"}
                  onChange={() => setRole("Business")}
                />
                Business Jury
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                    value={4}
                  checked={role === "General"}
                  onChange={() => setRole("General")}
                />
                General Jury
              </label>
            </div>
             {errors.role && (
              <p className="text-xs text-red-500">{errors.role}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-300 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md"
          >
            Back List
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm themeColor text-white rounded-md"
          >
            {isEdit ? "Update Jury Member" : "Add Jury Member"}
          </button>
        </div>
      </div>
    </>
  );
};

export default AddJuryMemberPanel;
