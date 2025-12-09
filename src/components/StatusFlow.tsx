import React from "react";
import { ArrowRight } from "lucide-react";

type Step = {
  type: string;
  status: string;
};

// type StatusFlowProps = {
//   steps: Step[];
// };

const statusFlowColors: Record<string, string> = {
  Approved: "bg-green-100 text-green-800 border-green-300",
  Rejected: "bg-red-100 text-red-800 border-red-300",
  "Under Review": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Not Started": "bg-gray-100 text-gray-700 border-gray-300",
};
interface StatusFlowProps {
  steps: { type: string; status: string }[];
}

const StatusFlow: React.FC<StatusFlowProps> = ({ steps }) => {
  return (
    <div>
      <div className="text-sm font-medium text-gray-900">Nomination Status Flow</div>
      <div className="flex items-start space-x-6 mt-2">
        {steps.map((step, i) => {
          const colorClass =
            statusFlowColors[step.status] ||
            "bg-gray-100 text-gray-700 border-gray-300";
          return (
            <div key={i} className="flex flex-col items-center w-28 relative">
              <span className="text-xs font-semibold text-gray-700 mb-1">
                {step.type}
              </span>
              <span
                className={`px-4 py-2 border rounded-full text-xs font-medium text-center w-full ${colorClass} relative`}
              >
                {step.status}

                {i !== steps.length - 1 && (
                  <ArrowRight
                    className="w-4 h-4 text-gray-500 absolute top-1/2 -translate-y-1/2 right-[-20px]"
                  />
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatusFlow1: React.FC<StatusFlowProps> = ({ steps }) => {
  return (
    
    <div className="flex items-start space-x-6 mt-2">
      {steps.map((step, i) => {
        const colorClass =
          statusFlowColors[step.status] ||
          "bg-gray-100 text-gray-700 border-gray-300";

        return (
          <div key={i} className="flex flex-col items-center w-28 relative">
            <span className="text-xs font-semibold text-gray-700 mb-1">
              {step.type}
            </span>

            <span
              className={`px-4 py-2 border rounded-full text-xs font-medium text-center w-full ${colorClass} relative`}
            >
              {step.status}

              {i !== steps.length - 1 && (
                <ArrowRight
                  className="lucide lucide-arrow-right w-4 h-4 text-gray-500 absolute top-1/2 -translate-y-1/2 right-[-20px]"
                />
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default StatusFlow;
