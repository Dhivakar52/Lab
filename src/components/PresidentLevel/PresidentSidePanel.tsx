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
            <div className="flex justify-around items-center gap-4 mt-4">
                 {/* Reject Button */}
                  <button
                    onClick={() => {
                        onReject(nominee.NominationID);
                        onClose();
                      }}
                      className="px-2 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition flex items-center"
                    >
                      ✖ Reject Nomination
                  </button>

                  {/* Approve Button */}
                  <button
                   onClick={() => {
                        onApprove(nominee.NominationID);
                        onClose(); 
                      }}
                    className="px-2 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition flex items-center"
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

export default PresidentSidePanel;
