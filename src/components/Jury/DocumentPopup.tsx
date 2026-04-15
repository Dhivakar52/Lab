import CommonPopup from "../Jury/CommonPopup";

interface DocPopupProps {
  open: boolean;
  docs: any[];
  onClose: () => void;
  onPreview: (doc: any) => void;
}

const DocumentPopup = ({ open, docs, onClose, onPreview }: DocPopupProps) => {
  
  // 👉 duplicate remove (IMPORTANT FIX)
  const uniqueDocs = docs.filter(
    (doc, index, self) =>
      index === self.findIndex(d => d.fileNameGUID === doc.fileNameGUID)
  );

  return (
    <CommonPopup open={open} title="Documents" onClose={onClose}>
      <div className="space-y-2">
        {uniqueDocs.map((doc) => (
          <div
            key={doc.fileNameGUID}
            className="border rounded px-3 py-2 hover:bg-gray-50">

            <span
              onClick={() => onPreview(doc)}
              className="text-blue-600 cursor-pointer hover:underline">
              {doc.originalFileName}
            </span>

          </div>
        ))}
      </div>
    </CommonPopup>
  );
};

export default DocumentPopup;