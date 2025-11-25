import React from "react";
import { X, Flag,FileText } from "lucide-react";

interface BusinessJury  {
  NominationID: number;
  Nominee: string;
  Tenant: number;
  CategoryName: string;
  SubmittedOn: string;
  Score: number;
  Comments: string;
  Status: string;
  "Supporting Documents": {
    OriginalFileName: string;
    FileType: string;
    FileNameGUID: string;
    FilePath: string;
  }[];
};

interface NomineeSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  nominee: BusinessJury | null;
onApprove: (id: number) => void;
onReject: (id: number) => void;
}

const statusColors: Record<BusinessJury["Status"], string> = {
  Pending: "bg-orange-100 text-orange-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

const BusinessPanel: React.FC<NomineeSidePanelProps> = ({
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
        <h2 className="text-lg font-semibold">Business Jury Review</h2>
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
          <div className="space-y-5 text-sm">

            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-8">              
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Nominee</div>
                <div className="text-sm text-gray-600">{nominee.Tenant}</div>
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
                <div className="text-sm font-medium text-gray-900">Score (Out of 100)</div>
                <div className="text-sm text-gray-600">{nominee.Score}</div>
              </div>
             
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Submitted On</div>
                <div className="text-sm text-gray-600">{nominee.SubmittedOn}</div>
              </div>

               <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Flag</div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[nominee.Status]}`}>
                  {nominee.Status}
                </span>
               </div>
            </div>

           
             {/* Row 7 – Supporting Documents */}
            <div>
              <div className="font-medium">Supporting Documents</div>
              <div className="text-gray-600 space-y-1">
			  
                {nominee["Supporting Documents"]?.map((doc, i) => (
                <a
                  key={i}
                  href={doc.FilePath}   // replace with your download/view URL
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex my-3 items-center gap-2 text-blue-600 hover:underline"
                >
                  <FileText className="w-5 h-5 text-blue-600" />
                  {doc.OriginalFileName}
                </a>
              ))}
              </div>
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

export default BusinessPanel;
