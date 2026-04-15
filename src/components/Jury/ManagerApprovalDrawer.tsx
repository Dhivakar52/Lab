import { X, Flag } from "lucide-react";
import * as Label from "@radix-ui/react-label";
import { useRef } from "react";

interface Props {
  openApprove: boolean;
  closeApproveDrawer: () => void;
  status: string;
  setStatus: any;
  popupComments: string;
  setPopupComments: any;
  popupErrors: any;
  setPopupErrors: any;
  approvalDocuments: any[];
  handleFileUpload: any;
  removeFile: any;
  handleFilePreview: any;
  submitManagerApproval: () => void;
  isEditMode: boolean;
  isFlagged: boolean;
  setIsFlagged: any;
  flagComment: string;
  setFlagComment: any;
  flagDocuments: any[];
  approvalFileError?: string;
  flagFileError?: string;
}

const ManagerApprovalDrawer = (props: Props) => {
  const {
    openApprove,
    closeApproveDrawer,
    status,
    setStatus,
    popupComments,
    setPopupComments,
    popupErrors,
    setPopupErrors,
    approvalDocuments,
    handleFileUpload,
    removeFile,
    handleFilePreview,
    submitManagerApproval,
    isEditMode,
    isFlagged,
    setIsFlagged,
    flagComment,
    setFlagComment,
    flagDocuments,
    approvalFileError,
    flagFileError
  } = props;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const approvalFileRef = useRef<HTMLInputElement>(null);
  const flagFileRef = useRef<HTMLInputElement>(null);
  // const [attachmentMode, setAttachmentMode] = useState("juryApproval");
  return (
      <div className={`fixed top-0 right-0 h-full w-[680px] bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${openApprove ? "translate-x-0" : "translate-x-full"}
        `}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-[16px] font-semibold text-gray-900">
            Level 1 - Manager Approval
          </h2>
          <button onClick={closeApproveDrawer}>
            <X size={20} />
          </button>
        </div>
        {/* <div className="px-6 py-6 text-sm text-gray-800"> */}
        <div className="px-6 py-6 text-sm text-gray-800 overflow-y-auto h-[calc(100%-70px)]">
          <div className="mb-[18px]">
            <label className="block mb-2 font-medium">
              Status
            </label>
            <select value={status}
              onChange={(e) => setStatus(e.target.value as "Approved" | "Rejected")}
              className="w-full h-[42px] px-3 border border-gray-300 rounded-[6px]">
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="mb-[18px]">
            <label className="block mb-2 font-medium">
              Comments <span className="text-red-500"> *</span>
            </label>
            <textarea rows={3} value={popupComments}
              onChange={(e) => {
                const value = e.target.value;
                setPopupComments(value);
                if (value.trim()) {
                  setPopupErrors((prev :any) => ({
                    ...prev,
                    comments: ""
                  }));
                }
              }}
              placeholder="Enter your comments"
              className={`w-full px-3 py-2 border rounded-[6px]
                ${popupErrors.comments ? "border-red-500" : "border-gray-300"}`}/>
            {popupErrors.comments && (
              <p className="text-red-600 text-xs mt-1">{popupErrors.comments}</p>
            )}
          </div>
           <div className="mb-[18px]">
            <div className="mt-4">
              <Label.Root className="block text-sm font-medium">
                Supporting Documents 
                <span className="text-red-500">(Maximum 5 files allowed & File must be below 2 MB)</span>
              </Label.Root>
              <label
                htmlFor="approvalUpload"
                className="inline-block bg-gray-100 text-gray-700 border border-gray-300 px-6 py-2 rounded cursor-pointer mt-2 hover:bg-gray-200">
                Choose File
              </label>
              <input
                id="approvalUpload"
                ref={approvalFileRef}
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, "approval")}
                className="hidden" />
              {approvalFileError  && <p className="text-red-500 text-sm mt-1">{approvalFileError }</p>}
            </div>         
           <div className="mt-3 flex flex-wrap gap-2">
              {approvalDocuments.map((doc: any, index: number) => (
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
                    onClick={() => removeFile(doc, index, "approval")}
                    className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">
                    ×
                  </button>
                </div>
              ))}
            </div>
             </div> 
          <div className="flex items-center gap-2 mb-[18px]">
            <Flag size={18} className={isFlagged ? "text-red-600" : "text-gray-400"}/>
            <span className="font-medium">Flag :</span>
            <input type="checkbox" checked={isFlagged}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsFlagged(checked);
                if (checked) {
                  // setAttachmentMode("flag");
                  setTimeout(() => textareaRef.current?.focus(), 100);
                } else {
                  setFlagComment("");
                  // setAttachmentMode("approval");
                  setPopupErrors((prev : any) => ({ ...prev, flagComment: "" }));
                }
              }}
              className="w-4 h-4 mt-[1px] accent-red-600 cursor-pointer"/>
          </div>
            <textarea ref={textareaRef} rows={3} value={flagComment}
              onChange={(e) => {
                const value = e.target.value;
                setFlagComment(value);
                if (value.trim()) {
                  setPopupErrors((prev :any) => ({ ...prev, flagComment: "" }));
                }
              }}
              disabled={!isFlagged}
              placeholder="Flagged reason here"
              className={`w-full px-3 py-2 rounded-[6px]
                ${isFlagged
                  ? "border border-red-300 bg-red-50"
                  : "border border-gray-200 bg-gray-100 cursor-not-allowed"}`}/>
            {popupErrors.flagComment && (
              <p className="text-red-600 text-xs mt-1">
                {popupErrors.flagComment}
              </p>
            )}
            {isFlagged && (
          <>
          <div className="mt-4">
              <Label.Root className="block text-sm font-medium">
                Flag Documents 
                <span className="text-red-500">(Maximum 5 files allowed & File must be below 2 MB)</span>
              </Label.Root>
              <label
                htmlFor="flagUpload"
                className="inline-block bg-gray-100 text-gray-700 border border-gray-300 px-6 py-2 rounded cursor-pointer mt-2 hover:bg-gray-200">
                Choose File
              </label>
              <input
                id="flagUpload"
                ref={flagFileRef}
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, "flag")}
                className="hidden" />
              {flagFileError && <p className="text-red-500 text-sm mt-1">{flagFileError}</p>}
            </div>         
           <div className="mt-3 flex flex-wrap gap-2">
              {flagDocuments.map((doc: any, index: number) => (
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
                    onClick={() => removeFile(doc, index, "flag")}
                    className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">
                    ×
                  </button>
                </div>
              ))}
            </div>
            </>
          )}        
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={closeApproveDrawer} 
              className="h-[42px] px-6 border border-gray-300 rounded-[6px] text-gray-700">
              Cancel
            </button>
            <button onClick={submitManagerApproval}
              className="h-[44px] px-8 rounded-md shadow btn-theme">
               {isEditMode ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>
  );
};

export default ManagerApprovalDrawer;