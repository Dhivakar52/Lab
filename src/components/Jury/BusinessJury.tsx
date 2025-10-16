import React, { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Menu, Flag } from "lucide-react";
import SearchComponent from "../SearchComponent";
import FilterComponent from "../FilterComponent";
import BusinessPanel from "./BusinessPanel"; 

type Nominee = {
  name: string;
  entity: string;
  category: string;
  score: number;
  flag?: boolean;
};

const data: Nominee[] = [
  { name: "Ravi Kumar", entity: "SRMAP", category: "Innovation", score: 95 },
  { name: "Riya Sharma", entity: "SRM Tech", category: "Service Excellence", score: 85 },
  { name: "Amit Verma", entity: "SRM Media", category: "Talent", score: 70, flag: true },
  { name: "Suresh Iyer", entity: "Puthiya thalaimurai", category: "Customer Focus", score: 82 },
  { name: "Sathish Kumar", entity: "SRMAP", category: "Leadership Excellence", score: 80 },
  { name: "Balaji", entity: "SRM Research", category: "Best Innovation", score: 84 },
  { name: "Manikandan", entity: "SRM Research", category: "Service", score: 82 },
  { name: "Prakash", entity: "SRM Research", category: "Customer Focus", score: 80 },
  { name: "Kumaran", entity: "SRM Research", category: "Best Innovation", score: 86 },
];

const BusinessJury: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [selectedNominee, setSelectedNominee] = useState<Nominee | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const filteredData = data.filter(
    (nom) =>
      nom.name.toLowerCase().includes(search.toLowerCase()) ||
      nom.entity.toLowerCase().includes(search.toLowerCase()) ||
      nom.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 m-5 bg-white rounded-xl shadow-md relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h2 className="text-xl font-bold text-gray-800">Business Jury Evaluation</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <SearchComponent search={search} setSearch={setSearch} />
          <FilterComponent />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100 rounded-t-lg">
            <tr>
              {["Nominee", "Entity", "Category", "Score", "Flag", "Actions"].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-600"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((nominee, idx) => (
              <tr
                key={idx}
                className={
                  idx % 2 === 0
                    ? "bg-white hover:bg-gray-50 transition-colors"
                    : "bg-gray-50 hover:bg-gray-100 transition-colors"
                }
              >
                <td className="px-6 py-3 text-gray-900">{nominee.name}</td>
                <td className="px-6 py-3 text-gray-900">{nominee.entity}</td>
                <td className="px-6 py-3 text-gray-900">{nominee.category}</td>
                <td className="px-6 py-3 text-gray-900">{nominee.score}</td>
                <td className="px-6 py-3 text-gray-900">
                  {nominee.flag ? (
                    <Flag className="w-4 h-4 text-red-500" />
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-sm">NA</span>
                  )}
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
                          setSelectedNominee(nominee);
                          setIsPanelOpen(true);
                        }}
                      >
                        View
                      </DropdownMenu.Item>
                      <DropdownMenu.Item className="px-2 py-1 hover:bg-gray-100 cursor-pointer">
                        Edit
                      </DropdownMenu.Item>
                      <DropdownMenu.Item className="px-2 py-1 hover:bg-gray-100 cursor-pointer">
                        Delete
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Right-Side Panel */}
      <BusinessPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        nominee={selectedNominee}
      />
    </div>
  );
};

export default BusinessJury;
