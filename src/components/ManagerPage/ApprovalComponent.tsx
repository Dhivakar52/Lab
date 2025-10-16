import React, { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Menu } from "lucide-react";
import SearchComponent from "../SearchComponent";
import FilterComponent from "../FilterComponent";
import ApprovalPanel from "./ApprovalPanel";

interface Nomination {
  id: string;
  nominee: string;
  entity: string;
  contest: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
}

const nominations: Nomination[] = [
  { id: "SELF-0851", nominee: "Ravi Kumar", entity: "SRMAP", contest: "Self Nomination", date: "07/20/2025", status: "Pending" },
  { id: "NOM-0321", nominee: "Ayesha Thomas", entity: "SRM MHS", contest: "Nominate Others", date: "07/18/2025", status: "Pending" },
  { id: "NOM-0456", nominee: "Varun Mishra", entity: "SRM Tech", contest: "Nominate Others", date: "07/15/2025", status: "Approved" },
  { id: "SELF-0852", nominee: "Fatima Noor", entity: "PT", contest: "Self Nomination", date: "07/10/2025", status: "Approved" },
  { id: "NOM-0458", nominee: "Priya Raj", entity: "SRM Sikkim", contest: "Nominate Others", date: "07/08/2025", status: "Rejected" },
  { id: "SELF-0856", nominee: "Arjun Patel", entity: "SRM Holdings", contest: "Self Nomination", date: "07/02/2025", status: "Approved" },
];

const statusColors: Record<Nomination["status"], string> = {
  Pending: "bg-orange-100 text-orange-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

const ApprovalComponent: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [selectedNomination, setSelectedNomination] = useState<Nomination | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const filteredNominations = nominations.filter(
    (nom) =>
      nom.nominee.toLowerCase().includes(search.toLowerCase()) ||
      nom.entity.toLowerCase().includes(search.toLowerCase()) ||
      nom.contest.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 m-5 bg-white rounded-xl shadow-md relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-baseline sm:items-center mb-4 gap-3">
        <h2 className="text-xl font-bold">Nominations for Review</h2>
        <div className="flex space-x-2 w-full sm:w-auto">
          <SearchComponent search={search} setSearch={setSearch} />
          <FilterComponent />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Nominate ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Nominee</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Entity</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Contest Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Submitted Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredNominations.map((nom) => (
              <tr key={nom.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 text-sm text-gray-900">{nom.id}</td>
                <td className="px-6 py-3 text-sm text-gray-900">{nom.nominee}</td>
                <td className="px-6 py-3 text-sm text-gray-900">{nom.entity}</td>
                <td className="px-6 py-3 text-sm text-gray-900">{nom.contest}</td>
                <td className="px-6 py-3 text-sm text-gray-900">{nom.date}</td>
                <td className="px-6 py-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[nom.status]}`}>
                    {nom.status}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger className="p-2 rounded hover:bg-gray-100">
                      <Menu className="w-5 h-5 text-blue-500" />
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content className="bg-white shadow-md rounded-md p-2">
                      <DropdownMenu.Item
                        className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedNomination(nom);
                          setIsPanelOpen(true);
                        }}
                      >
                        View
                      </DropdownMenu.Item>
                      <DropdownMenu.Item className="px-2 py-1 hover:bg-gray-100 cursor-pointer">Approve</DropdownMenu.Item>
                      <DropdownMenu.Item className="px-2 py-1 hover:bg-gray-100 cursor-pointer">Reject</DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Separate Side Panel */}
      <ApprovalPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        nomination={selectedNomination}
      />
    </div>
  );
};

export default ApprovalComponent;
