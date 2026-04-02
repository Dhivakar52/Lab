import React from "react";
import { ArrowRight } from "lucide-react";
import { Clock } from "lucide-react";

type Step = {
  type: string;
  status: string;
  level: string;
  approvedAt: string;
};

interface CommonStatusFlowProps {
  steps: Step[];
}

const getPrimaryLevel1Item = (items: Step[]) => {
  const manager = items.find(i => i.type === "Manager");
  if (manager) return manager;

  const referral = items.find(i => i.type === "Referral");
  return referral || null;
};

const groupByLevel = (steps: Step[]) => {
  const map: Record<string, Step[]> = {};
  steps.forEach(s => {
    if (!map[s.level]) map[s.level] = [];
    map[s.level].push(s);
  });
  return map;
};
const statusIcon = (status: string) => {
  switch (status) {
    case "Approved":
      return <span className=" text-sm">✔</span>;
    case "Rejected":
      return <span className="text-sm">✖</span>;
    case "Pending":
    case "Under Review":
      return <span className="text-sm">⏳</span>;
    case "Not Started":
      return (
        <Clock
          size={16}
          className="text-gray-400"
          strokeWidth={2}/>
      );

    default:
      return null;
  }
};

const getOverallStatus = (items: Step[]) => {
  if (items.some(i => i.status === "Approved")) return "Approved";
  if (items.some(i => i.status === "Rejected")) return "Rejected";
  if (items.some(i => i.status === "Under Review")) return "Under Review";
  if (items.some(i => i.status === "Nomination Created"))
    return "Nomination Created";
  return "Not Started";
};

const CommonStatusFlow: React.FC<CommonStatusFlowProps> = ({ steps }) => {
  const grouped = groupByLevel(steps);
  const levels = Object.keys(grouped).sort();

  return (
    <div className="w-full">
     <div className="flex items-stretch gap-1 flex-nowrap min-w-max">
      <div className="flex items-center justify-start">
         <span className="text-sm font-semibold text-gray-600">
            Status Flow :
        </span>
        </div>
          {levels.map((level, i) => {
            const items = grouped[level];
            const overall = getOverallStatus(items);
            return (
              <div key={level} className="flex items-center">
                <div className={`flex-1 min-w-[240px] border rounded-xl px-2 py-1 ${levelColors[overall]}`}>
                  <div className="space-y-0.5">
                    {(level === "Level-1"
                        ? (() => {
                            const s = getPrimaryLevel1Item(items);
                            if (!s) return null;

                            return (
                            <div className="flex items-center justify-center gap-2 text-xs px-2 py-1">
                                <span className={`font-medium ${levelTextColors[overall]}`}>
                                Referral / Manager – {s.status}
                                </span>
                                <span className={levelTextColors[overall]}>
                                    {statusIcon(s.status)}
                                </span>
                            </div>
                            );
                        })()
                        : items.map((s, idx) => (
                            <div
                            key={idx}
                            className="flex items-center justify-center gap-2 text-xs px-2 py-1">
                           <span className={`font-medium ${levelTextColors[overall]}`}>
                                {s.type} – {s.status}
                            </span>
                           <span className={levelTextColors[overall]}>
                                {statusIcon(s.status)}
                           </span>
                            </div>
                        )))}
                    </div>
                </div>
                {i !== levels.length - 1 && (
                  <ArrowRight className="text-gray-400 w-5 h-5 mx-2 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
    </div>
  );
};

export default CommonStatusFlow;
