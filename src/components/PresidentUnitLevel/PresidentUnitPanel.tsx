// PresidentUnitPanel.tsx
import React from "react";
import { X } from "lucide-react";
import type { Nominee } from "./PresidentUnit";

interface PresidentUnitPanelProps {
  nomineeData: Nominee | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
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
  return (
    <div
      className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">President Unit Details</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-100 transition"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto h-[calc(100%-64px)]">
        {nomineeData ? (
          <div className="space-y-6 text-sm">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="font-medium text-gray-900">Nomination ID</div>
                <div className="text-gray-600">
                  {nomineeData.NominationID}
                </div>
              </div>

              <div>
                <div className="font-medium text-gray-900">Nominee</div>
                <div className="text-gray-600">{nomineeData.Nominee}</div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="font-medium text-gray-900">Entity</div>
                <div className="text-gray-600">{nomineeData.Tenant}</div>
              </div>

              <div>
                <div className="font-medium text-gray-900">Category</div>
                <div className="text-gray-600">
                  {nomineeData.CategoryName}
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="font-medium text-gray-900">Nominated By</div>
                <div className="text-gray-600">{nomineeData.Nominee}</div>
              </div>

              <div>
                <div className="font-medium text-gray-900">
                  Submission Date
                </div>
                <div className="text-gray-600">
                  {nomineeData.SubmittedOn}
                </div>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="font-medium text-gray-900">Status</div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    statusColors[nomineeData.Status] ??
                    "bg-gray-100 text-gray-800"
                  }`}
                >
                  {nomineeData.Status}
                </div>
              </div>
            </div>

            {/* Row 5 */}
            <div>
              <div className="font-medium text-gray-900">
                President Score
              </div>
              <div className="text-gray-600">{nomineeData.Score}</div>
            </div>

            {/* Row 6 - Business Jury Remarks */}
            <div>
              <div className="font-medium text-gray-900">
                Business Jury Remarks
              </div>
              <div className="text-gray-600">
                {nomineeData.BusinessJuryRemarks || "—"}
              </div>
            </div>

            {/* Row 7 - Description */}
            <div>
              <div className="font-medium text-gray-900">Description</div>
              <div className="text-gray-600">
                {nomineeData.GeneralJuryRemarks || "—"}
              </div>
            </div>

            {/* Row 8 - Supporting Documents */}
            <div>
              <div className="font-medium text-gray-900">
                Supporting Documents
              </div>
              {nomineeData.SupportingDocuments &&
              nomineeData.SupportingDocuments.length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {nomineeData.SupportingDocuments.map((doc, idx) => (
                    <li key={idx} className="text-blue-600 underline text-xs">
                      {doc.OriginalFileName}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500 text-xs">
                  No documents uploaded
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => {
                  onReject(nomineeData.NominationID);
                  onClose();
                }}
                className="px-3 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition"
              >
                ✖ Reject Nomination
              </button>

              <button
                onClick={() => {
                  onApprove(nomineeData.NominationID);
                  onClose();
                }}
                className="px-3 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition"
              >
                ✔ Approve Nomination
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PresidentUnitPanel;
