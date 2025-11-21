import React from "react";

interface NominationStatsProps {
  nominationOthers?: number;
  selfNomination?: number;
  pending?: number;
  approved?: number;
  rejected?: number;
}

const NominationStats: React.FC<NominationStatsProps> = ({
  nominationOthers = 0,
  selfNomination = 0,
  pending = 0,
  approved = 0,
  rejected = 0,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h4 className="text-base font-semibold text-gray-900 mb-3">Nomination Stats</h4>

      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Nomination Others</span>
          <span className="font-semibold text-indigo-600">{nominationOthers}</span>
        </div>

        <div className="flex justify-between">
          <span>Self Nomination</span>
          <span className="font-semibold text-indigo-600">{selfNomination}</span>
        </div>

        <div className="flex justify-between">
          <span>Pending Status</span>
          <span className="font-semibold text-indigo-600">{pending}</span>
        </div>

        <div className="flex justify-between">
          <span>Approved</span>
          <span className="font-semibold text-green-600">{approved}</span>
        </div>

        <div className="flex justify-between">
          <span>Rejected</span>
          <span className="font-semibold text-red-600">{rejected}</span>
        </div>
      </div>
    </div>
  );
};

export default NominationStats;
