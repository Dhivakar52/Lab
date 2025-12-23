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
}

const AddJuryMemberPanel: React.FC<Props> = ({ isOpen, onClose }) => {
  const { authToken } = useAuth();

  const [name, setName] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [role, setRole] = useState<"Business" | "General">("Business");

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch tenants
  useEffect(() => {
    if (!isOpen) return;

    const fetchTenants = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiUrl}/api/tenants`, {
          headers: {
            "Content-Type": "application/json",
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

    // reset fields
    setName("");
    setTenantId("");
    setRole("Business");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-[420px] bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Add Jury Member</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 flex-1">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              placeholder="Enter jury member name"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                         focus:outline-none focus:ring-0 focus:border-gray-300"
            />
          </div>

          {/* Tenant Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tenant <span className="text-red-500">*</span>
            </label>
            <select
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                         focus:outline-none focus:ring-0 focus:border-gray-300"
            >
              <option value="">Select entity</option>

              {loading && <option>Loading...</option>}

              {!loading &&
                tenants.map((t) => (
                  <option key={t.TenantID} value={t.TenantID}>
                    {t.TenantName}
                  </option>
                ))}
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Jury Role
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={role === "Business"}
                  onChange={() => setRole("Business")}
                />
                Business Jury
              </label>

              <label className="flex items-center gap-2 text-sm">
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
            className="px-4 py-2 text-sm border border-gray-300 rounded-md"
          >
            Back List
          </button>

          <button
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            onClick={() => {
              console.log({
                name,
                tenantId,
                role,
              });
            }}
          >
            Add Jury Member
          </button>
        </div>
      </div>
    </>
  );
};

export default AddJuryMemberPanel;
