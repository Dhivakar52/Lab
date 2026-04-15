import React from "react";

interface CommonPopupProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const CommonPopup = ({ open, title, onClose, children }: CommonPopupProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] rounded-lg shadow-lg p-5">
        
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="max-h-[300px] overflow-auto">
          {children}
        </div>

      </div>
    </div>
  );
};

export default CommonPopup;