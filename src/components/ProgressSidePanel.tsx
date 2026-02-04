import { X, CheckCircle, Clock, Circle, TimerIcon, Hourglass, HourglassIcon, LucideHourglass } from "lucide-react";

interface ProgressSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProgressSidePanel: React.FC<ProgressSidePanelProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-[420px] bg-white h-full shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-gray-300 flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">Progress Details</h3>
            <p className="text-sm text-gray-500">Nomination - SELF-0851</p>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-800" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="bg-blue-50 rounded-lg p-4 mb-6 flex justify-between">
            <div>
              <p className="font-semibold">Ravi Kumar</p>
              <p className="text-sm text-gray-600">SRMAP</p>
              <p className="text-sm text-gray-600">Business Excellence</p>
            </div>
            <span className="h-fit px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
              Under Review
            </span>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div className="flex-1 w-px bg-green-300" />
              </div>
              <div>
                <p className="font-semibold text-sm">
                  Stage 1 - Awaited Judgement at Business Jury
                </p>
                <p className="text-sm text-gray-700 font-medium">Completed</p>
                <p className="text-sm text-gray-500">Reviewer : Business</p>
                <p className="text-sm text-gray-500">
                  Nomination received and verified.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-yellow-200 flex items-center justify-center">
                  <Hourglass className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1 w-px bg-gray-300" />
              </div>
              <div>
                <p className="font-semibold text-sm">
                  Stage 2 - Awaiting Sector Jury
                </p>
                <p className="text-sm text-gray-700 font-medium">
                  Under Review
                </p>
                <p className="text-sm text-gray-500">Reviewer : Jury Panel</p>
                <p className="text-sm text-gray-500">
                  Currently under review...
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center opacity-60">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <Hourglass className="w-4 h-4 text-gray-600" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-sm">
                  Stage 3 - Awaiting for final result
                </p>
                <p className="text-sm text-gray-700 font-medium">Pending</p>
                <p className="text-sm text-gray-500">
                  Reviewer : Board Committee
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 px-6 py-4 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressSidePanel;
