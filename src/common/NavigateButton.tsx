import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

type NavigateButtonProps = {
  label: string;
  path: string;
  icon?: ReactNode; // 👈 dynamic icon
  className?: string;
};

export default function NavigateButton({
  label,
  path,
  icon,
  className = "",
}: NavigateButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(path)}
      className={`flex items-center gap-2 px-4 py-2 rounded ${className} themeColor`}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}