import React from "react";
import { X, FileText } from "lucide-react";

interface ReferralPopup {
  NominationID: number;
  nominee: string | null;
  entity: string | null;
  contest: string | null;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
  AwardCategory: string;
  NominatedBy: string;
  ManagerEmailID: string;

 // "Referrals ID": { Email: string }[];
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

  Descriptions: string;
}

interface NominationSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  nomination: ReferralPopup | null;
  onApprove: () => void;
  onReject: () => void;
}

const statusColors: Record<ReferralPopup["status"], string> = {
  Pending: "bg-orange-100 text-orange-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

const ReferralPanel: React.FC<NominationSidePanelProps> = ({
  isOpen,
  onClose,
  nomination,
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
        <h2 className="text-lg font-semibold">Referral Approval</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-100 transition"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto h-[calc(100%-64px)]">
        {nomination ? (
          <div className="space-y-5 text-sm">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="font-medium">Nomination ID</div>
                <div className="text-gray-600">{nomination.NominationID}</div>
              </div>

              <div>
                <div className="font-medium">Nominee</div>
                <div className="text-gray-600">{nomination.nominee}</div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="font-medium">Entity</div>
                <div className="text-gray-600">{nomination.entity}</div>
              </div>

              <div>
                <div className="font-medium">Category</div>
                <div className="text-gray-600">{nomination.AwardCategory}</div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="font-medium">Nominated By</div>
                <div className="text-gray-600">{nomination.NominatedBy}</div>
              </div>

              <div>
                <div className="font-medium">Submission Date</div>
                <div className="text-gray-600">{nomination.date}</div>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="font-medium">Contest Type</div>
                <div className="text-gray-600">{nomination.contest}</div>
              </div>

              <div>
                <div className="font-medium">Status</div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[nomination.status]}`}
                >
                  {nomination.status}
                </div>
              </div>
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="font-medium">Manager Email</div>
                <div className="text-gray-600">{nomination.ManagerEmailID}</div>
              </div>

              {/* <div>
                <div className="font-medium">Referrals</div>
                <div className="text-gray-600 space-y-1">
                  {nomination["Referrals ID"]?.map((ref, i) => (
                    <div key={i}>{ref.Email} - {ref.TenantName} - {ref.DeptName}</div>
                  ))}
                </div>
              </div> */}
              <div >
                 <div className="font-medium">Referrals</div>
              <div className="text-gray-600 space-y-3">
                 
                  {nomination["Referrals ID"]?.map((ref, i) => (
                    <div key={i} className="border-b pb-2">
                      <div>
                       {/* {ref.ReferralName} */}
                        <p className="text-sm font-semibold">{ref.ReferralName}</p>
                      </div>
                      <div>
                        {ref.TenantName}
                      </div>
                      <div>
                        {ref.DeptName}
                      </div>
                    </div>
                  ))}
                </div>
            </div>

            </div>

            {/* Description */}
            <div>
              <div className="font-medium">Descriptions</div>
              <div className="text-gray-600">{nomination.Descriptions}</div>
            </div>

            {/* Supporting Docs */}
            <div>
              <div className="font-medium">Supporting Documents</div>
              <div className="text-gray-600 space-y-1">
                {nomination["Supporting Documents"]?.map((doc, i) => (
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
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-around gap-4 mt-6">
              <button
                onClick={() => {
                  onReject();
                  onClose();
                }}
                className="px-3 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700"
              >
                ✖ Reject Nomination
              </button>
              <button
                onClick={() => {
                  onApprove();
                  onClose();
                }}
                className="px-3 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700"
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

export default ReferralPanel;
