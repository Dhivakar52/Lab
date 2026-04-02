import { X, CheckCircle, XCircle, Hourglass } from "lucide-react";
import {  useState } from "react";

interface ProgressSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
   data: any;
}

const getStageIcon = (status: string) => {
  if (status === "Approved")
    return <CheckCircle className="w-5 h-5 text-green-600" />;

  if (status === "Rejected")
    return <XCircle className="w-5 h-5 text-red-600" />;

  if (status === "Under Review")
    return (
      <div className="w-6 h-6 rounded-full bg-yellow-200 flex items-center justify-center">
        <Hourglass className="w-4 h-4 text-yellow-600" />
      </div>
    );

  return (
    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
      <Hourglass className="w-4 h-4 text-gray-600" />
    </div>
  );
};


const getStatusBadgeStyle = (status: string) => {
  if (status === "Approved")
    return "bg-green-100 text-green-700";

  if (status === "Rejected")
    return "bg-red-100 text-red-700";

  if (status === "Under Review" || status === "Pending")
    return "bg-yellow-100 text-yellow-700";

  if (status === "Not Started")
    return "bg-gray-100 text-gray-600";

  return "bg-gray-100 text-gray-600";
};
const ProgressSidePanel: React.FC<ProgressSidePanelProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen || !data) return null;
const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
const MAX_COMMENT_LENGTH = 80;

const toggleComment = (index: number) => {
  setExpandedComments(prev => ({
    ...prev,
    [index]: !prev[index]
  }));
};
const getCleanStatus = (status?: string) => {
  if (!status) return "";
  const dashIndex = status.indexOf("-");
  return dashIndex >= 0
    ? status.substring(dashIndex + 1).trim()
    : status.trim();
};
const mainStatus = getCleanStatus(data.Status);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[420px] bg-white h-full shadow-2xl flex flex-col">        
        <div className="px-6 py-4 border-b border-gray-300 flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">Progress Details</h3>
            <p className="text-sm text-gray-500">
              Nomination - {data.NominationID}
            </p>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-800" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="bg-blue-50 rounded-lg p-4 mb-6 flex justify-between">
            <div>
              <p className="font-semibold">{data.Nominee}</p>
              <p className="text-sm text-gray-600">{data.Tenant}</p>
              <p className="text-sm text-gray-600">{data.AwardCategory}</p>
            </div>
            <span
              className={`h-fit px-3 py-1 text-xs font-semibold rounded-full
              ${getStatusBadgeStyle(mainStatus)}`}>
              {data.Status}
            </span>
            {/* <span className={`h-fit px-3 py-1 text-xs font-semibold rounded-full
              ${getStatusBadgeStyle(data.Status)}`}>
              {data.Status}
            </span> */}
          </div>
          <div className="space-y-6">
            {data.ApprovalStatus?.map((stage: any, index: number) => (
              <div key={index} className="flex gap-4">
                <div className="relative flex flex-col items-center">
                  {index !== data.ApprovalStatus.length - 1 && (
                    <div className="absolute top-6 bottom-[-24px] w-px bg-gray-300" />
                  )}
                  {getStageIcon(stage.Status)}
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {stage.ApprovalFlow} — {stage.StageTitle}
                  </p>
                  {/* <p className={`text-xs font-medium ${getStatusTextStyle(stage.Status)}`}>
                    {stage.Status}
                  </p> */}
                  <p className="text-sm text-gray-700 font-medium">
                    {stage.Status}
                  </p>
                  <p className="text-sm text-gray-500">
                    Reviewer : {stage.ApprovalType}
                  </p>
                  {stage.ApprovalComments?.trim() && (
                    <div className="text-sm text-gray-600">
                      {expandedComments[index]
                        ? stage.ApprovalComments
                        : stage.ApprovalComments.slice(0, MAX_COMMENT_LENGTH)}
                      {stage.ApprovalComments.length > MAX_COMMENT_LENGTH && (
                        <button
                          onClick={() => toggleComment(index)}
                          className="ml-1 text-blue-600 hover:text-blue-800 underline text-sm">
                          {expandedComments[index] ? "See less" : "See more"}
                        </button>
                      )}
                    </div>
                  )}
                  {stage.ApprovalScore > 0 && (
                    <p className="text-xs text-blue-600 font-medium">
                      Score : {stage.ApprovalScore}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-gray-300 px-6 py-4 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


export default ProgressSidePanel;
