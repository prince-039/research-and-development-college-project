import React, { useMemo, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";
import CustomButton from "./CustomButton";

const BulkUploadModal = ({
  isOpen,
  onClose,
  title,
  uploadLabel,
  columns,
  onUpload,
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const sampleHeader = useMemo(() => columns.join(","), [columns]);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    if (uploading) {
      return;
    }
    setFile(null);
    onClose();
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    try {
      setUploading(true);
      await onUpload(file);
      setFile(null);
      onClose();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <IoMdClose className="text-2xl" />
        </button>

        <h2 className="text-2xl font-semibold mb-4">{title}</h2>
        <p className="text-sm text-gray-600 mb-4">
          Upload a CSV file. The first row must contain these headers.
        </p>

        <div className="bg-gray-50 border rounded-lg p-4 mb-6">
          <p className="text-xs text-gray-500 mb-2">CSV columns</p>
          <code className="block text-sm break-all text-gray-800">
            {sampleHeader}
          </code>
        </div>

        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {file && (
          <p className="text-sm text-gray-600 mt-3">
            Selected file: <span className="font-medium">{file.name}</span>
          </p>
        )}

        <div className="mt-8 flex justify-end gap-4">
          <CustomButton
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={uploading}
          >
            Cancel
          </CustomButton>
          <CustomButton
            type="button"
            variant="primary"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : uploadLabel}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
