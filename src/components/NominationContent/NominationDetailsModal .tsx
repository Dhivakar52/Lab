import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

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
  };
}

const NominationDetailsModal: React.FC<NominationDetailsProps> = ({ isOpen, onClose, data }) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/10" />
        
        {/* Slide-over panel */}
        <Dialog.Content className="fixed top-0 right-0 h-full w-full max-w-md bg-white  border-l border-gray-200 overflow-y-auto">
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
          <div className="px-6 py-6">
            <div className="space-y-6">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Nomination ID</div>
                  <div className="text-sm text-gray-600">{data.nominationId}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Nominee</div>
                  <div className="text-sm text-gray-600">{data.nominee}</div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Entity</div>
                  <div className="text-sm text-gray-600">{data.entity}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Category</div>
                  <div className="text-sm text-gray-600">{data.category}</div>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Nominated By</div>
                  <div className="text-sm text-gray-600">{data.nominatedBy}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Submission Date</div>
                  <div className="text-sm text-gray-600">{data.submissionDate}</div>
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Contest Type</div>
                  <div className="text-sm text-gray-600">{data.contestType}</div>
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

              {/* Row 5 */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Manager Email Id</div>
                  <div className="text-sm text-gray-600">{data.managerEmail}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Referrals Email Id</div>
                  <div className="text-sm text-gray-600">
                    {data.referrals.map((email, index) => (
                      <div key={index}>{email}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description - Full width */}
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">Description</div>
                <div className="text-sm text-gray-600">{data.description}</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end absolute w-[100%] bottom-0">
            <Dialog.Close className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors ">
              Close
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default NominationDetailsModal;