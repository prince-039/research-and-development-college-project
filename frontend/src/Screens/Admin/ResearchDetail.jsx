import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { IoMdClose } from "react-icons/io";
import Heading from "../../components/Heading";
import CustomButton from "../../components/CustomButton";
import DeleteConfirm from "../../components/DeleteConfirm";
import axiosWrapper from "../../utils/AxiosWrapper";
import ScholarsInfo from "../ScholarsInfo";
import ScholarsPublications from "../ScholarsPublications";
import ScholarsSemesters from "../ScholarsSemesters";

const previewNavTabs = [
  { key: "home", label: "Home" },
  { key: "profile", label: "Profile" },
  { key: "publications", label: "Publications" },
  { key: "semester", label: "Semester Registration" },
];

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

const ResearchDetail = ({id}) => {
  const token = localStorage.getItem("userToken");
  const userType = localStorage.getItem("userType");
  const navigate = useNavigate();
  const location = useLocation();
  const [researcher, setResearcher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewTab, setPreviewTab] = useState("home");
  const [showModal, setShowModal] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [scholarForm, setScholarForm] = useState(initialScholarForm);

  const researcherId = new URLSearchParams(location.search).get("id") || id;

  const loadResearcher = async () => {
    try {
      setLoading(true);
      const response = await axiosWrapper.get(researcherId ? `/scholar/${researcherId}` : "/scholar/my-details", {
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

  const openEditModal = () => {
    if (!researcher) {
      return;
    }
    setScholarForm({
      type: researcher.type || "Regular",
      firstName: researcher.firstName || "",
      lastName: researcher.lastName || "",
      rollNo: researcher.rollNo || "",
      department: researcher.department || "Computer Science and Engineering",
      email: researcher.email || "",
      phone: researcher.phone || "",
      profile: researcher.profile || "",
      supervisor: researcher.supervisor || "",
      coSupervisor: researcher.coSupervisor || "",
     
    });
    setShowModal(true);
  };

  const resetModal = () => {
    setShowModal(false);
    setScholarForm(initialScholarForm);
  };

  const handleScholarChange = (field, value) => {
    setScholarForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      toast.loading("Updating researcher");
      const response = await axiosWrapper.put(`/scholar/${researcherId}`, scholarForm, {
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
      const response = await axiosWrapper.delete(`/scholar/${researcherId}`, {
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
      {userType==="Admin" && <div className="flex justify-between items-center w-full">
        <Heading title="Researcher Details" />
        <div className="flex gap-3">
          <CustomButton variant="secondary" onClick={() => navigate("/admin?page=research")}>
            Back
          </CustomButton>
          <CustomButton variant="danger" onClick={() => setIsDeleteConfirmOpen(true)}>
            Delete
          </CustomButton>
        </div>
      </div>}

      <div className="mt-4 w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">
        <div className="bg-white py-5 text-center border-b">
          <h2 className="text-4xl font-bold tracking-wide text-blue-700">
            {researcher.firstName +" "+researcher.lastName}
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
        
        {/* {previewTab==="home" && navigate(-1)} */}

        {(previewTab==="home" || previewTab === "profile") && (
          <ScholarsInfo scholar={researcher} openEditModal={openEditModal} />
        )}
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

        {previewTab === "publications" && (
          <ScholarsPublications id={researcher._id} />
        )}
        

        {previewTab === "semester" && (
          <ScholarsSemesters scholar={researcher} />
        )}
      </div>

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
