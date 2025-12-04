import React from "react";

// const colorMap: Record<string, string> = {
//   "SRM Group": "bg-blue-100 text-blue-700 border-blue-300",
//   "SRM Global Hospital": "bg-green-100 text-green-700 border-green-300",
//   "Puthiya Thalaimurai": "bg-red-100 text-red-700 border-red-300",
//   "SRM AP": "bg-purple-100 text-purple-700 border-purple-300",
//   "President Office": "bg-indigo-100 text-indigo-700 border-indigo-300",
//   "SRM GH": "bg-teal-100 text-teal-700 border-teal-300",
//   "SRM Dental Hospital": "bg-pink-100 text-pink-700 border-pink-300",
//   "The Federal": "bg-orange-100 text-orange-700 border-orange-300",
//   "SRM Sikkim": "bg-emerald-100 text-emerald-700 border-emerald-300",
//   "SRMIST": "bg-yellow-100 text-yellow-800 border-yellow-400",
//   "SRM Tech": "bg-cyan-100 text-cyan-700 border-cyan-300",
// };

const colorMap: Record<string, string> = {
  "SRM Group": "bg-[#3499b8] text-white border-[#3499b8]",
  "SRM Global Hospital": "bg-[#6b4a98] text-white border-[#6b4a98]",
  "Puthiya Thalaimurai": "bg-[#520e11] text-white border-[#520e11]",
  "SRM AP": "bg-[#f1f2e5] text-black border-[#d9dbc8]",
  "President Office": "bg-[#133b5c] text-white border-[#133b5c]", 
  "SRM GH": "bg-[#147fc3] text-white border-[#147fc3]",
  "SRM Dental Hospital": "bg-[#0c4da2] text-white border-[#0c4da2]",
  "The Federal": "bg-[#d7b763] text-black border-[#d7b763]",
  "SRM Sikkim": "bg-[#f4be19] text-black border-[#f4be19]",
  "SRMIST": "bg-[#c8e0ff] text-black border-[#c8e0ff]",
  "SRM Tech": "bg-[#e68a15] text-white border-[#e68a15]",
};


const tenantNames = [
  "SRM Group",
  "SRM Global Hospital",
  "Puthiya Thalaimurai",
  "SRM AP",
  "President Office",
  "SRM GH",
  "SRM Dental Hospital",
  "The Federal",
  "SRM Sikkim",
  "SRMIST",
  "SRM Tech",
];

export const ColorBadge = ({ label }: { label: string }) => {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border 
        ${colorMap[label] || "bg-gray-100 text-gray-700 border-gray-300"}`}
    >
      {label}
    </span>
  );
};

const TenantBadges = () => {
  return (
    <div className="flex flex-wrap gap-2">
      {tenantNames.map((name) => (
        <ColorBadge key={name} label={name} />
      ))}
    </div>
  );
};

export default TenantBadges;
