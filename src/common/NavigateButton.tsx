import { useNavigate } from "react-router-dom";

type NavigateButtonProps = {
  label: string;
  path: string;
  className?: string;
};

export default function NavigateButton({
  label,
  path,
  className = "",
}: NavigateButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(path)}
      className={`bg-blue-600 text-white px-4 py-2 rounded ${className}`}
    >
      {label}
    </button>
  );
}