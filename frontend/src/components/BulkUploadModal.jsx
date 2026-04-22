import React, { useMemo, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";
import CustomButton from "./CustomButton";

const BulkUploadModal = ({
  isOpen,
  onClose,
  columns,
  onUpload,
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [type, setType] = useState("general");

  const columnsMap = {
    general: [  "type",
      "firstName",
      "lastName",
      "rollNo",
      "enrollmentDate",
      "supervisor",
      "coSupervisor",
      "email",
      "phone",
      "profile",
      "courseWork",
      "comprehensiveExamStatus",
      "comprehensiveExamDate",
      "topicRegistrationSeminar",
      "dateRegistrationSeminar",
      "datePresentation",
      "stipendEnhancementStatus",
      "stipendEnhancementDate",
      "preSubmissionStatus",
      "preSubmissionDate",
      "openDefenseStatus",
      "openDefenseDate"
    ],
    publication: ["scholar",
      "type",
      "title",
      "name",
      "category",
      "impactFactor",
      "scopusIndex",
      "conferenceDate",
      "conferenceVenue",
      "applicationNo",
      "dateOfFiled",
      "dateOfFER",
      "dateOfGrant",
      "grantNo",
      "publisher",
      "status",
      "communicationDate",
      "isbn",
      "volumeNo",
      "articleNo",
      "publishedYear",
      "link"
    ],
    semester: ["semesterName",
      "email",
      "registrationSlip",
      "FeeRiceipt",
      "dpfForm"
    ]
  };

  const sampleHeader = useMemo(
    () => (columns ? columns : columnsMap[type]).join(","),
    [type]
  );

  if (!isOpen) return null;

  const handleClose = () => {
    if (uploading) return;
    setFile(null);
    setType("general");
    onClose();
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    try {
      setUploading(true);
      await onUpload(type, file);
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
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <IoMdClose className="text-2xl" />
        </button>

        <h2 className="text-2xl font-semibold mb-4">
          Bulk Upload
        </h2>

        {!columns && <div className="mb-6">
          <label className="block text-sm mb-2 font-medium">
            Select Upload Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border px-4 py-2 rounded-md"
          >
            <option value="general">General informations</option>
            <option value="publication">Publications</option>
            <option value="semester">Semesters</option>
          </select>
        </div>}

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
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full px-4 py-3 border rounded-md"
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
            {uploading ? "Uploading..." : "Upload "}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;