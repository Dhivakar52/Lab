import { X, Flag } from "lucide-react";
import * as Label from "@radix-ui/react-label";
import { useRef } from "react";

interface Props {
  openScore: boolean;
  handleCloseDrawer: () => void;
  juryStatus: "Approved" | "Rejected";
  setJuryStatus: any;
  popupCommentsJury: string;
  setPopupCommentsJury: any;
  popupErrors: any;
  setPopupErrors: any;
  scores: any[];
  setScores: any;
  submitJuryApproval: () => void;
  isEditMode: boolean;
  isJuryFlagged: boolean;
  setIsJuryFlagged: any;
  juryFlagComment: string;
  setJuryFlagComment: any;
  approvalJuryDocuments: any[];
  flagJuryDocuments: any[];
  handleFileUpload: any;
  removeFile: any;
  handleFilePreview: any;
  juryApprovalFileError?: string;
  juryFlagFileError?: string;
  primaryfield?: string | null;
}
const JuryApprovalDrawer = (props: Props) => {
  const {
  openScore,
  handleCloseDrawer,
  juryStatus,
  setJuryStatus,
  popupCommentsJury,
  setPopupCommentsJury,
  popupErrors,
  setPopupErrors,
  scores,
  setScores,
  submitJuryApproval,
  isEditMode,
  isJuryFlagged,
  setIsJuryFlagged,
  juryFlagComment,
  setJuryFlagComment,
  approvalJuryDocuments,
  flagJuryDocuments,
  handleFileUpload,
  removeFile,
  handleFilePreview,
  juryApprovalFileError,
  juryFlagFileError,
  primaryfield
} = props;

const textareaRef = useRef<HTMLTextAreaElement>(null);
const juryApprovalFileRef = useRef<HTMLInputElement>(null);
const juryFlagFileRef = useRef<HTMLInputElement>(null);
  return (
       <div className={`fixed top-0 right-0 h-screen w-[650px] bg-white z-50 shadow-xl
           transform transition-transform duration-500 ease-in-out
           ${openScore ? "translate-x-0" : "translate-x-full"}
           flex flex-col`}>
         <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
           <h2 className="text-lg font-semibold">
             Level 2 - Business Jury
           </h2>
           <X
             className="cursor-pointer text-gray-600"
             onClick={handleCloseDrawer}/>
         </div>
         {/* <div className="px-6 py-6 space-y-6 text-sm"> */}
         <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-sm">
           {primaryfield=="IsPrimary" &&
           <div>
           <div className="mb-[18px] flex gap-4 items-end">
             <div className="flex-1">
               <label className="block mb-2 font-medium">
                 Status
               </label>
               <select 
                 value={juryStatus}
                 onChange={(e) => setJuryStatus(e.target.value as "Approved" | "Rejected")}
                 className="w-full h-[42px] px-3 border border-gray-300 rounded-[6px]">
                 <option value="Approved">Approved</option>
                 <option value="Rejected">Rejected</option>
               </select>
             </div>
   
           </div>
           <div className="mb-[18px]">
             <label className="block mb-2 font-medium">
               Comments <span className="text-red-500"> *</span>
             </label>
             <textarea rows={3} value={popupCommentsJury}
               onChange={(e) => {
                 const value = e.target.value;
                 setPopupCommentsJury(value);
                 if (value.trim()) {
                   setPopupErrors ((prev:any) => ({
                     ...prev,
                     comments: ""
                   }));
                 }
               }}
               placeholder="Enter your comments"
               className={`w-full px-3 py-2 border rounded-[6px]
                 ${popupErrors .comments ? "border-red-500" : "border-gray-300"}`}/>
             {popupErrors .comments && (
               <p className="text-red-600 text-xs mt-1">{popupErrors .comments}</p>
             )}
           </div>
            <div className="mt-4">
                 <Label.Root className="block text-sm font-medium">
                   Supporting Documents 
                   <span className="text-red-500">(Maximum 5 files allowed & File must be below 2 MB)</span>
                 </Label.Root>
                 <label
                   htmlFor="juryUpload"
                   className="inline-block bg-gray-100 text-gray-700 border border-gray-300 px-6 py-2 rounded cursor-pointer mt-2 hover:bg-gray-200">
                   Choose File
                 </label>
                 <input
                   id="juryUpload"
                   ref={juryApprovalFileRef}
                   type="file"
                   multiple
                   onChange={(e) => handleFileUpload(e, "juryApproval")}
                   className="hidden" />
                 {juryApprovalFileError && <p className="text-red-500 text-sm mt-1">{juryApprovalFileError}</p>}
            </div>  
   
             <div className="mt-3 flex flex-wrap gap-2">
                 {approvalJuryDocuments.map((doc: any, index: number) => (
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
                       onClick={() => removeFile(doc, index, "juryApproval")}
                       className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">
                       ×
                     </button>
                   </div>
                 ))}
             </div>  
           </div>
           }
           {scores.map((item, i) => (
             <div key={i}>
               <div className="flex items-center gap-6 mb-2">
                 <div className="flex items-center gap-1 font-medium">
                   {item.title}
                   <span className="text-gray-400 text-xs">ⓘ</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <span className="text-gray-500 text-sm">Score</span><span className="text-red-500"> *</span>
                   <input type="number" min={1} max={100} value={item.score}
                     onChange={(e) => {
                       const val = Number(e.target.value);
                       setScores((prev:any[]) =>
                         prev.map((s, idx) =>
                           idx === i ? { ...s, score: val } : s
                         )
                       );
                     }}
                 className={`w-[90px] h-[36px] px-3 border rounded-md text-sm outline-none
                 ${popupErrors.score[i] ? "border-red-500" : "border-gray-300"}`}/>
                 </div>
                 {popupErrors.score[i] && (
                   <p className="text-red-600 text-xs mt-1">
                     {popupErrors.score[i]}
                   </p>
                 )}
               </div>
                <label className="block text-gray-500 text-sm mb-1">
                     Comments <span className="text-red-500"> *</span>
                </label>
               <textarea rows={3} value={item.comment}
                 onChange={(e) => {
                   const val = e.target.value;
                   setScores((prev:any[]) =>
                     prev.map((s, idx) =>
                       idx === i ? { ...s, comment: val } : s
                     )
                   );
                 }}
                 className={`w-full px-3 py-2 border rounded-md text-sm resize-none outline-none
                   ${popupErrors.comment[i] ? "border-red-500" : "border-gray-300"}`}/>
   
                 {popupErrors.comment[i] && (
                   <p className="text-red-600 text-xs mt-1">
                     {popupErrors.comment[i]}
                   </p>
                 )}        
             </div>
            ))}
   
            <div className="flex items-center gap-2 mb-[18px]">
               <Flag size={18} className={isJuryFlagged ? "text-red-600" : "text-gray-400"}/>
               <span className="font-medium">Flag :</span>
               <input type="checkbox" checked={isJuryFlagged}
                 onChange={(e) => {
                   const checked = e.target.checked;
                   setIsJuryFlagged(checked);
                   if (checked) {
                    //  setAttachmentMode("juryFlag");
                     setTimeout(() => textareaRef.current?.focus(), 100);
                   } else {
                     setJuryFlagComment("");
                    //  setAttachmentMode("juryApproval");
                     setPopupErrors((prev:any) => ({ ...prev, flagComment: "" }));
                   }
                 }}
                 className="w-4 h-4 mt-[1px] accent-red-600 cursor-pointer"/>
             </div>
               <textarea ref={textareaRef} rows={3} value={juryFlagComment}
                 onChange={(e) => {
                   const value = e.target.value;
                   setJuryFlagComment(value);
                   if (value.trim()) {
                     setPopupErrors((prev:any) => ({ ...prev, juryFlagComment: "" }));
                   }
                 }}
                 disabled={!isJuryFlagged}
                 placeholder="Flagged reason here"
                 className={`w-full px-3 py-2 rounded-[6px]
                   ${isJuryFlagged
                     ? "border border-red-300 bg-red-50"
                     : "border border-gray-200 bg-gray-100 cursor-not-allowed"}`}/>
               {popupErrors .comments && (
                 <p className="text-red-600 text-xs mt-1">
                   {popupErrors .comments}
                 </p>
               )}
               {isJuryFlagged && (
             <>
             <div className="mt-4">
                 <Label.Root className="block text-sm font-medium">
                   Flag Documents 
                   <span className="text-red-500">(Maximum 5 files allowed & File must be below 2 MB)</span>
                 </Label.Root>
                 <label
                   htmlFor="juryflagUpload"
                   className="inline-block bg-gray-100 text-gray-700 border border-gray-300 px-6 py-2 rounded cursor-pointer mt-2 hover:bg-gray-200">
                   Choose File
                 </label>
                 <input
                   id="juryflagUpload"
                   ref={juryFlagFileRef}
                   type="file"
                   multiple
                   onChange={(e) => handleFileUpload(e, "juryFlag")}
                   className="hidden" />
                 {juryFlagFileError && <p className="text-red-500 text-sm mt-1">{juryFlagFileError}</p>}
               </div>         
              <div className="mt-3 flex flex-wrap gap-2">
                 {flagJuryDocuments.map((doc: any, index: number) => (
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
                       onClick={() => removeFile(doc, index, "juryFlag")}
                       className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">
                       ×
                     </button>
                   </div>
                 ))}
               </div>
               </>
             )} 
               
           <div className="flex justify-end gap-3 pt-6">
              <button
                 onClick={handleCloseDrawer} 
                 className="h-[42px] px-6 border border-gray-300 rounded-[6px] text-gray-700">
                 Cancel
               </button>
               <button  onClick={submitJuryApproval}
                 className="h-[44px] px-8 rounded-md shadow btn-theme">                
                 {isEditMode ? "Update" : "Save"}
               </button>
           </div>
         </div>
       </div>
  );
};

export default JuryApprovalDrawer;