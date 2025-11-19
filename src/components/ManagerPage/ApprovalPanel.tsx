import React from "react";
import { X } from "lucide-react";
 
interface Nomination {
  NominationID: number;
  nominee: string | null;
  entity: string | null;
  contest: string | null;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
}
 
interface NominationSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  nomination: Nomination | null;
}
 
 
interface NominationSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  nomination: Nomination | null;
}
 
const statusColors: Record<Nomination["status"], string> = {
  Pending: "bg-orange-100 text-orange-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};
 
const ApprovalPanel: React.FC<NominationSidePanelProps> = ({
  isOpen,
  onClose,
  nomination,
}) => {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Approval Details</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-100 transition"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>
 
      <div className="p-5 overflow-y-auto h-[calc(100%-64px)]">
        {nomination ? (
          <div className="space-y-3 text-sm">
            <p>
              <strong>Nomination ID:</strong> {nomination.NominationID}
            </p>
            <p>
              <strong>Nominee:</strong> {nomination.nominee}
            </p>
            <p>
              <strong>Entity:</strong> {nomination.entity}
            </p>
            <p>
              <strong>Contest:</strong> {nomination.contest}
            </p>
            <p>
              <strong>Date:</strong> {nomination.date}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[nomination.status]}`}
              >
                {nomination.status}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-gray-500">No details available.</p>
        )}
      </div>
    </div>
  );
};
 
export default ApprovalPanel;
 