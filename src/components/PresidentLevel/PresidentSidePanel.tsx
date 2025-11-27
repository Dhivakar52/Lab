import React from "react";
import PresidentLevel from "./PresidentLevel";
import { CheckCircle, XCircle, Clock, Menu, Trophy } from 'lucide-react'; // Import necessary icons
import { X, Flag } from "lucide-react";

type PresidentLevel = {
  NominationID: number;
   Nominee: string;
  Tenant: string;
  CategoryName: string;
  ConsolidatedAvgScore: number;
  Score: number;
  Status: 'Approved' | 'Rejected' | 'Pending' | string;
  FinalStatus:'Winner' | 'Runner-Up' | string;
  Comments: string;
};
interface PresidentSidePanelProps {
    nominee: PresidentLevel | null;
    isOpen: boolean;
    onClose: () => void;
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
}

const statusColors: Record<PresidentLevel["Status"], string> = {
  Pending: "bg-orange-100 text-orange-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

const PresidentSidePanel: React.FC<PresidentSidePanelProps> = ({ 
  isOpen,
  onClose,
  nominee,
  onApprove,
  onReject
}) => {
  const baseClasses = "px-2 py-2 text-white rounded-md shadow transition flex items-center";
  const rejectClasses = `${baseClasses} bg-red-600 hover:bg-red-700`;
  const approveClasses = `${baseClasses} bg-green-600 hover:bg-green-700`;
  const containerClasses = "flex justify-around items-center gap-4 mt-4";
  const ActionButtons = () => {
    if (!nominee) return null; // Safety check

    // Helper functions for specific buttons (using props from BusinessPanel scope)
    const RejectButton = () => (
      <button
        onClick={() => {
          onReject(nominee.NominationID);
          onClose();
        }}
        className={rejectClasses}
      >
        ✖ Reject Nomination
      </button>
    );

    const ApproveButton = () => (
      <button
        onClick={() => {
          onApprove(nominee.NominationID);
          onClose();
        }}
        className={approveClasses}
      >
        ✔ Approve Nomination
      </button>
    );
    
    // Switch logic for rendering the correct combination
    switch (nominee.Status) {
      case 'Pending':
        return (
          <div className={containerClasses}>
            <RejectButton />
            <ApproveButton />
          </div>
        );
      case 'Approved':
        // If approved, only the reject button should show up
        return (
          <div className={containerClasses}>
            <RejectButton />
          </div>
        );
      case 'Rejected':
        // If rejected, only the approve button should show up
        return (
          <div className={containerClasses}>
            <ApproveButton />
          </div>
        );
      default:
        return null;
    }
  };
   return (
   <div
      className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
       <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">President Evaluation Details</h2>
        <button
                  onClick={onClose}
                  className="p-1 rounded-md hover:bg-gray-100 transition"
                >
                  <X size={20} className="text-gray-500" />
                </button>
      </div>
    
      {/* Content */}
      {/* Side Panel */}
      <div className="p-5 overflow-y-auto h-[calc(100%-64px)]">
    {nominee ? (
          <div className="space-y-5 text-sm">

            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Nominee Name</div>
                <div className="text-sm text-gray-600">{nominee.Nominee}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Award Category</div>
                <div className="text-sm text-gray-600">{nominee.CategoryName}</div>

              </div>
            </div>
            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Entity</div>
                <div className="text-sm text-gray-600">{nominee.Tenant}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Consolidated Avg Score</div>
                <div className="text-sm text-gray-600">{nominee.ConsolidatedAvgScore}</div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">President Score</div>
                <div className="text-sm text-gray-600">{nominee.Score}</div>
              </div>

               <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Flag</div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[nominee.Status]}`} >
                    {nominee.Status}
                  </span>              
                </div>
            </div>

             {/* Row 4 */}
                       
           <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">

                <div className="text-sm font-medium text-gray-900">Final Status</div>
              <div className="text-sm text-gray-600">
                  {nominee.FinalStatus === 'Winner' ? (
                      <span style={{ display: 'flex', alignItems: 'center' }} className="text-sm text-gray-600"><Trophy/> &nbsp; Winner </span>
                  ) : nominee.FinalStatus === 'Runner-Up' ? (
                      <span className="text-sm text-gray-600">Runner-Up</span>
                  ) : (
                      nominee.FinalStatus
                  )}
              </div>
              </div>
             
            </div>

             {/* Row 5 – Supporting Documents */}
            <div className="grid grid-cols-2 gap-8">
                <div className="text-sm font-medium text-gray-900">Nomination Summary</div>
            </div>
            <div className="grid grid-cols-1 gap-12">
                <textarea className="border" placeholder="Add your evaluation comments..." rows={5} // Sets the initial visible height
               />
          </div>
            <ActionButtons/>
          </div>
        ) : null}
        </div>
    </div>
  );
};

export default PresidentSidePanel;
