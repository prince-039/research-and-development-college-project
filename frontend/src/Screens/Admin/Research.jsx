import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { MdDeleteOutline, MdEditNote } from "react-icons/md";
import { BookOpenText } from "lucide-react";
import Heading from "../../components/Heading";
import CustomButton from "../../components/CustomButton";
import Loading from "../../components/Loading";
import BulkUploadModal from "../../components/BulkUploadModal";
import axiosWrapper from "../../utils/AxiosWrapper";

const initialScholarForm = {
  type: "Regular",
  firstName: "",
  lastName: "",
  rollNo: "",
  enrollmentDate: "",
  department: "Computer Science and Engineering",
  email: "",
  phone: "",
  profile: "",
  supervisor: "",
  coSupervisor: "",
};

const Research = () => {
  const token = localStorage.getItem("userToken");
  const navigate = useNavigate();
  const [dataLoading, setDataLoading] = useState(false);
  const [researchItems, setResearchItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedResearchId, setSelectedResearchId] = useState(null);
  const [scholarForm, setScholarForm] = useState(initialScholarForm);
  const [programTab, setProgramTab] = useState("Regular");

  const getResearchItems = async () => {
    try {
      setDataLoading(true);
      const response = await axiosWrapper.get("/scholar");
      if (response.data.success) {
        // console.log(response.data.data)
        setResearchItems(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setResearchItems([]);
      } else {
        toast.error(
          error.response?.data?.message || "Failed to load researcher data"
        );
      }
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    getResearchItems();
  }, []);

  const researchScholars = useMemo(
    () =>
      researchItems.filter(
        (item) => item.type === programTab
      ),
    [programTab, researchItems]
  );

  const resetModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setScholarForm(initialScholarForm);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setScholarForm(initialScholarForm);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setScholarForm({
      type: "Regular",
      firstName: item.firstName || "",
      lastName: item.lastName || "",
      rollNo: item.rollNo || "",
      department: item.department || "Computer Science and Engineering",
      email: item.email || "",
      phone: item.phone || "",
      profile: item.profile || "",
      supervisor: item.supervisor || "",
      coSupervisor: item.coSupervisor || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      toast.loading(editingItem ? "Updating researcher" : "Adding researcher");
      const response = await axiosWrapper[editingItem ? "put" : "post"](
        `/scholar${editingItem ? `/${editingItem._id}` : ""}`,
        scholarForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.dismiss();
      if (response.data.success) {
        toast.success(response.data.message);
        resetModal();
        getResearchItems();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Failed to save researcher");
    }
  };

  const handleScholarChange = (field, value) => {
    setScholarForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBulkUpload = async (type, csvFile) => {
    try {
      toast.loading("Uploading researchers...");
      const payload = new FormData();
      payload.append("file", csvFile);

      const response = await axiosWrapper.post(`/${type==="publication"? "publication/bulk-upload" : "scholar/"+type+"-bulk-upload"}`,
        payload, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.dismiss();

      if (!response.data.success) {
        toast.error(response.data.message || "Bulk upload failed");
        return;
      }

      const { insertedCount, failedCount, errors } = response.data.data;

      if (insertedCount > 0) {
        toast.success(
          `${insertedCount} researcher${insertedCount > 1 ? "s" : ""} uploaded`
        );
      }

      if (failedCount > 0) {
        const previewErrors = errors
          .slice(0, 3)
          .map((error) => `Row ${error.row}: ${error.message}`)
          .join(" | ");

        toast.error(
          `${failedCount} row${failedCount > 1 ? "s" : ""} failed${previewErrors ? `: ${previewErrors}` : ""}`
        );
      }

      getResearchItems();
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Bulk upload failed");
    }
  };

  return (
    <div className="w-full mx-auto flex justify-center items-start flex-col my-10">
      <div className="relative flex justify-between items-center w-full">
        <Heading title="Research Management" />
        {!dataLoading && (
          <div className="flex items-center gap-3">
            <CustomButton
              variant="secondary"
              onClick={() => setShowBulkUploadModal(true)}
            >
              Bulk Upload
            </CustomButton>
            <CustomButton onClick={openAddModal}>
              <IoMdAdd className="text-2xl" />
            </CustomButton>
          </div>
        )}
      </div>

      <div className="mt-8 w-full bg-gray-50 rounded-2xl border border-gray-200 p-8">
        <h2 className="text-center text-3xl font-semibold mb-6">
          Our Research Scholars
        </h2>

        <div className="mb-8 flex justify-center gap-4 text-base font-medium">
          <button
            type="button"
            onClick={() => setProgramTab("Regular")}
            className={`rounded-xl px-5 py-2 ${
              programTab === "Regular"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Regular
          </button>
          <button
            type="button"
            onClick={() => setProgramTab("Part-Time")}
            className={`rounded-xl px-5 py-2 ${
              programTab === "Part-Time"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Part-Time
          </button>
        </div>

        {dataLoading && <Loading />}

        {!dataLoading && (
          <div className="mx-auto rounded bg-white p-4 shadow">
            <div className="grid gap-6 md:grid-cols-2">
              {researchScholars.length === 0 ? (
                <div className="col-span-full rounded-lg bg-gray-50 p-8 text-center text-gray-500">
                  No researchers found in this section.
                </div>
              ) : (
                researchScholars.map((researcher) => (
                  <div
                    key={researcher._id}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex gap-4">
                      <img
                        src={researcher.profile ? `${process.env.REACT_APP_MEDIA_LINK}/${researcher.profile}` : "user.png"}
                        alt={researcher.firstName}
                        className="h-20 w-20 rounded-full object-cover bg-gray-100"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h2
                              className="cursor-pointer pb-1 text-xl font-semibold text-blue-700 transition hover:underline"
                              onClick={() =>
                                navigate(`/admin?page=research-detail&id=${researcher._id}`)
                              }
                            >
                              {researcher.firstName +" "+ researcher.lastName}
                            </h2>
                            {researcher.rollNo && (
                              <p className="text-sm text-red-500">
                                ({researcher.rollNo})
                              </p>
                            )}

                            <div className="mt-2 space-y-1 text-sm text-gray-700">
                              <p>
                                <BookOpenText className="inline-block mr-1" size={15} />
                                {researcher.thesis}
                              </p>
                              <p>Guide: {researcher.supervisor.firstName+" "+researcher.supervisor.lastName}</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <CustomButton
                              variant="secondary"
                              className="!p-2"
                              onClick={() => handleEdit(researcher)}
                            >
                              <MdEditNote />
                            </CustomButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-[90%] max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingItem ? "Edit Researcher" : "Add Researcher"}
              </h2>
              <button onClick={resetModal} className="text-gray-500 hover:text-gray-700">
                <IoMdClose className="text-3xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Scholar First Name" value={scholarForm.firstName} onChange={(e) => handleScholarChange("firstName", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Scholar Last Name" value={scholarForm.lastName} onChange={(e) => handleScholarChange("lastName", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Roll number" value={scholarForm.rollNo} onChange={(e) => handleScholarChange("rollNo", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Department" value={scholarForm.department} onChange={(e) => handleScholarChange("department", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select value={scholarForm.type} onChange={(e) => handleScholarChange("type", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Regular">Regular</option>
                  <option value="Part-Time">Part-Time</option>
                </select>
                <input type="date" placeholder="Enrollment Date" value={scholarForm.enrollmentDate} onChange={(e) => handleScholarChange("enrollmentDate", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="email" placeholder="Email" value={scholarForm.email} onChange={(e) => handleScholarChange("email", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Phone" value={scholarForm.phone} onChange={(e) => handleScholarChange("phone", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="email" placeholder="Supervisor Email" value={scholarForm.supervisor.email} onChange={(e) => handleScholarChange("supervisor", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="email" placeholder="Co-Supervisor Email" value={scholarForm.coSupervisor} onChange={(e) => handleScholarChange("coSupervisor", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="file" placeholder="Profile image" value={scholarForm.profile} onChange={(e) => handleScholarChange("profile", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <CustomButton variant="secondary" onClick={resetModal}>
                  Cancel
                </CustomButton>
                <CustomButton type="submit" variant="primary">
                  {editingItem ? "Update" : "Add"}
                </CustomButton>
              </div>
            </form>
          </div>
        </div>
      )}

      <BulkUploadModal
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        onUpload={handleBulkUpload}
      />
    </div>
  );
};

export default Research;
