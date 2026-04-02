//import React from "react";

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
  "SRM Group": "bg-[#e0f4f8] text-[#3499b8] border-[#3499b8]",
  "SRM Global Hospital": "bg-[#ede6f5] text-[#6b4a98] border-[#6b4a98]",
  "Puthiya Thalaimurai": "bg-[#f3e6e7] text-[#520e11] border-[#520e11]",
  "SRM AP": "bg-[#f7f8f2] text-[#4d4e42] border-[#4d4e42]",
  "President Office": "bg-[#e3ebf2] text-[#133b5c] border-[#133b5c]",
  "SRM GH": "bg-[#e0f2fb] text-[#147fc3] border-[#147fc3]",
  "SRM Dental Hospital": "bg-[#e0e9f7] text-[#0c4da2] border-[#0c4da2]",
  "The Federal": "bg-[#d7b763] text-[#520f0f] border-[#520f0f]",
  "SRM Sikkim": "bg-[#fff2cc] text-[#ffc107] border-[#ffc107]",
  "SRMIST": "bg-[#eef6ff] text-[#6b8cc7] border-[#6b8cc7]",
  "SRM Tech": "bg-[#fff1d9] text-[#e68a15] border-[#e68a15]",
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
      className={`px-3 py-1 rounded-md text-xs font-semibold border 
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
