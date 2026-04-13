import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { MdDeleteOutline, MdEditNote } from "react-icons/md";
import { BookOpenText } from "lucide-react";
import Heading from "../../components/Heading";
import CustomButton from "../../components/CustomButton";
import DeleteConfirm from "../../components/DeleteConfirm";
import Loading from "../../components/Loading";
import BulkUploadModal from "../../components/BulkUploadModal";
import axiosWrapper from "../../utils/AxiosWrapper";
import {
  createEmptyPublication,
  publicationCategories,
  publicationFieldConfig,
} from "../../utils/researchPublicationConfig";

const initialScholarForm = {
  type: "scholar",
  name: "",
  roll: "",
  department: "Computer Science and Engineering",
  email: "",
  phone: "",
  website: "",
  profileImage: "",
  thesis: "",
  year: "",
  guide: "",
  programType: "regular",
  semesterRegistration: "",
  publications: [],
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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [scholarForm, setScholarForm] = useState(initialScholarForm);
  const [programTab, setProgramTab] = useState("regular");
  const [publicationTab, setPublicationTab] = useState("journal");

  const getResearchItems = async () => {
    try {
      setDataLoading(true);
      const response = await axiosWrapper.get("/research");
      if (response.data.success) {
        setResearchItems(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setResearchItems([]);
      } else {
        toast.error(
          error.response?.data?.message || "Failed to load research data"
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
        (item) => item.type === "scholar" && (item.programType || "regular") === programTab
      ),
    [programTab, researchItems]
  );

  const modalPublications = scholarForm.publications.filter(
    (publication) => publication.category === publicationTab
  );

  const resetModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setScholarForm(initialScholarForm);
    setPublicationTab("journal");
  };

  const openAddModal = () => {
    setEditingItem(null);
    setScholarForm(initialScholarForm);
    setPublicationTab("journal");
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setScholarForm({
      type: "scholar",
      name: item.name || "",
      roll: item.roll || "",
      department: item.department || "Computer Science and Engineering",
      email: item.email || "",
      phone: item.phone || "",
      website: item.website || "",
      profileImage: item.profileImage || "",
      thesis: item.thesis || "",
      year: item.year || "",
      guide: item.guide || "",
      programType: item.programType || "regular",
      semesterRegistration: item.semesterRegistration || "",
      publications: Array.isArray(item.publications) ? item.publications : [],
    });
    setPublicationTab(item.publications?.[0]?.category || "journal");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      toast.loading(editingItem ? "Updating researcher" : "Adding researcher");
      const response = await axiosWrapper[editingItem ? "put" : "post"](
        `/research${editingItem ? `/${editingItem._id}` : ""}`,
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

  const handleDelete = async () => {
    try {
      toast.loading("Deleting researcher");
      const response = await axiosWrapper.delete(`/research/${selectedResearchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.dismiss();
      if (response.data.success) {
        toast.success(response.data.message);
        setIsDeleteConfirmOpen(false);
        getResearchItems();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Failed to delete researcher");
    }
  };

  const handleScholarChange = (field, value) => {
    setScholarForm((prev) => ({ ...prev, [field]: value }));
  };

  const addPublicationRow = (category) => {
    setScholarForm((prev) => ({
      ...prev,
      publications: [...prev.publications, createEmptyPublication(category)],
    }));
  };

  const updatePublicationRow = (index, field, value) => {
    setScholarForm((prev) => ({
      ...prev,
      publications: prev.publications.map((publication, publicationIndex) =>
        publicationIndex === index ? { ...publication, [field]: value } : publication
      ),
    }));
  };

  const removePublicationRow = (index) => {
    setScholarForm((prev) => ({
      ...prev,
      publications: prev.publications.filter((_, publicationIndex) => publicationIndex !== index),
    }));
  };

  const handleBulkUpload = async (csvFile) => {
    try {
      toast.loading("Uploading researchers...");
      const payload = new FormData();
      payload.append("file", csvFile);

      const response = await axiosWrapper.post(`/research/bulk-upload`, payload, {
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
            onClick={() => setProgramTab("regular")}
            className={`rounded-xl px-5 py-2 ${
              programTab === "regular"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Regular
          </button>
          <button
            type="button"
            onClick={() => setProgramTab("partTime")}
            className={`rounded-xl px-5 py-2 ${
              programTab === "partTime"
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
                        src={
                          researcher.profileImage ||
                          `https://api.dicebear.com/7.x/adventurer/svg?seed=${researcher.name}`
                        }
                        alt={researcher.name}
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
                              {researcher.name}
                            </h2>
                            {researcher.roll && (
                              <p className="text-sm text-red-500">
                                ({researcher.roll})
                              </p>
                            )}

                            <div className="mt-2 space-y-1 text-sm text-gray-700">
                              <p>
                                <BookOpenText className="inline-block mr-1" size={15} />
                                {researcher.thesis}
                              </p>
                              <p>Guide: {researcher.guide}</p>
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
                            <CustomButton
                              variant="danger"
                              className="!p-2"
                              onClick={() => {
                                setSelectedResearchId(researcher._id);
                                setIsDeleteConfirmOpen(true);
                              }}
                            >
                              <MdDeleteOutline />
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
                <input type="text" placeholder="Researcher name" value={scholarForm.name} onChange={(e) => handleScholarChange("name", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Roll number" value={scholarForm.roll} onChange={(e) => handleScholarChange("roll", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Department" value={scholarForm.department} onChange={(e) => handleScholarChange("department", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select value={scholarForm.programType} onChange={(e) => handleScholarChange("programType", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="regular">Regular</option>
                  <option value="partTime">Part-Time</option>
                </select>
                <input type="email" placeholder="Email" value={scholarForm.email} onChange={(e) => handleScholarChange("email", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Phone" value={scholarForm.phone} onChange={(e) => handleScholarChange("phone", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Guide" value={scholarForm.guide} onChange={(e) => handleScholarChange("guide", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Passing/Publish year" value={scholarForm.year} onChange={(e) => handleScholarChange("year", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Website" value={scholarForm.website} onChange={(e) => handleScholarChange("website", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Profile image URL" value={scholarForm.profileImage} onChange={(e) => handleScholarChange("profileImage", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <textarea rows="3" placeholder="Thesis / research title" value={scholarForm.thesis} onChange={(e) => handleScholarChange("thesis", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <textarea rows="3" placeholder="Semester registration details" value={scholarForm.semesterRegistration} onChange={(e) => handleScholarChange("semesterRegistration", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-3">
                    {publicationCategories.map((category) => (
                      <button
                        key={category.key}
                        type="button"
                        onClick={() => setPublicationTab(category.key)}
                        className={`rounded-xl px-4 py-2 text-sm font-medium ${
                          publicationTab === category.key
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                  <CustomButton type="button" onClick={() => addPublicationRow(publicationTab)}>
                    Add {publicationCategories.find((item) => item.key === publicationTab)?.label}
                  </CustomButton>
                </div>

                <div className="mt-4 space-y-4">
                  {modalPublications.length === 0 ? (
                    <div className="rounded-lg bg-gray-50 px-4 py-6 text-sm text-gray-500">
                      No {publicationCategories.find((item) => item.key === publicationTab)?.label.toLowerCase()} entries added yet.
                    </div>
                  ) : (
                    scholarForm.publications.map((publication, publicationIndex) =>
                      publication.category === publicationTab ? (
                        <div key={`${publication.category}-${publicationIndex}`} className="rounded-xl border border-gray-200 p-4">
                          <div className="mb-4 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800">
                              {publicationCategories.find((item) => item.key === publication.category)?.label} Entry
                            </h3>
                            <CustomButton type="button" variant="danger" className="!p-2" onClick={() => removePublicationRow(publicationIndex)}>
                              <MdDeleteOutline />
                            </CustomButton>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                              ...publicationFieldConfig[publication.category]
                                .columns,
                            ].map(([field, label]) => (
                              <input
                                key={field}
                                type="text"
                                placeholder={label}
                                value={publication[field]}
                                onChange={(e) => updatePublicationRow(publicationIndex, field, e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            ))}
                          </div>
                        </div>
                      ) : null
                    )
                  )}
                </div>
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

      <DeleteConfirm
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this researcher?"
      />
      <BulkUploadModal
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        title="Bulk Upload Researchers"
        uploadLabel="Upload Researchers"
        columns={[
          "name",
          "roll",
          "department",
          "email",
          "phone",
          "website",
          "profileImage",
          "thesis",
          "year",
          "guide",
          "programType",
          "semesterRegistration",
          "publicationCategory",
          "publicationTitle",
          "publicationName",
          "applicationNumber",
          "scopusIndex",
          "dateOfConference",
          "venueOfConference",
          "publisher",
          "dateOfFiled",
          "dateOfFer",
          "dateOfGrant",
          "grantNumber",
          "publicationType",
          "impactFactor",
          "status",
          "dateOfCommunication",
          "isbn",
          "volumeNumber",
          "articleNumber",
          "publishYear",
          "link",
        ]}
        onUpload={handleBulkUpload}
      />
    </div>
  );
};

export default Research;
