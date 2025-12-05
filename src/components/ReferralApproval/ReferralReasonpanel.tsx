// ReferralReasonPanel.tsx
import React, { useState, useEffect } from "react";

interface ReferralReasonPanelProps {
  isOpen: boolean;
  onClose: () => void;
  nomination: any | null;
  reason: string;
  setReason: (value: string) => void;
  actionType: "approve" | "reject" | null;
  onApprove: () => void;
  onReject: () => void;
}

const ReferralReasonPanel: React.FC<ReferralReasonPanelProps> = ({
  isOpen,
  onClose,
  nomination,
  reason,
  setReason,
  actionType,
  onApprove,
  onReject,
}) => {
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setErrorMsg("");
    }
  }, [isOpen]);

  if (!isOpen || !nomination) return null;

  // Dynamic message based on approve / reject
  const message =
    actionType === "approve"
      ? "Are you sure you want to approve this nomination?"
      : "Are you sure you want to reject this nomination?";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[400px] relative">

        <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
        >
            ✖
        </button>
        {/* Header */}
        <h2 className="text-lg font-semibold mb-3">{message}</h2>
         

        {/* Reason Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Reason <span className="text-red-600">*</span>
          </label>

          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setErrorMsg("");
            }}
            rows={4}
            placeholder="Enter your reason..."
            className={`w-full border rounded-lg p-2 text-sm ${
              errorMsg ? "border-red-500" : "border-gray-300"
            }`}
          />

          {errorMsg && <p className="text-red-600 text-xs mt-1">{errorMsg}</p>}
        </div>

        {/* YES / NO Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            NO
          </button>

          <button
            onClick={() => {
              if (!reason.trim()) {
                setErrorMsg("Please enter a reason");
                return;
              }

              if (actionType === "approve") {
                onApprove();
              } else if (actionType === "reject") {
                onReject();
              }

              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            YES
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralReasonPanel;
