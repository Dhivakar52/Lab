import React from "react";
import { ArrowRight } from "lucide-react";

type Step = {
  type: string;    
  status: string;  
  level: string;   
};

interface StatusFlowProps {
  steps: Step[];
}

const levelColors: Record<string, string> = {
  Approved: "bg-green-50 border-green-300",
  Pending: "bg-yellow-50 border-yellow-300",
  Rejected: "bg-red-50 border-red-300",
  "Under Review": "bg-yellow-50 border-yellow-300",
  "Not Started": "bg-gray-50 border-gray-300",
};
const levelTextColors: Record<string, string> = {
  Approved: "text-green-700",
  Pending: "text-yellow-700",
  Rejected: "text-red-700",
  "Under Review": "text-yellow-700",
  "Not Started": "text-gray-700",
};
const groupByLevel = (steps: Step[]) => {
  const map: Record<string, Step[]> = {};
  steps.forEach(s => {
    if (!map[s.level]) map[s.level] = [];
    map[s.level].push(s);
  });
  return map;
};

const getOverallStatus = (items: Step[]) => {
  if (items.some(i => i.status === "Approved")) return "Approved";
  if (items.some(i => i.status === "Rejected")) return "Rejected";
  if (items.some(i => i.status === "Under Review")) return "Under Review";
  return "Not Started";
};

const StatusFlow: React.FC<StatusFlowProps> = ({ steps }) => {
  const grouped = groupByLevel(steps);
  const levels = Object.keys(grouped).sort();

  return (
    <div>
      <div className="text-sm font-medium text-gray-900">Nomination Status Flow</div>
      <div className="flex items-center">
        {levels.map((level, i) => {
          const items = grouped[level];
          const overall = getOverallStatus(items);
          const boxColor = levelColors[overall];
          return (
            <div key={level} className="flex items-center">
             <div className="flex flex-col justify-center">
              <div className={`w-55 border rounded-xl p-3 ${boxColor}`}>
                <div className={`text-sm font-semibold text-center mb-1 ${levelTextColors[overall]}`}>
                {/* <div className="text-sm font-semibold text-center mb-1"> */}
                  {level}
                </div>

                {level === "Level-1" && (
                  <div className="text-xs text-center text-gray-600 mb-2">
                    Manager / Referral <br />
                    <div className="space-y-1">
                  {items.map((s, idx) => (
                    <div
                      key={idx}
                      className="bg-white border rounded text-xs px-2 py-1 text-center">
                      {s.type} – {s.status}
                      {s.status === "Approved" && " ✅"}
                      {s.status === "Not Started" && " ⏳"}
                      {s.status === "Rejected" && " ❌"}
                    </div>
                  ))}
                   <span className="italic">
                      Any one approval is sufficient
                    </span>
                </div>
                  </div>
                )}
               {level != "Level-1" && (
                <div className="space-y-1">
                  {items.map((s, idx) => (
                    <div
                      key={idx}
                      className="text-xs px-2 py-1 text-center">
                      {s.type} – {s.status}
                      {s.status === "Approved" && " ✅"}
                      {s.status === "Not Started" && " ⏳"}
                      {s.status === "Rejected" && " ❌"}
                    </div>
                  ))}
                </div>
                )}
              </div>
            </div>
              {i !== levels.length - 1 && (
                <ArrowRight className="text-gray-400 w-5 h-5 mx-2" />
                // <ArrowRight className="mx-4 mt-8 text-gray-400 w-4 h-4" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusFlow;
