import React from "react";
import Puthiyathalaimurai from "../assets/images/Puthiyathalaimurai.png";
import SRMAP from "../assets/images/srmap.jpg";
import PresidentOffice from "../assets/images/Universitylogo.png";
import SRMGH from "../assets/images/Universitylogo.png";
import SRMDentalHospital from "../assets/images/dental-logo.png";
import Federal from "../assets/images/Federal-logo.png";
import SRMSikkim from "../assets/images/srmus-logo-full-length.png";
import SRMIST from "../assets/images/SRMIST-Vadapalani.png";
import SRMTech from "../assets/images/srmtechlogo.png";
import layoutLogo from "../assets/images/layout_logo.png";

const colorMap: Record<string, string> = {
  "SRM Group": " text-[#3499b8] border-[#3499b8]",
  "SRM Global Hospital": " text-[#6b4a98] border-[#6b4a98]",
  "Puthiya Thalaimurai": " text-[#520e11] border-[#520e11]",
  "SRM AP": "text-[#4d4e42] border-[#4d4e42]",
  "President Office": " text-[#133b5c] border-[#133b5c]",
  "SRM GH": "text-[#147fc3] border-[#147fc3]",
  "SRM Dental Hospital": " text-[#0c4da2] border-[#0c4da2]",
  "The Federal": "text-[#520f0f] border-[#520f0f]",
  "SRM Sikkim": " text-[#ffc107] border-[#ffc107]",
  "SRMIST": " text-[#6b8cc7] border-[#6b8cc7]",
  "SRM Tech": "text-[#e68a15] border-[#e68a15]",
};

const logoMap: Record<string, string> = {
  "SRM Group": layoutLogo,
  "SRM Global Hospital": SRMGH,
  "Puthiya Thalaimurai": Puthiyathalaimurai,
  "SRM AP": SRMAP,
  "President Office": PresidentOffice,
  "SRM GH": SRMGH,
  "SRM Dental Hospital": SRMDentalHospital,
  "The Federal": Federal,
  "SRM Sikkim": SRMSikkim,
  "SRMIST": SRMIST,
  "SRM Tech": SRMTech,
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
     className={`inline-flex items-center gap-3 px-2 py-1 text-sm font-semibold
        ${colorMap[label] || "bg-gray-100 text-gray-700 border-gray-300"}`}
    >
      <img
        src={logoMap[label] || layoutLogo}
        alt={label}
        className="w-12 h-12 object-contain rounded bg-white p-[2px]"
      />
      {label}
    </span>
  );
};

const TenantBadges = () => {
  return (
    <div className="flex flex-wrap gap-3">
      {tenantNames.map((name) => (
        <ColorBadge key={name} label={name} />
      ))}
    </div>
  );
};

export default TenantBadges;