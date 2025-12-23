import React, { useState } from "react";
import {  Search, Plus, Menu } from "lucide-react";
import BackToSetting from "../BackToSetting";
import AddJuryMemberPanel from "./AddJuryMemberPanel";

interface JuryMember {
  id: string;
  name: string;
  entity: string;
  role: "Business" | "General";
}

const JuryPanelSetup: React.FC = () => {
   const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [juryMembers] = useState<JuryMember[]>([
    {
      id: "1",
      name: "Dr. Ramesh Kumar",
      entity: "SRM Hospital",
      role: "Business",
    },
    {
      id: "2",
      name: "Prof. Anitha Rao",
      entity: "SRM University",
      role: "General",
    },
    {
      id: "3",
      name: "Mr. S. Venkatesh",
      entity: "Global Holdings",
      role: "Business",
    },
    {
      id: "4",
      name: "Ms. Divya Shankar",
      entity: "SRM Tech",
      role: "General",
    },
    {
      id: "5",
      name: "Dr. Rajiv Menon",
      entity: "Puthiya Thalaimurai",
      role: "Business",
    },
    {
      id: "6",
      name: "Mr. Arvind Kumar",
      entity: "SRM MHS",
      role: "General",
    },
  ]);

  const handleAddMember = () => {
  setIsPanelOpen(true);
   };

  const handleViewDetails = (id: string) => {
    console.log("View details for:", id);
  };

  const filteredMembers = juryMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.entity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="">
      <div className="">
        {/* Back Button */}
        <BackToSetting/>

        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Jury Panel Setup
            </h1>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              {/* Add Button */}
              <button
                onClick={handleAddMember}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Jury Member
              </button>
            </div>
          </div>

          {/* Table */}
            <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Jury Members List
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {member.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {member.entity}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {member.role === "Business" ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                          Business
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                          General
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-center">
                      <button
                        onClick={() => handleViewDetails(member.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Menu className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AddJuryMemberPanel
      isOpen={isPanelOpen}
      onClose={() => setIsPanelOpen(false)}
    />
    </div>
  );
};

export default JuryPanelSetup;