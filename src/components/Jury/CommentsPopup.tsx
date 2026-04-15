import CommonPopup from "../Jury/CommonPopup";

interface CommentsPopupProps {
  open: boolean;
  comment: string;
  onClose: () => void;
}

const CommentsPopup = ({ open, comment, onClose }: CommentsPopupProps) => {
  return (
    <CommonPopup open={open} title="Comments" onClose={onClose}>
      <div className="border rounded p-3 bg-gray-50">
        <p className="text-sm text-gray-800 whitespace-pre-wrap">
          {comment}
        </p>
      </div>
    </CommonPopup>
  );
};

export default CommentsPopup;