import React from "react";
import { Filter } from "lucide-react";

interface TabsProps {
  activeTab: "Feeds" | "My Lists"|"My Business";
  setActiveTab: (tab: "Feeds" | "My Lists"|"My Business") => void;
  onFilterClick: () => void;
}

const TabsSection: React.FC<TabsProps> = ({ activeTab, setActiveTab, onFilterClick }) => {
  return (
    <div className="border-b border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4 space-y-3 sm:space-y-0">
        
        {/* Tabs */}
        <div className="flex space-x-6 sm:space-x-8 overflow-x-auto">
          {["Feeds", "My Lists","My Business"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "Feeds" | "My Lists" |"My Business")}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "text-teal-600 border-teal-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filter Button */}
        <div className="flex items-center justify-end sm:justify-start space-x-2 cursor-pointer hover:bg-gray-50 px-3 py-1 rounded">
          <button className="flex items-center space-x-2" onClick={onFilterClick}>
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">Filter</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default TabsSection;
