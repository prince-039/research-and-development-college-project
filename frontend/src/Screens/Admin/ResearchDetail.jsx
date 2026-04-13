import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { IoMdClose } from "react-icons/io";
import { MdDeleteOutline } from "react-icons/md";
import Heading from "../../components/Heading";
import CustomButton from "../../components/CustomButton";
import DeleteConfirm from "../../components/DeleteConfirm";
import axiosWrapper from "../../utils/AxiosWrapper";
import {
  createEmptyPublication,
  publicationCategories,
  publicationFieldConfig,
} from "../../utils/researchPublicationConfig";

const previewNavTabs = [
  { key: "home", label: "Home" },
  { key: "profile", label: "Profile" },
  { key: "publications", label: "Publications" },
  { key: "semester", label: "Semester Registration" },
];

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

const ResearchDetail = () => {
  const token = localStorage.getItem("userToken");
  const navigate = useNavigate();
  const location = useLocation();
  const [researcher, setResearcher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewTab, setPreviewTab] = useState("home");
  const [publicationTab, setPublicationTab] = useState("journal");
  const [showModal, setShowModal] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [scholarForm, setScholarForm] = useState(initialScholarForm);

  const researcherId = new URLSearchParams(location.search).get("id");

  const loadResearcher = async () => {
    if (!researcherId) {
      setResearcher(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axiosWrapper.get(`/research/${researcherId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setResearcher(response.data.data);
      } else {
        setResearcher(null);
      }
    } catch (error) {
      setResearcher(null);
      toast.error(error.response?.data?.message || "Failed to load researcher");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResearcher();
  }, [researcherId]);

  const previewPublications = useMemo(
    () =>
      (researcher?.publications || []).filter(
        (publication) => publication.category === publicationTab
      ),
    [researcher, publicationTab]
  );

  const modalPublications = scholarForm.publications.filter(
    (publication) => publication.category === publicationTab
  );

  const openEditModal = () => {
    if (!researcher) {
      return;
    }
    setScholarForm({
      type: "scholar",
      name: researcher.name || "",
      roll: researcher.roll || "",
      department: researcher.department || "Computer Science and Engineering",
      email: researcher.email || "",
      phone: researcher.phone || "",
      website: researcher.website || "",
      profileImage: researcher.profileImage || "",
      thesis: researcher.thesis || "",
      year: researcher.year || "",
      guide: researcher.guide || "",
      programType: researcher.programType || "regular",
      semesterRegistration: researcher.semesterRegistration || "",
      publications: Array.isArray(researcher.publications)
        ? researcher.publications
        : [],
    });
    setPublicationTab(researcher.publications?.[0]?.category || "journal");
    setShowModal(true);
  };

  const resetModal = () => {
    setShowModal(false);
    setScholarForm(initialScholarForm);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      toast.loading("Updating researcher");
      const response = await axiosWrapper.put(`/research/${researcherId}`, scholarForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.dismiss();
      if (response.data.success) {
        toast.success(response.data.message);
        setShowModal(false);
        loadResearcher();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Failed to update researcher");
    }
  };

  const handleDelete = async () => {
    try {
      toast.loading("Deleting researcher");
      const response = await axiosWrapper.delete(`/research/${researcherId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.dismiss();
      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/admin?page=research");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Failed to delete researcher");
    }
  };

  if (loading) {
    return <div className="mt-10 text-center">Loading researcher...</div>;
  }

  if (!researcher) {
    return (
      <div className="mt-10">
        <Heading title="Research Details" />
        <div className="mt-8 rounded-2xl border bg-white p-10 text-center text-gray-500">
          Researcher not found.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto flex justify-center items-start flex-col my-10">
      <div className="flex justify-between items-center w-full">
        <Heading title="Research Management" />
        <div className="flex gap-3">
          <CustomButton variant="secondary" onClick={() => navigate("/admin?page=research")}>
            Back
          </CustomButton>
          <CustomButton onClick={openEditModal}>Edit</CustomButton>
          <CustomButton variant="danger" onClick={() => setIsDeleteConfirmOpen(true)}>
            Delete
          </CustomButton>
        </div>
      </div>

      <div className="mt-10 w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">
        <div className="bg-white py-5 text-center border-b">
          <h2 className="text-4xl font-bold tracking-wide text-blue-700">
            {researcher.name}
          </h2>
        </div>

        <div className="bg-blue-600 px-4 py-3 text-white">
          <div className="flex flex-wrap justify-evenly gap-4">
            {previewNavTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setPreviewTab(tab.key)}
                className="text-lg hover:underline"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {(previewTab === "home" || previewTab === "profile") && (
          <div className="p-6">
            <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-6 md:flex-row">
                <img
                  src={
                    researcher.profileImage ||
                    `https://api.dicebear.com/7.x/adventurer/svg?seed=${researcher.name}`
                  }
                  alt={researcher.name}
                  className="h-40 w-40 rounded bg-gray-100 object-cover"
                />
                <div className="text-gray-800">
                  <h3 className="text-3xl font-bold text-blue-700">{researcher.name}</h3>
                  <p className="mt-3 text-lg">{researcher.roll}</p>
                  <p className="text-lg">{researcher.department}</p>
                  <div className="mt-4 space-y-2 text-sm md:text-base">
                    {researcher.phone && <p>Phone: {researcher.phone}</p>}
                    {researcher.email && <p>Email: {researcher.email}</p>}
                    {researcher.website && <p>Website: {researcher.website}</p>}
                    {researcher.guide && <p>Guide: {researcher.guide}</p>}
                    {researcher.thesis && <p>Research Title: {researcher.thesis}</p>}
                    {researcher.year && <p>Year: {researcher.year}</p>}
                    <p>
                      Program: {researcher.programType === "partTime" ? "Part-Time" : "Regular"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {previewTab === "publications" && (
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              {publicationCategories.map((category) => (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => setPublicationTab(category.key)}
                  className={`rounded-xl px-6 py-3 font-medium ${
                    publicationTab === category.key
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 shadow-sm"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left text-gray-700">
                    <th className="px-4 py-4">S.No.</th>
                    {publicationFieldConfig[publicationTab].columns.map(
                      ([field, label]) => (
                        <th key={field} className="px-4 py-4">
                          {label}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {previewPublications.length === 0 ? (
                    <tr>
                      <td
                        colSpan={publicationFieldConfig[publicationTab].columns.length + 1}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No publications added in this category yet.
                      </td>
                    </tr>
                  ) : (
                    previewPublications.map((publication, index) => (
                      <tr key={`${publication.category}-${index}`} className="border-t">
                        <td className="px-4 py-4">{index + 1}</td>
                        {publicationFieldConfig[publicationTab].columns.map(
                          ([field]) => (
                            <td key={field} className="px-4 py-4">
                              {field === "link"
                                ? publication.link ? (
                                    <a href={publication.link} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                                      View
                                    </a>
                                  ) : (
                                    "NA"
                                  )
                                : publication[field] || "NA"}
                            </td>
                          )
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {previewTab === "semester" && (
          <div className="p-6">
            <div className="rounded-xl bg-white p-6 shadow">
              <h3 className="mb-3 text-2xl font-semibold text-blue-700">
                Semester Registration
              </h3>
              <p className="leading-7 text-gray-700">
                {researcher.semesterRegistration ||
                  "Semester registration details have not been added yet."}
              </p>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-[90%] max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Edit Researcher</h2>
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
                            {publicationFieldConfig[publication.category].columns.map(([field, label]) => (
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
                  Update
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
    </div>
  );
};

export default ResearchDetail;
