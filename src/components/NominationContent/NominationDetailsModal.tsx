import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X ,FileText} from 'lucide-react';
//import { data } from 'react-router-dom';

interface NominationDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    nominationId: string;
    nominee: string;
    entity: string;
    category: string;
    nominatedBy: string;
    submissionDate: string;
    contestType: string;
    status: string;
    managerEmail: string;
    referrals: string[];
    description: string | undefined;
    managerEmailID : string;
    "Referrals ID": {
    Email: string;
    TenantName: string;
    DeptName: string;
    ReferralName:string;
  }[];

  "Supporting Documents": {
    OriginalFileName: string;
    FileType: string;
    FileNameGUID: string;
    FilePath: string;
  }[];
  };
}
const NominationDetailsModal: React.FC<NominationDetailsProps> = ({ isOpen, onClose, data }) => {
  console.log("Nomination Details Modal Data : ", data);
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/10" />
        
        {/* Slide-over panel */}
        {/* <Dialog.Content className="fixed top-0 right-0 h-full w-full max-w-md bg-white  border-l border-gray-200 overflow-y-auto"> */}
         <Dialog.Content className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-gray-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Nomination Details
            </Dialog.Title>
            <Dialog.Close className="p-1 rounded-md hover:bg-gray-100 transition-colors">
              <X size={20} className="text-gray-500" />
            </Dialog.Close>
          </div>

          {/* Content */}
          {/* <div className="px-6 py-6"> */}
          <div className="px-6 py-6 flex-1 overflow-y-auto">
            <div className="space-y-4">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-4">
                {/* <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Nomination ID</div>
                  <div className="text-sm text-gray-600">{data.nominationId}</div>
                </div> */}
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Nominee</div>
                  <div className="text-sm text-gray-600">{data.nominee}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Tenant</div>
                  <div className="text-sm text-gray-600">{data.entity}</div>
                </div>
              </div>
              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Category</div>
                  <div className="text-sm text-gray-600">{data.category}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Nominated By</div>
                  <div className="text-sm text-gray-600">{data.nominatedBy}</div>
                </div>
              </div>
              {/* Row 3 */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Submission Date</div>
                  <div className="text-sm text-gray-600">{data.submissionDate}</div>
                </div>
                <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-900">Status</div>
                    <div className="flex">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          data.status === "Pending"
                            ? "bg-orange-100 text-orange-800"
                            : data.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : data.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : data.status === "Under Review"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {data.status}
                      </span>
                    </div>
                  </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-2 gap-8">
                {/* <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Contest Type</div>
                  <div className="text-sm text-gray-600">{data.contestType}</div>
                </div> */}
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Manager</div>
                  <div className="text-sm text-gray-600">{data.managerEmail}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Manager Email ID</div>
                  <div className="text-sm text-gray-600">{data.managerEmailID}</div>
                </div>
              </div> 
              <div className="text-sm font-medium text-gray-900 mb-1">Referrals</div>
              <div className="text-gray-600 space-y-1">
                {data["Referrals ID"]?.length ? (
                  data["Referrals ID"].map((ref, i) => (
                    <div key={i} >
                      <p className="text-sm">
                        <span className="font-semibold text-gray-800">{ref.ReferralName}</span>
                        <span className="px-2 text-gray-500">|</span>
                        <span className="text-gray-600">{ref.TenantName}</span>
                        <span className="px-2 text-gray-500">|</span>
                        <span className="font-semibold text-gray-600">{ref.DeptName}</span>
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No referral details available</p>
                )}
              </div>
              {/* Description - Full width */}
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Description</div>
                <div className="text-sm text-gray-600">{data.description && data.description.trim() !== ""
                ? data.description : "No description provided"}</div>
              </div>
              {/* Supporting Documents */}
            <div>
            <div className="text-sm font-medium text-gray-900">Supporting Documents</div>
             <div className="mt-2 space-y-2">
               {data["Supporting Documents"]?.length ? (
                data["Supporting Documents"].map((doc, i) => (
               <a
               key={i}
               href={doc.FilePath}
               target="_blank"
               rel="noopener noreferrer"
              className="flex my-2 items-center gap-2 text-blue-600 hover:underline"
               >
              <FileText className="w-5 h-5 text-blue-600" />
              {doc.OriginalFileName}
             </a>
              ))
             ) : (
             <p className="text-gray-500 text-sm">No documents uploaded</p>
             )}
              </div>
             </div>
            </div>
          </div>

          {/* Footer */}
          {/* <</Dialog.Portal>div className="px-6 py-4 border-t border-gray-200 flex justify-end absolute w-[100%] bottom-0"> */}
         {/* <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-white">
            <Dialog.Close className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors ">
              Close
            </Dialog.Close>
          </div> */}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default NominationDetailsModal;