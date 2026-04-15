import { X } from "lucide-react";
import * as Label from "@radix-ui/react-label";
import { useRef } from "react";

interface Props {
  openReferralPopup: boolean;
  closeApproveDrawer: () => void;
  refStatus: string;
  setRefStatus: any;
  refComments: string;
  setRefComments: any;
  referralDocuments: any[];
  handleFileUpload: any;
  removeFile: any;
  handleFilePreview: any;
  submitReferral: () => void;
  isEditMode: boolean;
  refFileError?: string;
}

const ReferralApprovalDrawer = (props: Props) => {
  const {
    openReferralPopup,
    closeApproveDrawer,
    refStatus,
    setRefStatus,
    refComments,
    setRefComments,
    referralDocuments,
    handleFileUpload,
    removeFile,
    handleFilePreview,
    submitReferral,
    isEditMode,
    refFileError
  } = props;

  const refFileRef = useRef<HTMLInputElement>(null);
  // const [attachmentMode, setAttachmentMode] = useState("juryApproval");
  return (
       <div
            className={`fixed top-0 right-0 h-full w-[680px] bg-white shadow-2xl z-50
            transform transition-transform duration-300 ease-in-out
            ${openReferralPopup ? "translate-x-0" : "translate-x-full"}`}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-[16px] font-semibold text-gray-900">
                Referral Approval
              </h2>
              <button onClick={closeApproveDrawer}>
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-6 text-sm text-gray-800 overflow-y-auto h-[calc(100%-70px)]">
              <div className="mb-[18px]">
                <label className="block mb-2 font-medium">Status</label>
                <select
                  value={refStatus}
                  onChange={(e) =>
                    setRefStatus(e.target.value as "Approved" | "Rejected")
                  }
                  className="w-full h-[42px] px-3 border border-gray-300 rounded-[6px]">
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="mb-[18px]">
                <label className="block mb-2 font-medium">Comments</label>
                <textarea
                  rows={3}
                  value={refComments}
                  onChange={(e) => setRefComments(e.target.value)}
                  placeholder="Enter your comments"
                  className="w-full px-3 py-2 border rounded-[6px] border-gray-300"/>
              </div>
              <div className="mb-[18px]">
                <Label.Root className="block text-sm font-medium">
                  Supporting Documents
                  <span className="text-red-500">
                    (Max 5 files & below 2MB)
                  </span>
                </Label.Root>
                <label
                  htmlFor="refUpload"
                  className="inline-block bg-gray-100 text-gray-700 border border-gray-300 px-6 py-2 rounded cursor-pointer mt-2 hover:bg-gray-200">
                  Choose File
                </label>
                <input
                  id="refUpload"
                  ref={refFileRef}
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e, "referral")}
                  className="hidden"/>
                  {refFileError && <p className="text-red-500 text-sm mt-1">{refFileError}</p>}
               <div className="mt-3 flex flex-wrap gap-2">
                  {referralDocuments.map((doc: any, index: number) => (
                    <div
                      key={doc.source === "api" ? doc.fileNameGUID : index}
                      className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg shadow-sm border">
                      <span
                        className="text-sm truncate max-w-[180px] cursor-pointer text-blue-600 hover:underline"
                        onClick={() => handleFilePreview(doc)}>
                        {doc.originalFileName || doc.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(doc, index, "referral")}
                        className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={closeApproveDrawer}
                  className="h-[42px] px-6 border border-gray-300 rounded-[6px]">
                  Cancel
                </button>
                <button
                  onClick={submitReferral}
                  className="h-[44px] px-8 rounded-md shadow btn-theme">
                  {isEditMode ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
  );
};

export default ReferralApprovalDrawer;