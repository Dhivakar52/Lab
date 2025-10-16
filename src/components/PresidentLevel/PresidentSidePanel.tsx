
import React from "react";

interface PresidentSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  nominee: any;
}

const PresidentSidePanel: React.FC<PresidentSidePanelProps> = ({ isOpen, onClose, nominee }) => {
  if (!isOpen || !nominee) return null;

  return (
    <div className="fixed inset-0 flex justify-end z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={onClose}
      ></div>

      {/* Side Panel */}
      <div className="relative w-96 bg-white h-full shadow-xl p-6 overflow-y-auto rounded-l-2xl">
        <h2 className="text-xl font-semibold mb-4">Nominee Details</h2>

        <div className="space-y-3">
          <p><strong>Name:</strong> {nominee.nominee}</p>
          <p><strong>Entity:</strong> {nominee.entity}</p>
          <p><strong>Category:</strong> {nominee.category}</p>
          <p><strong>Consolidated Score:</strong> {nominee.consolidatedScore}</p>
          <p><strong>President Score:</strong> {nominee.presidentScore}</p>
          <p><strong>Flag:</strong> {nominee.flag}</p>
          <p><strong>Status:</strong> {nominee.finalStatus}</p>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default PresidentSidePanel;
