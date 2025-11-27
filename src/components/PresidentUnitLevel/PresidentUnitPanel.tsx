import React, { useState } from "react";
import { X } from "lucide-react";
import type { Nominee } from "./PresidentUnit";

interface PresidentUnitPanelProps {
  nomineeData: Nominee | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (nominee: Nominee, comments: string) => void; 
  onReject: (nominee: Nominee, comments: string) => void;
}

const statusColors: Record<string, string> = {
  Pending: "bg-orange-100 text-orange-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

const PresidentUnitPanel: React.FC<PresidentUnitPanelProps> = ({
  nomineeData,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  const [comments, setComments] = useState("");

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">President Unit Details</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md">
          <X size={20} />
        </button>
      </div>

      <div className="p-5 overflow-y-auto h-[calc(100%-64px)]">
        {nomineeData && (
          <div className="space-y-6 text-sm">

            {/* Details */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="font-medium text-gray-900">Nomination ID</div>
                <div className="text-gray-600">{nomineeData.NominationID}</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Nominee</div>
                <div className="text-gray-600">{nomineeData.Nominee}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="font-medium text-gray-900">Entity</div>
                <div className="text-gray-600">{nomineeData.Tenant}</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Category</div>
                <div className="text-gray-600">{nomineeData.CategoryName}</div>
              </div>
            </div>

           <div className="grid grid-cols-2 gap-8">

  {/* President Score */}
  <div>
    <div className="font-medium text-gray-900">President Score</div>
    <div className="text-gray-600">{nomineeData.Score}</div>
  </div>

  {/* Status */}
  <div>
    <div className="font-medium text-gray-900">Status</div>
    <div
      className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${
        statusColors[nomineeData.Status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {nomineeData.Status}
    </div>
  </div>

</div>

            

            {/* COMMENT BOX */}
            <div>
              <div className="font-medium text-gray-900">President Comments</div>
              <textarea
                rows={4}
                className="w-full mt-2 p-2 border rounded-md text-sm"
                placeholder="Enter comments..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              ></textarea>
            </div>

            {/* Approve / Reject Buttons */}
           {/* Approve / Reject Buttons */}
<div className="flex justify-between items-center mt-6 w-full">

  {/* Reject Button */}
  <button
    onClick={() => {
      onReject(nomineeData, comments);
      onClose();
    }}
    className="px-3 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700"
    style={{
      visibility: nomineeData.Status === "Rejected" ? "hidden" : "visible",
    }}
  >
    ✖ Reject Nomination
  </button>

  {/* Approve Button */}
  <button
    onClick={() => {
      onApprove(nomineeData, comments);
      onClose();
    }}
    className="px-3 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700"
    style={{
      visibility: nomineeData.Status === "Approved" ? "hidden" : "visible",
    }}
  >
    ✔ Approve Nomination
  </button>

</div>

          </div>
        )}
      </div>
    </div>
  );
};

export default PresidentUnitPanel;
