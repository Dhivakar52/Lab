import { useRef } from "react";
import { Flag } from "lucide-react";

interface DocumentItem {
  source: "api" | "local";
  originalFileName: string;
  fileNameGUID?: string;
  file?: File;
  isDeleted?: boolean;
}

interface Props {
  documents: DocumentItem[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>;
  fileError: string;
  setFileError: React.Dispatch<React.SetStateAction<string>>;
  openPreview: (file: Blob, ext: string) => void;
  apiUrl: string;
  authToken: string;
}

export default function DocumentsUpload({
  documents,
  setDocuments,
  fileError,
  setFileError,
  openPreview,
  apiUrl,
  authToken
}: Props) {

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFileError("");
    if (!selectedFiles.length) return;

    if (fileInputRef.current) fileInputRef.current.value = "";

    const activeDocs = documents.filter(d => !d.isDeleted);

    for (const file of selectedFiles) {

      const duplicate = activeDocs.some(
        d =>
          d.originalFileName === file.name &&
          d.file?.size === file.size
      );

      if (duplicate) {
        setFileError(`"${file.name}" already added.`);
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setFileError(`"${file.name}" exceeds 2 MB.`);
        return;
      }
    }

    if (activeDocs.length + selectedFiles.length > 5) {
      setFileError("Maximum 5 files allowed.");
      return;
    }

    const newDocs = selectedFiles.map(file => ({
      source: "local" as const,
      originalFileName: file.name,
      file
    }));

    setDocuments(prev => [...prev, ...newDocs]);
  };

  const activeDocuments = documents.filter(d => !d.isDeleted);

  return (
    <>
      {/* Upload Label */}
      <div className="mt-4">
        <label className="block text-sm font-medium">
          Supporting Documents
          <span className="text-red-500">
            (Max 5 files & below 2MB)
          </span>
        </label>

        <label
          htmlFor="fileUpload"
          className="inline-block bg-gray-100 text-gray-700 border border-gray-300 px-6 py-2 rounded cursor-pointer mt-2 hover:bg-gray-200">
          Choose File
        </label>

        <input
          id="fileUpload"
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />

        {fileError && (
          <p className="text-red-500 text-sm mt-1">{fileError}</p>
        )}
      </div>

      {/* File List */}
      <div className="mt-3 flex flex-wrap gap-2">
        {activeDocuments.map((doc, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg shadow-sm border">

            <span className="text-sm truncate max-w-[180px] text-blue-600">
              {doc.originalFileName}
            </span>

            <button
              type="button"
              onClick={() => {
                if (doc.source === "api") {
                  setDocuments(prev =>
                    prev.map(d =>
                      d.fileNameGUID === doc.fileNameGUID
                        ? { ...d, isDeleted: true }
                        : d
                    )
                  );
                } else {
                  setDocuments(prev =>
                    prev.filter(d => d !== doc)
                  );
                }
              }}
              className="text-red-500 font-bold text-lg">
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
