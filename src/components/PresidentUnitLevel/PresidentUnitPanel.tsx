import React from "react";

interface Nominee {
  nominee: string;
  entity: string;
  category: string;
  consolidatedScore: number;
  presidentScore: number;
  flag: string;
  finalStatus: "Winner" | "Runner-up";
}

interface NomineePanelProps {
  nomineeData: Nominee | null;
  onClose: () => void;
}

const PresidentUnitPanel: React.FC<NomineePanelProps> = ({ nomineeData, onClose }) => {
  if (!nomineeData) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl p-6 border-l border-gray-200 z-50 transition-transform transform">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Nominee Details</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 font-semibold"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <p><strong>Nominee:</strong> {nomineeData.nominee}</p>
        <p><strong>Entity:</strong> {nomineeData.entity}</p>
        <p><strong>Category:</strong> {nomineeData.category}</p>
        <p><strong>Consolidated Score:</strong> {nomineeData.consolidatedScore}</p>
        <p><strong>President Score:</strong> {nomineeData.presidentScore}</p>
        <p><strong>Flag:</strong> {nomineeData.flag}</p>
        <p><strong>Status:</strong> {nomineeData.finalStatus}</p>
      </div>
    </div>
  );
};

export default PresidentUnitPanel;
