import React, { useState } from "react";
import toast from "react-hot-toast";
import axiosWrapper from "../utils/AxiosWrapper";

const getCurrentSemester = (enrollDate) => {
  if (!enrollDate) return 1;

  const start = new Date(enrollDate);
  const now = new Date();

  const diffMonths =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());

  const semester = Math.floor(diffMonths / 6) + 1;

  return Math.min(Math.max(semester, 1), 10);
};

const ScholarsSemesters = ({scholar}) => {
  const token = localStorage.getItem("userToken");
  const [activeSem, setActiveSem] = useState(1);
  const [pdfFiles, setPdfFiles] = useState({
    registrationSlip: null,
    FeeReceipt: null,
    dpfForm: null
  });
  if (!scholar) return <div className="items-center mt-10 text-xl">Loading...</div>;

  const semesters = scholar.semesters || [];
  const currentSemester = getCurrentSemester(scholar.enrollmentDate);

  const semData = semesters[activeSem - 1];

  const pdfs = semData
    ? [
        { label: "Registration Slip", link: semData.registrationSlip },
        { label: "Fee Receipt", link: semData.FeeReceipt },
        { label: "DPF Form", link: semData.dpfForm }
      ]
    : [];
  
  const handleFileChange = async (key, file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF allowed");
      return;
    }

    try {
      const formData = new FormData();
      formData.append(key, file);
      formData.append("semester", activeSem);
      formData.append("scholarId", scholar._id);

      const res = await axiosWrapper.put(
        `/scholar/update-semester-pdf`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          }
        }
      );

      if(res.data.success){
        // console.log(res.data);
        setPdfFiles((prev) => ({
          ...prev,
          [key]: file
        }));
        toast.success("File Changed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 p-6">      
      <div className="flex flex-wrap gap-2 mb-6 border-b pb-3">
        {[...Array(currentSemester)].map((_, i) => {
          const sem = i + 1;
          return (
            <button
              key={sem}
              onClick={() => setActiveSem(sem)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition
                ${
                  activeSem === sem
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
            >
              Semester {sem}
            </button>
          );
        })}
      </div>

      <div className="max-w-4xl mx-auto my-4 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl text-center font-semibold mb-4 text-gray-800">
          {semData?.name || `Semester ${activeSem}`}
        </h2>

        <div className="flex flex-col items-center">
          {!semData ? (
            <p className="text-gray-500">No data available</p>
          ) : (
            pdfs
              .filter((pdf) => pdf.link) // skip empty
              .map((pdf, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-4 w-full border rounded-lg p-4 my-2  hover:shadow"
                >
                  <span className="font-medium text-gray-700">
                    {pdf.label} :
                  </span>

                  <div className="flex gap-3">
                    <a
                      href={pdf.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Open
                    </a>

                    <a
                      href={pdf.link}
                      download
                      className="text-green-600 text-sm hover:underline"
                    >
                      Download
                    </a>
                  </div>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      handleFileChange(pdf.key, file); // create new
                    }}
                    className="text-xs"
                  />
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ScholarsSemesters;