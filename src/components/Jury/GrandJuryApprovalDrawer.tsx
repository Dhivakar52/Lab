import { X, Flag } from "lucide-react";
import * as Label from "@radix-ui/react-label";
import { useRef } from "react";

interface Props {
  openGrandJuryEvaluation: boolean;
  closeGrandJuryDrawer: () => void;
  grandStatus: "Approved" | "Rejected";
  setGrandStatus: any;
  popupCommentsGrand: string;
  setPopupCommentsGrand:any;
  grandScore: string;
  setGrandScore: any;
  popupErrors: any;
  setPopupErrors: any;
  submitGrandJuryApproval: () => void;
  isEditMode: boolean;
  isGrandFlagged: boolean;
  setIsGrandFlagged:any;
  grandFlagComment: string;
  setGrandFlagComment: any;
  approvalGrandDocuments: any[];
  flagGrandDocuments: any[];
  handleFileUpload: any;
  removeFile: any;
  handleFilePreview: any;
  grandApprovalFileError?: string;
  grandFlagFileError?: string;
}

const GrandJuryApprovalDrawer = (props: Props) => {
  const {
    openGrandJuryEvaluation,
    closeGrandJuryDrawer,
    grandStatus,
    setGrandStatus,
    popupCommentsGrand,
    setPopupCommentsGrand,
    grandScore,
    setGrandScore,
    popupErrors,
    setPopupErrors,
    submitGrandJuryApproval,
    isEditMode,
    isGrandFlagged,
    setIsGrandFlagged,
    grandFlagComment,
    setGrandFlagComment,
    approvalGrandDocuments,
    flagGrandDocuments,
    handleFileUpload,
    removeFile,
    handleFilePreview,
    grandApprovalFileError,
    grandFlagFileError
  } = props;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const grandApprovalFileRef = useRef<HTMLInputElement>(null);
  const grandFlagFileRef = useRef<HTMLInputElement>(null);

  return (
     <div className={`fixed top-0 right-0 h-full w-[680px] bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${openGrandJuryEvaluation ? "translate-x-0" : "translate-x-full"}
        `}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-[16px] font-semibold text-gray-900">
            Level 3 - Grand Jury
          </h2>
          <button onClick={closeGrandJuryDrawer}>
            <X size={20} />
          </button>
        </div>
        {/* <div className="px-6 py-6 text-sm text-gray-800"> */}
        <div className="px-6 py-6 text-sm text-gray-800 overflow-y-auto h-[calc(100%-70px)]">
          <div className="mb-[18px] flex gap-4 items-end">
            {/* Status - Left Side */}
            <div className="flex-1">
              <label className="block mb-2 font-medium">
                Status
              </label>
              <select 
                value={grandStatus}
                onChange={(e) => setGrandStatus(e.target.value as "Approved" | "Rejected")}
                className="w-full h-[42px] px-3 border border-gray-300 rounded-[6px]">
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Score - Right Side */}
            <div className="w-[120px]">
              <span className="text-gray-500 text-sm">Score</span>
              <input
                type="number"
                min={1}
                max={100}
                value={grandScore}
                onChange={(e) => {
                  const val = e.target.value;
                  setGrandScore(val);
                  if(val.trim()){
                    setPopupErrors((prev:any)=>({
                      ...prev,
                      score:""
                    }));
                  }
                }}
                className="w-full h-[42px] px-3 border border-gray-300 rounded-[6px] text-center"
              />
            </div>
          </div>
          
          <div className="mb-[18px]">
            <label className="block mb-2 font-medium">
              Comments <span className="text-red-500"> *</span>
            </label>
            <textarea rows={3} value={popupCommentsGrand}
              onChange={(e) => {
                const value = e.target.value;
                setPopupCommentsGrand(value); 
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
                htmlFor="grandUpload"
                className="inline-block bg-gray-100 text-gray-700 border border-gray-300 px-6 py-2 rounded cursor-pointer mt-2 hover:bg-gray-200">
                Choose File
              </label>
              <input
                id="grandUpload"
                ref={grandApprovalFileRef}
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, "grandApproval")}
                className="hidden" />
              {grandApprovalFileError  && <p className="text-red-500 text-sm mt-1">{grandApprovalFileError }</p>}
            </div>         
           <div className="mt-3 flex flex-wrap gap-2">
              {approvalGrandDocuments.map((doc: any, index: number) => (
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
                    onClick={() => removeFile(doc, index, "grandApproval")}
                    className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">
                    ×
                  </button>
                </div>
              ))}
            </div>
           </div> 
          <div className="flex items-center gap-2 mb-[18px]">
            <Flag size={18} className={isGrandFlagged ? "text-red-600" : "text-gray-400"}/>
            <span className="font-medium">Flag :</span>
            <input type="checkbox" checked={isGrandFlagged}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsGrandFlagged(checked);
                if (checked) {
                  // setAttachmentMode("grandFlag");
                  setTimeout(() => textareaRef.current?.focus(), 100);
                } else {
                  setGrandFlagComment("");
                  // setAttachmentMode("grandApproval");
                  setPopupErrors((prev:any) => ({ ...prev, grandFlagComment: "" }));
                }
              }}
              className="w-4 h-4 mt-[1px] accent-red-600 cursor-pointer"/>
          </div>
            <textarea ref={textareaRef} rows={3} value={grandFlagComment}
              onChange={(e) => {
                const value = e.target.value;
                setGrandFlagComment(value);
                if (value.trim()) {
                  setPopupErrors((prev:any) => ({ ...prev, flagComment: "" }));
                }
              }}
              disabled={!isGrandFlagged}
              placeholder="Flagged reason here"
              className={`w-full px-3 py-2 rounded-[6px]
                ${isGrandFlagged
                  ? "border border-red-300 bg-red-50"
                  : "border border-gray-200 bg-gray-100 cursor-not-allowed"}`}/>
            {popupErrors.grandFlagComment  && (
              <p className="text-red-600 text-xs mt-1">
                {popupErrors.grandFlagComment }
              </p>
            )}
            {isGrandFlagged && (
          <>
          <div className="mt-4">
              <Label.Root className="block text-sm font-medium">
                Flag Documents 
                <span className="text-red-500">(Maximum 5 files allowed & File must be below 2 MB)</span>
              </Label.Root>
              <label
                htmlFor="grandflagUpload"
                className="inline-block bg-gray-100 text-gray-700 border border-gray-300 px-6 py-2 rounded cursor-pointer mt-2 hover:bg-gray-200">
                Choose File
              </label>
              <input
                id="grandflagUpload"
                ref={grandFlagFileRef}
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, "grandFlag")}
                className="hidden" />
              {grandFlagFileError && <p className="text-red-500 text-sm mt-1">{grandFlagFileError}</p>}
            </div>         
           <div className="mt-3 flex flex-wrap gap-2">
              {flagGrandDocuments.map((doc: any, index: number) => (
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
                    onClick={() => removeFile(doc, index, "grandFlag")}
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
              onClick={closeGrandJuryDrawer} 
              className="h-[42px] px-6 border border-gray-300 rounded-[6px] text-gray-700">
              Cancel
            </button>
            <button onClick={submitGrandJuryApproval}
              className="h-[44px] px-8 rounded-md shadow btn-theme">
               {isEditMode ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>
  );
};

export default GrandJuryApprovalDrawer;