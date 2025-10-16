import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Menu } from 'lucide-react';
import SearchComponent from '../SearchComponent';
import FilterComponent from '../FilterComponent';
import PresidentUnitPanel from './PresidentUnitPanel'; 

interface Nominee {
  nominee: string;
  entity: string;
  category: string;
  consolidatedScore: number;
  presidentScore: number;
  flag: string;
  finalStatus: 'Winner' | 'Runner-up';
}

const data: Nominee[] = [
  { nominee: 'Ravi Kumar', entity: 'SRMAP', category: 'Innovation', consolidatedScore: 95, presidentScore: 96, flag: '✔', finalStatus: 'Winner' },
  { nominee: 'Riya Sharma', entity: 'SRM Tech', category: 'Service Excellence', consolidatedScore: 85, presidentScore: 92, flag: '✔', finalStatus: 'Winner' },
  { nominee: 'Amit Verma', entity: 'SRM Media', category: 'Talent', consolidatedScore: 90, presidentScore: 93, flag: '✔', finalStatus: 'Winner' },
  { nominee: 'Suresh Iyer', entity: 'Puthiya Thalaimurai', category: 'Customer Focus', consolidatedScore: 87, presidentScore: 90, flag: '✔', finalStatus: 'Winner' },
  { nominee: 'Sathish Kumar', entity: 'SRMAP', category: 'Leadership Excellence', consolidatedScore: 85, presidentScore: 87, flag: '✔', finalStatus: 'Runner-up' },
  { nominee: 'Balaji', entity: 'SRM Research', category: 'Best Innovation', consolidatedScore: 86, presidentScore: 89, flag: '✔', finalStatus: 'Runner-up' },
];

const statusColors: Record<Nominee['finalStatus'], string> = {
  'Winner': 'bg-blue-100 text-blue-800',
  'Runner-up': 'bg-gray-100 text-gray-800',
};

const PresidentUnit: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedNominee, setSelectedNominee] = useState<Nominee | null>(null);

  const filteredData = data.filter(
    (item) =>
      item.nominee.toLowerCase().includes(search.toLowerCase()) ||
      item.entity.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
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
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Nominee</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Entity</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Category</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Consolidated Avg Score</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">President Score</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Flag</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Final Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 text-sm text-gray-900">{item.nominee}</td>
                <td className="px-6 py-3 text-sm text-gray-900">{item.entity}</td>
                <td className="px-6 py-3 text-sm text-gray-900">{item.category}</td>
                <td className="px-6 py-3 text-sm text-gray-900">{item.consolidatedScore}</td>
                <td className="px-6 py-3 text-sm text-gray-900">{item.presidentScore}</td>
                <td className="px-6 py-3 text-green-600 font-bold">{item.flag}</td>
                <td className="px-6 py-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[item.finalStatus]}`}>
                    {item.finalStatus}
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
                        onClick={() => setSelectedNominee(item)}
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

      {/* Panel */}
      <PresidentUnitPanel nomineeData={selectedNominee} onClose={() => setSelectedNominee(null)} />
    </div>
  );
};

export default PresidentUnit;
