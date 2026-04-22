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
import UpdatePasswordLoggedIn from "../../components/UpdatePasswordLoggedIn";

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
  supervisorName: "",
  coSupervisorName: "",
  comprehensiveExamStatus: "NA",
  comprehensiveExamDate: "",
  seminarTopic: "",
  seminarRegistrationDate: "",
  seminarPresentationDate: "",
  stipendEnhancementStatus: "NA",
  stipendEnhancementDate: "",
  preSubmissionStatus: "NA",
  preSubmissionDate: "",
  openDefenseStatus: "NA",
  openDefenseDate: "",
};

const createSrcCommitteeEntry = (entry = {}) => ({
  member: entry.member?._id || entry.member || "",
  designation: entry.designation || "",
});

const formatDateInput = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().split("T")[0];
};

const ResearchDetail = ({id}) => {
  const token = localStorage.getItem("userToken");
  const userType = localStorage.getItem("userType");
  const navigate = useNavigate();
  const location = useLocation();
  const [researcher, setResearcher] = useState(null);
  const [facultyOptions, setFacultyOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewTab, setPreviewTab] = useState("home");
  const [showModal, setShowModal] = useState(false);
  const [showSrcCommitteeModal, setShowSrcCommitteeModal] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [scholarForm, setScholarForm] = useState(initialScholarForm);
  const [srcCommitteeForm, setSrcCommitteeForm] = useState([createSrcCommitteeEntry()]);
  const [refresh, setRefresh] = useState("");
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);

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

  const loadFacultyOptions = async () => {
    try {
      const response = await axiosWrapper.get(`/faculty`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setFacultyOptions(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setFacultyOptions([]);
      }
    } catch (error) {
      setFacultyOptions([]);
    }
  };

  useEffect(() => {
    loadResearcher();
    loadFacultyOptions();
  }, [researcherId, refresh]);

  const openEditModal = () => {
    if (!researcher) {
      return;
    }
    setScholarForm({
      type: researcher.type || "Regular",
      firstName: researcher.firstName || "",
      lastName: researcher.lastName || "",
      rollNo: researcher.rollNo || "",
      enrollmentDate: formatDateInput(researcher.enrollmentDate),
      department: researcher.department || "Computer Science and Engineering",
      email: researcher.email || "",
      phone: researcher.phone || "",
      profile: researcher.profile || "",
      supervisor: researcher.supervisor?._id || researcher.supervisor || "",
      coSupervisor: researcher.coSupervisor?._id || researcher.coSupervisor || "",
      supervisorName: researcher.supervisor
        ? `${researcher.supervisor.firstName || ""} ${researcher.supervisor.lastName || ""}`.trim()
        : "",
      coSupervisorName: researcher.coSupervisor
        ? `${researcher.coSupervisor.firstName || ""} ${researcher.coSupervisor.lastName || ""}`.trim()
        : "",
      comprehensiveExamStatus: researcher.comprehensiveExam?.status || "NA",
      comprehensiveExamDate: formatDateInput(researcher.comprehensiveExam?.date),
      seminarTopic: researcher.seminar?.topic || "",
      seminarRegistrationDate: formatDateInput(researcher.seminar?.dateRegistration),
      seminarPresentationDate: formatDateInput(researcher.seminar?.datePresentation),
      stipendEnhancementStatus: researcher.stipendEnhancementSeminar?.status || "NA",
      stipendEnhancementDate: formatDateInput(researcher.stipendEnhancementSeminar?.date),
      preSubmissionStatus: researcher.preSubmissionSeminar?.status || "NA",
      preSubmissionDate: formatDateInput(researcher.preSubmissionSeminar?.date),
      openDefenseStatus: researcher.openDefense?.status || "NA",
      openDefenseDate: formatDateInput(researcher.openDefense?.date),
    });
    setShowModal(true);
  };

  const openSrcCommitteeModal = () => {
    if (!researcher) {
      return;
    }

    setSrcCommitteeForm(
      researcher.srcCommittee?.length
        ? researcher.srcCommittee.map(createSrcCommitteeEntry)
        : [createSrcCommitteeEntry()]
    );
    setShowSrcCommitteeModal(true);
  };

  const resetModal = () => {
    setShowModal(false);
    setScholarForm(initialScholarForm);
  };

  const resetSrcCommitteeModal = () => {
    setShowSrcCommitteeModal(false);
    setSrcCommitteeForm([createSrcCommitteeEntry()]);
  };

  const handleScholarChange = (field, value) => {
    setScholarForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSrcCommitteeChange = (index, field, value) => {
    setSrcCommitteeForm((prev) =>
      prev.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry
      )
    );
  };

  const addSrcCommitteeRow = () => {
    setSrcCommitteeForm((prev) => [...prev, createSrcCommitteeEntry()]);
  };

  const removeSrcCommitteeRow = (index) => {
    setSrcCommitteeForm((prev) => {
      const next = prev.filter((_, entryIndex) => entryIndex !== index);
      return next.length > 0 ? next : [createSrcCommitteeEntry()];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      toast.loading("Updating researcher");
      const payload = {
        type: scholarForm.type,
        firstName: scholarForm.firstName,
        lastName: scholarForm.lastName,
        rollNo: scholarForm.rollNo,
        enrollmentDate: scholarForm.enrollmentDate || null,
        department: scholarForm.department,
        email: scholarForm.email,
        phone: scholarForm.phone,
        profile: scholarForm.profile,
        supervisor: scholarForm.supervisor || null,
        coSupervisor: scholarForm.coSupervisor || null,
        comprehensiveExam: {
          status: scholarForm.comprehensiveExamStatus,
          date: scholarForm.comprehensiveExamDate || null,
        },
        seminar: {
          topic: scholarForm.seminarTopic,
          dateRegistration: scholarForm.seminarRegistrationDate || null,
          datePresentation: scholarForm.seminarPresentationDate || null,
        },
        stipendEnhancementSeminar: {
          status: scholarForm.stipendEnhancementStatus,
          date: scholarForm.stipendEnhancementDate || null,
        },
        preSubmissionSeminar: {
          status: scholarForm.preSubmissionStatus,
          date: scholarForm.preSubmissionDate || null,
        },
        openDefense: {
          status: scholarForm.openDefenseStatus,
          date: scholarForm.openDefenseDate || null,
        },
        srcCommittee: researcher.srcCommittee || [],
      };

      const response = await axiosWrapper.put(`/scholar/${researcherId}`, payload, {
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

  const handleSrcCommitteeSubmit = async (e) => {
    e.preventDefault();
    try {
      toast.loading("Updating SRC Committee");
      const payload = {
        type: researcher.type,
        firstName: researcher.firstName,
        lastName: researcher.lastName,
        rollNo: researcher.rollNo,
        enrollmentDate: researcher.enrollmentDate || null,
        department: researcher.department,
        email: researcher.email,
        phone: researcher.phone,
        profile: researcher.profile,
        supervisor: researcher.supervisor?._id || researcher.supervisor || null,
        coSupervisor: researcher.coSupervisor?._id || researcher.coSupervisor || null,
        comprehensiveExam: researcher.comprehensiveExam || { status: "NA", date: null },
        seminar: researcher.seminar || {},
        stipendEnhancementSeminar: researcher.stipendEnhancementSeminar || { status: "NA", date: null },
        preSubmissionSeminar: researcher.preSubmissionSeminar || { status: "NA", date: null },
        openDefense: researcher.openDefense || { status: "NA", date: null },
        srcCommittee: srcCommitteeForm.filter((entry) => entry.member).map((entry) => ({
          member: entry.member,
          designation: entry.designation || "",
        })),
      };

      const response = await axiosWrapper.put(`/scholar/${researcherId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.dismiss();
      if (response.data.success) {
        toast.success(response.data.message);
        setShowSrcCommitteeModal(false);
        loadResearcher();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Failed to update SRC Committee");
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
        <div className="relative bg-white py-5 text-center border-b">
          <h2 className="text-4xl font-bold tracking-wide text-blue-700">
            {researcher.firstName +" "+researcher.lastName}
          </h2>
          <div className="absolute top-6 right-10 flex items-center gap-8 justify-end ">
            <CustomButton
              onClick={() => setShowPasswordUpdate(!showPasswordUpdate)}
              variant="primary"
            >
              {showPasswordUpdate ? "Hide" : "Update Password"}
            </CustomButton>
          </div>
            {showPasswordUpdate && (
              <UpdatePasswordLoggedIn
                onClose={() => setShowPasswordUpdate(false)}
              />
            )}
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
          <ScholarsInfo scholar={researcher} openEditModal={openEditModal} openSrcCommitteeModal={openSrcCommitteeModal} />
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
                  <input type="text" placeholder="First name" value={scholarForm.firstName} onChange={(e) => handleScholarChange("firstName", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" placeholder="Last name" value={scholarForm.lastName} onChange={(e) => handleScholarChange("lastName", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" placeholder="Roll number" value={scholarForm.rollNo} onChange={(e) => handleScholarChange("rollNo", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="date" placeholder="Enrollment date" value={scholarForm.enrollmentDate} onChange={(e) => handleScholarChange("enrollmentDate", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" placeholder="Department" value={scholarForm.department} onChange={(e) => handleScholarChange("department", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <select value={scholarForm.type} onChange={(e) => handleScholarChange("type", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Regular">Regular</option>
                    <option value="Part-Time">Part-Time</option>
                  </select>
                  <input type="email" placeholder="Email" value={scholarForm.email} onChange={(e) => handleScholarChange("email", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" placeholder="Phone" value={scholarForm.phone} onChange={(e) => handleScholarChange("phone", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <select value={scholarForm.supervisor} onChange={(e) => {
                    const selected = facultyOptions.find((faculty) => faculty._id === e.target.value);
                    handleScholarChange("supervisor", e.target.value);
                    handleScholarChange("supervisorName", selected ? `${selected.firstName || ""} ${selected.lastName || ""}`.trim() : "");
                  }} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Supervisor</option>
                    {facultyOptions.map((faculty) => (
                      <option key={faculty._id} value={faculty._id}>
                        {`${faculty.firstName || ""} ${faculty.lastName || ""}`.trim()}
                      </option>
                    ))}
                  </select>
                  <select value={scholarForm.coSupervisor} onChange={(e) => {
                    const selected = facultyOptions.find((faculty) => faculty._id === e.target.value);
                    handleScholarChange("coSupervisor", e.target.value);
                    handleScholarChange("coSupervisorName", selected ? `${selected.firstName || ""} ${selected.lastName || ""}`.trim() : "");
                  }} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Co-Supervisor</option>
                    {facultyOptions.map((faculty) => (
                      <option key={faculty._id} value={faculty._id}>
                        {`${faculty.firstName || ""} ${faculty.lastName || ""}`.trim()}
                      </option>
                    ))}
                  </select>
                  <input type="text" placeholder="Profile image URL" value={scholarForm.profile} onChange={(e) => handleScholarChange("profile", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select value={scholarForm.comprehensiveExamStatus} onChange={(e) => handleScholarChange("comprehensiveExamStatus", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="NA">Comprehensive Exam: NA</option>
                    <option value="yes">Comprehensive Exam: yes</option>
                    <option value="no">Comprehensive Exam: no</option>
                  </select>
                  <input type="date" placeholder="Comprehensive exam date" value={scholarForm.comprehensiveExamDate} onChange={(e) => handleScholarChange("comprehensiveExamDate", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" placeholder="Seminar topic" value={scholarForm.seminarTopic} onChange={(e) => handleScholarChange("seminarTopic", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="date" placeholder="Registration seminar date" value={scholarForm.seminarRegistrationDate} onChange={(e) => handleScholarChange("seminarRegistrationDate", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="date" placeholder="Presentation date" value={scholarForm.seminarPresentationDate} onChange={(e) => handleScholarChange("seminarPresentationDate", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <select value={scholarForm.stipendEnhancementStatus} onChange={(e) => handleScholarChange("stipendEnhancementStatus", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="NA">Stipend Enhancement: NA</option>
                    <option value="yes">Stipend Enhancement: yes</option>
                    <option value="no">Stipend Enhancement: no</option>
                  </select>
                  <input type="date" placeholder="Stipend enhancement date" value={scholarForm.stipendEnhancementDate} onChange={(e) => handleScholarChange("stipendEnhancementDate", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <select value={scholarForm.preSubmissionStatus} onChange={(e) => handleScholarChange("preSubmissionStatus", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="NA">Pre Submission: NA</option>
                    <option value="yes">Pre Submission: yes</option>
                    <option value="no">Pre Submission: no</option>
                  </select>
                  <input type="date" placeholder="Pre submission date" value={scholarForm.preSubmissionDate} onChange={(e) => handleScholarChange("preSubmissionDate", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <select value={scholarForm.openDefenseStatus} onChange={(e) => handleScholarChange("openDefenseStatus", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="NA">Open Defense: NA</option>
                    <option value="yes">Open Defense: yes</option>
                    <option value="no">Open Defense: no</option>
                  </select>
                  <input type="date" placeholder="Open defense date" value={scholarForm.openDefenseDate} onChange={(e) => handleScholarChange("openDefenseDate", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
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

        {showSrcCommitteeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold">Edit SRC Committee</h2>
                <button onClick={resetSrcCommitteeModal} className="text-gray-500 hover:text-gray-700">
                  <IoMdClose className="text-3xl" />
                </button>
              </div>

              <form onSubmit={handleSrcCommitteeSubmit} className="p-6 space-y-6">
                <div className="space-y-4">
                  {srcCommitteeForm.map((entry, index) => (
                    <div key={`src-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-center">
                      <select
                        value={entry.member}
                        onChange={(e) => handleSrcCommitteeChange(index, "member", e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select SRC Member</option>
                        {facultyOptions.map((faculty) => (
                          <option key={faculty._id} value={faculty._id}>
                            {`${faculty.firstName || ""} ${faculty.lastName || ""}`.trim()}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Designation / Position"
                        value={entry.designation}
                        onChange={(e) => handleSrcCommitteeChange(index, "designation", e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <CustomButton
                        type="button"
                        variant="danger"
                        onClick={() => removeSrcCommitteeRow(index)}
                      >
                        Remove
                      </CustomButton>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <CustomButton type="button" variant="secondary" onClick={addSrcCommitteeRow}>
                    Add Member
                  </CustomButton>
                  <div className="flex gap-4">
                    <CustomButton variant="secondary" onClick={resetSrcCommitteeModal}>
                      Cancel
                    </CustomButton>
                    <CustomButton type="submit" variant="primary">
                      Update
                    </CustomButton>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {previewTab === "publications" && (
          <ScholarsPublications id={researcher._id} />
        )}
        

        {previewTab === "semester" && (
          <ScholarsSemesters scholar={researcher} setRefresh={setRefresh} />
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
