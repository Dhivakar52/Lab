import React from "react";
import { ArrowRight } from "lucide-react";
import { levelColors, levelTextColors } from "../statusColors.ts";

type Step = {
  type: string;
  status: string;
  level: string;
  approvedAt: string;
};

interface StatusFlowProps {
  steps: Step[];
}

const formatApprovedDate = (dateStr?: string) => {
  if (!dateStr || dateStr.trim() === "") return null;
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;

  const [dd, mm, yyyy] = parts;
  const date = new Date(`${yyyy}-${mm}-${dd}`);
  return isNaN(date.getTime()) ? null : date.toLocaleDateString("en-GB");
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
  if (items.some(i => i.status === "Nomination Created"))
    return "Nomination Created";
  return "Not Started";
};

const StatusFlow: React.FC<StatusFlowProps> = ({ steps }) => {
  const grouped = groupByLevel(steps);
  const levels = Object.keys(grouped).sort();

  return (
    <div className="w-full">
      <div className="text-sm font-medium text-gray-900 mb-2">
        Nomination Status Flow
      </div>

      <div className="w-full">
        <div className="flex items-stretch gap-1 flex-nowrap min-w-max">
          {levels.map((level, i) => {
            const items = grouped[level];
            const overall = getOverallStatus(items);

            return (
              <div key={level} className="flex items-center">
                <div
                  className={`flex-1 min-w-[260px] border rounded-xl p-3 ${levelColors[overall]}`}>
                  <div
                    className={`text-sm font-semibold text-center mb-1 ${levelTextColors[overall]}`}>
                    {level}
                  </div>
                  {level === "Level-1" && (
                    <div className="text-xs text-center text-gray-600 mb-2">
                      Manager / Referral
                      <div className="space-y-1 mt-1">
                        {items.map((s, idx) => (
                          <div
                            key={idx}
                            className="bg-white border rounded px-2 py-1 text-xs text-center">
                            {s.type} – {s.status}
                            {(s.status === "Approved" ||
                              s.status === "Rejected") &&
                              formatApprovedDate(s.approvedAt) && (
                                <span className="ml-1 text-xs text-gray-600">
                                  on {formatApprovedDate(s.approvedAt)}
                                </span>
                              )}
                          </div>
                        ))}
                        <div className="text-xs  mt-1">
                          Any one approval is sufficient
                        </div>
                      </div>
                    </div>
                  )}

                  {level !== "Level-1" && (
                    <div className="space-y-1">
                      {items.map((s, idx) => (
                        <div
                          key={idx}
                          className="text-xs px-2 py-1 text-center">
                          {s.type} – {s.status}
                          {(s.status === "Approved" ||
                            s.status === "Rejected") &&
                            formatApprovedDate(s.approvedAt) && (
                              <span className="ml-1 text-xs text-gray-600">
                                on {formatApprovedDate(s.approvedAt)}
                              </span>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {i !== levels.length - 1 && (
                  <ArrowRight className="text-gray-400 w-5 h-5 mx-2 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatusFlow;
