import { useState } from "react";
import { X, User, Flag } from "lucide-react";

import axios from "axios";
import { useAuth } from "../ContextAPI/AuthContext";
const apiUrl = import.meta.env.VITE_API_URL;
 

interface Props {
  openEvaluation: boolean;
  setOpenEvaluation: (val: boolean) => void;
  juryList?: any[];
  attributeData?: any;
  avgScore?: number;
  level?: any[];
}

const BusinessJuryEvaluation = ({
  openEvaluation,
  setOpenEvaluation,
  juryList = [],
  attributeData,
  avgScore = 0,
  level=[]
}: Props) => {

  const [openCard, setOpenCard] = useState<number | null>(null);
  
    const [openDocPopup, setOpenDocPopup] = useState(false);
    const [selectedDocs, setSelectedDocs] = useState<any[]>([]);
    
      const { authToken } = useAuth();
   
    const safeParse = (value: any) => {
    try {
      if (!value || value === " " || value === "") return [];
      return JSON.parse(value);
    } catch {
      return [];
    }
    };
    const handleFilePreview = async (doc: any) => {
      const fileName = doc.originalFileName || doc.name;
      const ext = fileName.split(".").pop()?.toLowerCase() || "";
    
      try {
        if (doc.source === "api") {
          const response = await axios.get(
            `${apiUrl}/api/download?fileName=${doc.fileNameGUID}`,
            {
              responseType: "blob",
              headers: { Authorization: `Bearer ${authToken}` },
            }
          );
    
          const blob = response.data;
    
          if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
            const url = URL.createObjectURL(blob);
            window.open(url);
          } 
          else if (ext === "pdf") {
            const pdfUrl = URL.createObjectURL(
              new Blob([blob], { type: "application/pdf" })
            );
            window.open(pdfUrl);
          } 
          else {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
          }
        }
        else {
          const file = doc.file;
          if (!(file instanceof File)) return;
    
          if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
            const url = URL.createObjectURL(file);
            window.open(url);
          } 
          else if (ext === "pdf") {
            const pdfUrl = URL.createObjectURL(
              new Blob([file], { type: "application/pdf" })
            );
            window.open(pdfUrl);
          } 
          else {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(file);
            link.download = file.name;
            link.click();
          }
        }
      } catch {
        alert("File not found");
      }
    };

  return (
    <div
      className={`fixed top-0  right-0 h-full w-[720px] bg-white shadow-2xl z-50 
      transform transition-transform duration-300 
      ${openEvaluation ? "translate-x-0" : "translate-x-full"}`}>
      <div className="relative px-6 py-4 border-b border-gray-300">
        <h2 className="text-[16px] font-semibold text-gray-900">
          Level 2 - All Business Jury Overview
        </h2>
        <button
         onClick={() => {
          setOpenEvaluation(false);
          setOpenCard(null); 
        }}
          className="absolute right-6 top-4">
          <X size={20} />
        </button>
      </div>
      <div className="px-6 py-6  space-y-4 overflow-y-auto h-[calc(100vh-70px)]">
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-gray-300 rounded-lg p-4 text-center bg-green-50 text-green-700">
           <div className="text-sm">Total Evaluations</div>
            <div className="text-xl font-semibold">
              {attributeData?.EvaluatedJuries || 0}
            </div>
          </div>
          <div className="border border-gray-300 rounded-lg p-4 text-center bg-blue-50 text-blue-700">
           <div className="text-sm">Average Score</div>
            <div className="text-xl font-semibold">
             {avgScore || 0}
            </div>
          </div>
          <div className="border border-gray-300 rounded-lg p-4 text-center bg-red-50 text-red-700">
           <div className="text-sm">Flagged</div>
            <div className="text-xl font-semibold">
              {attributeData?.TotalFlagCount || 0}
            </div>
          </div>
        </div>
        {juryList.map((e: any, index: number) => {
            
          const expanded = openCard === index;
           const parsedJuryFlagDocs = safeParse(level);
          return (
            <div
             key={index}
             onClick={() => setOpenCard(prev => (prev === index ? null : index))}
              className="border border-gray-300 rounded-lg cursor-pointer">
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full themeColor flex items-center justify-center text-white">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{e.Juryname}</p>
                    <p className="text-sm text-gray-500">
                      Submitted: {e.SubmittedDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {e.Flag == 1 && (
                    <Flag size={22} className="text-red-600 fill-red-600" />
                  )}

                  <div className="border border-gray-300 bg-green-50 text-green-700 px-4 py-2 rounded-md text-center min-w-[70px]">
                    <div className="text-lg font-semibold">
                      {e.Score}
                    </div>
                    <div className="text-xs">Score</div>
                  </div>
                </div>
              </div>
              {expanded && (
                <div className="px-4 pb-4">
                  <div className="border border-gray-300 rounded-md overflow-hidden mt-2">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left"></th>
                          <th className="px-4 py-2 text-left">Score</th>
                          <th className="px-4 py-2 text-left">Comments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {e.Attributes?.map((s: any, i: number) => (
                          <tr
                            key={i}
                            className="border-t border-gray-300">
                            <td className="px-4 py-2 font-medium">
                              {s.AttributeName}
                            </td>
                            <td className="px-4 py-2">{s.Score}</td>
                            <td className="px-4 py-2 text-gray-600">
                               {s.Comments || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {e.Flag === 1 && (
                    <>
                      <div className="flex items-center gap-2 mt-3 text-sm">
                        <Flag size={16} className="text-red-600" />
                        <span className="font-medium">Flagged :</span>
                        <input
                          type="checkbox"
                          checked
                          readOnly
                          className="w-4 h-4 accent-red-600"/>
                          {parsedJuryFlagDocs?.length > 0 && (
                                <span
                                onClick={(ev) => {
                                    ev.stopPropagation(); 
                                    setSelectedDocs(
                                    parsedJuryFlagDocs.map((f: any) => ({
                                        originalFileName: f.OriginalAttachmentName,
                                        fileNameGUID: f.AttachmentNameGUID,
                                        source: "api"
                                    }))
                                    );
                                    setOpenDocPopup(true);
                                }}
                                className="text-blue-600 cursor-pointer underline ml-2"
                                >
                                Flag Documents ({parsedJuryFlagDocs.length})
                                </span>
                            )}
                      </div>
                      

                      <div className="mt-2 border border-gray-300 bg-red-50 rounded-md px-4 py-3 text-sm text-gray-700">
                        {e.FlagReason || "No reason provided"}
                      </div>

                    </>
                  )}
                 
                </div>
              )}
            </div>
          );
        })}

         {openDocPopup && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white w-[500px] rounded-lg shadow-lg p-5">
          
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Documents</h3>
            <button onClick={() => setOpenDocPopup(false)}>✕</button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-auto">
            {selectedDocs.map((doc: any) => (
              <div
                key={doc.fileNameGUID}
                className="border rounded px-3 py-2 hover:bg-gray-50">
                
                <span
                  onClick={() => handleFilePreview(doc)}
                  className="text-blue-600 cursor-pointer hover:underline">
                  {doc.originalFileName}
                </span>

              </div>
            ))}
          </div>

        </div>
      </div>
    )}
      </div>
    </div>    
  );
};

export default BusinessJuryEvaluation;