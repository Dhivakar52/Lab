import React, { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { useAuth } from "../ContextAPI/AuthContext";

const apiUrl = import.meta.env.VITE_API_URL;

interface Tenant {
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
  const [tenantName, setTenantName] = useState(""); // 🔥 NEW
  const [role, setRole] = useState<"Business" | "General">("Business");

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH TENANTS (ADD MODE ONLY) ================= */
  useEffect(() => {
    if (!isOpen || isEdit) return;

    const fetchTenants = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiUrl}/api/tenants`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
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
    setRole("Business");
  }, [isOpen, isEdit, authToken]);

  
  useEffect(() => {
    if (isEdit && editData) {
      setName(editData.UserName || "");
      setTenantId(editData.TenantID?.toString() || "");
      setTenantName(editData.TenantName || ""); 
      setRole(
        editData.RoleName?.includes("Business") ? "Business" : "General"
      );
    }
  }, [isEdit, editData]);

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      const payload = {
        userID: Number(tenantId),
        roleID: role === "Business" ? 1 : 2,
        active: true,
        submittedBy: userId,
      };

      await axios.post(`${apiUrl}/api/usersrole`, payload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      onClose();
    } catch (error) {
      console.error("Save failed", error);
    }
  };
  const handleSave1 = async () => {
  try {
    const payload = {
      userName: name,
      tenantID: Number(tenantId),
      roleID: role === "Business" ? 1 : 2,
      active: true,
      submittedBy: userId,
    };

    if (isEdit && editData?.UserRoleID) {
      // 🔥 EDIT → PUT
      await axios.put(
        `${apiUrl}/api/usersrole/${editData.UserRoleID}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      console.log("UPDATED SUCCESSFULLY");
    } else {
      // 🔥 ADD → POST
      await axios.post(
        `${apiUrl}/api/usersrole`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      console.log("ADDED SUCCESSFULLY");
    }

    onClose();
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
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Jury Member" : "Add Jury Member"}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 flex-1">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Name {!isEdit && <span className="text-red-500">*</span>}
            </label>
            {/* <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            /> */}
             <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={isEdit}   
              className={`w-full border rounded-md px-3 py-2 text-sm
                ${isEdit 
                  ? "bg-gray-100 cursor-not-allowed border-gray-300" 
                  : "border-gray-300"}
              `}
            />
          </div>

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
                    <option
                      key={t.TenantID}
                      value={t.TenantID.toString()}
                    >
                      {t.TenantName}
                    </option>
                  ))}
              </select>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-2">Jury Role</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={role === "Business"}
                  onChange={() => setRole("Business")}
                />
                Business Jury
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={role === "General"}
                  onChange={() => setRole("General")}
                />
                General Jury
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-md"
          >
            Back List
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md"
          >
            {isEdit ? "Update Jury Member" : "Add Jury Member"}
          </button>
        </div>
      </div>
    </>
  );
};

export default AddJuryMemberPanel;
