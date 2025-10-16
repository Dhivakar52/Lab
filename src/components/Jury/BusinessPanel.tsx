import React from "react";
import { X, Flag } from "lucide-react";

type Nominee = {
  name: string;
  entity: string;
  category: string;
  score: number;
  flag?: boolean;
};

interface NomineeSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  nominee: Nominee | null;
}

const BusinessPanel: React.FC<NomineeSidePanelProps> = ({
  isOpen,
  onClose,
  nominee,
}) => {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center border-b p-4">
        <h2 className="text-lg font-semibold text-gray-800">Nominee Details</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-100 transition"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto h-[calc(100%-64px)]">
        {nominee ? (
          <div className="space-y-3 text-sm">
            <p>
              <strong>Name:</strong> {nominee.name}
            </p>
            <p>
              <strong>Entity:</strong> {nominee.entity}
            </p>
            <p>
              <strong>Category:</strong> {nominee.category}
            </p>
            <p>
              <strong>Score:</strong> {nominee.score}
            </p>
            <p>
              <strong>Flag:</strong>{" "}
              {nominee.flag ? (
                <Flag className="inline w-4 h-4 text-red-500" />
              ) : (
                <span className="text-gray-500">No</span>
              )}
            </p>
          </div>
        ) : (
          <p className="text-gray-500">No nominee selected.</p>
        )}
      </div>
    </div>
  );
};

export default BusinessPanel;
