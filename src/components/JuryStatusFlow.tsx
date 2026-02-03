import { Check, X, Clock } from "lucide-react";

type Status = "Approved" | "Rejected" | "Pending";

interface Step {
  level: number;
  title: string;
  status: Status;
  date?: string;
  comments?: string;
  totalScore?: string;
  flag?: string;
  showViewEvaluation?: boolean;
  showScore?: boolean;
}

export default function StatusFlow({ steps }: { steps: Step[] }) {
  return (
    <div>

      <h2 className="text-base font-semibold mb-6">
        Nomination Status Flow
      </h2>

      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        // ================= ICON =================
        const statusIcon =
          step.status === "Approved" ? (
            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
              <Check size={16} className="text-white" />
            </div>
          ) : step.status === "Rejected" ? (
            <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center">
              <X size={16} className="text-white" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full border-2 border-gray-400 bg-white flex items-center justify-center">
              <Clock size={14} className="text-gray-500" />
            </div>
          );

        // ================= BUTTON =================
        const actionButton =
          step.status === "Approved" ? (
            <button className="px-6 py-2 rounded-lg bg-green-100 text-green-700 text-sm cursor-default">
              Approved
            </button>
          ) : step.status === "Rejected" ? (
            <button className="px-6 py-2 rounded-lg bg-red-100 text-red-700 text-sm cursor-default">
              Rejected
            </button>
          ) : (
            <button className="px-6 py-2 rounded-lg border border-gray-300 text-gray-500 text-sm">
              Approve
            </button>
          );

        return (
          <div key={index} className="flex gap-4">

            {/* LEFT ICON + LINE */}
            <div className="flex flex-col items-center">
              {statusIcon}
              {!isLast && (
                <div className="w-[2px] flex-1 bg-gray-300 mt-1" />
              )}
            </div>

            {/* CONTENT */}
            <div className="flex-1 pb-8">

              {/* HEADER */}
              <div className="flex justify-between items-center mb-3">
                <p className="font-medium text-gray-900">
                  Level {step.level} - {step.title}
                </p>

                <div className="flex gap-3 items-center">

                  {/* LEVEL 2 ONLY */}
                  {step.showViewEvaluation && (
                    <button className="px-4 py-2 rounded-lg border border-blue-500 text-blue-600 text-sm hover:bg-blue-50">
                      View Evaluations
                    </button>
                  )}

                  {step.showScore && (
                    <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm">
                      Score
                    </button>
                  )}

                  {actionButton}
                </div>
              </div>

              {/* COMMENTS */}
              {(step.date || step.comments) && (
                <div className="bg-gray-50 rounded-lg p-4 text-sm mb-3">
                  {step.date && (
                    <div>
                      <span className="text-gray-500">Date:</span>{" "}
                      {step.date}
                    </div>
                  )}
                  {step.comments && (
                    <>
                      <div className="text-gray-500 mt-2">Comments:</div>
                      <div className="text-gray-900">
                        {step.comments}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* SCORE + FLAG */}
              {(step.totalScore || step.flag) && (
                <div className="bg-gray-50 rounded-lg p-4 flex gap-10 text-sm">
                  {step.totalScore && (
                    <div>
                      <span className="text-gray-500">Total Score :</span>{" "}
                      <span className="font-medium">
                        {step.totalScore}
                      </span>
                    </div>
                  )}

                  {step.flag && (
                    <div>
                      🚩 <span className="font-medium">Flag:</span>{" "}
                      {step.flag}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        );
      })}
    </div>
  );
}
