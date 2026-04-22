import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Heading from "../../components/Heading";
import axiosWrapper from "../../utils/AxiosWrapper";
import CustomButton from "../../components/CustomButton";
import NoData from "../../components/NoData";
import ResearchDetail from "../Admin/ResearchDetail";
import { IoMdClose } from "react-icons/io";

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
  association: "",
  supervisor: ""
}

const ScholarFinder = ({activeTab}) => {
  const token=localStorage.getItem("userToken");
  const [searchParams, setSearchParams] = useState({
    enrollmentNo: "",
    name: "",
    type: "",
  });
  const [scholars, setscholars] = useState([]);
  const [allScholars, setAllScholars] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedScholar, setSelectedScholar] = useState({});
  const [showModal, setShowModal] = useState(false);
  const userToken = localStorage.getItem("userToken");
  const [hasSearched, setHasSearched] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [scholarForm, setScholarForm] = useState(initialScholarForm);

  useEffect(() => {
    const fetchScholars = async () => {
      try {
        toast.loading("Loading scholars...");
        const response = await axiosWrapper.get("/scholar/finder", {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        if (response.data.success) {
          setAllScholars(response.data.data);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          setAllScholars([]);
        } else {
          toast.error(
            error.response?.data?.message || "Failed to load branches"
          );
        }
      } finally {
        toast.dismiss();
      }
    };
    fetchScholars();
  }, [userToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const searchStudents = async (e) => {
    e.preventDefault();
    setDataLoading(true);
    setHasSearched(true);
    toast.loading("Searching scholars...");
    setscholars([]);
    const filtered = allScholars.filter((student) => {
        return (
        (searchParams.enrollmentNo === "" ||
            student.rollNo
            .toLowerCase()
            .includes(searchParams.enrollmentNo.toLowerCase())) &&

        (searchParams.name === "" ||
            `${student.firstName} ${student.lastName}`
            .toLowerCase()
            .includes(searchParams.name.toLowerCase())) &&

        (searchParams.type === "" ||
            student.type === searchParams.type)
        );
    });
    toast.dismiss();
    if (filtered.length === 0) {
        toast.error("No scholars found!");
        setscholars([]);
    } else {
        toast.success("Scholars found!");
        setscholars(filtered);
    }
    setDataLoading(false);
  };

  const handleRowClick = (student) => {
    setSelectedScholar(student);
    setShowModal(true);
  };

  const handleScholarChange = (field, value) => {
    setScholarForm((prev) => ({ ...prev, [field]: value }));
  };

  const addHandleSubmit = async(e)=>{
    e.preventDefault();
    try {
      toast.loading("Adding researcher");
      const response = await axiosWrapper.post("/scholar/by-faculty",
        scholarForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.dismiss();
      if (response.data.success) {
        toast.success(response.data.message);
        setShowAddModal(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Failed to save researcher");
    }
  }

  return (
    <div className="w-full mx-auto flex justify-center items-start flex-col mb-10">
      <div className="my-6 mx-auto w-full">
        <form onSubmit={searchStudents} className="grid grid-cols-[75%_25%] mx-auto ml-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enrollment Number
              </label>
              <input
                type="text"
                name="enrollmentNo"
                value={searchParams.enrollmentNo}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter enrollment number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={searchParams.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter student name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                name="type"
                value={searchParams.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">--Select--</option>
                <option value="Regular">Regular</option>
                <option value="Part-Time">Part-Time</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-between ml-4">
            <CustomButton
              type="submit"
              disabled={dataLoading}
              variant="primary"
            >
              {dataLoading ? "Searching..." : "Search"}
            </CustomButton>
            <CustomButton
              onClick={()=>setShowAddModal(true)}
              variant="primary"
            >
              Add Scholar
            </CustomButton>
          </div>
        </form>

        {!hasSearched && (
          <div className="text-center mt-8 text-gray-600 flex flex-col items-center justify-center my-10 bg-white p-10 rounded-lg mx-auto w-[40%]">
            <img
              src="/assets/filter.svg"
              alt="Select filters"
              className="w-64 h-64 mb-4"
            />
            Please select at least one filter to search scholars
          </div>
        )}

        {hasSearched && scholars.length === 0 && (
          <NoData title="No scholars found" />
        )}

        {scholars.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Search Results</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-3 border-b text-left">Profile</th>
                    <th className="px-6 py-3 border-b text-left">Name</th>
                    <th className="px-6 py-3 border-b text-left">Enrollment No</th>
                    <th className="px-6 py-3 border-b text-left">Semester</th>
                    <th className="px-6 py-3 border-b text-left">Email</th>
                    <th className="px-6 py-3 border-b text-left">Associated</th>
                  </tr>
                </thead>
                <tbody>
                  {scholars.map((student) => (
                    <tr
                      key={student._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRowClick(student)}
                    >
                      <td className="px-6 py-4 border-b">
                        <img
                          src={student.profile ? `${process.env.REACT_APP_MEDIA_LINK}/${student.profile}` : "user.png"}
                          alt={`${student.firstName}'s profile`}
                          className="w-12 h-12 object-cover rounded-full"
                        />
                      </td>
                      <td className="px-6 py-4 border-b">
                        {student.firstName}{" "}
                        {student.lastName}
                      </td>
                      <td className="px-6 py-4 border-b">{student.rollNo}</td>
                      <td className="px-6 py-4 border-b">{student.semesters.length}</td>
                      <td className="px-6 py-4 border-b">{student.email}</td>
                      <td className="px-6 py-4 border-b">{student.relation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showModal && selectedScholar && (
          <div className="fixed inset-0 bg-black bg-opacity-50  p-4 z-50 overflow-y-auto">
            <CustomButton className="fixed top-6 right-6"
                onClick={() => setShowModal(false)}
                variant="secondary"
                >
                    <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </CustomButton>
            <ResearchDetail id={selectedScholar._id} />
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg w-[90%] max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold">
                  Add Researcher
                </h2>
                <button onClick={()=>setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                  <IoMdClose className="text-3xl" />
                </button>
              </div>

              <form onSubmit={addHandleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Scholar First Name" value={scholarForm?.firstName} onChange={(e) => handleScholarChange("firstName", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required/>
                  <input type="text" placeholder="Scholar Last Name" value={scholarForm?.lastName} onChange={(e) => handleScholarChange("lastName", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" placeholder="Registration number" value={scholarForm.rollNo} onChange={(e) => handleScholarChange("rollNo", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required/>
                  <input type="text" placeholder="Department" value={scholarForm.department} onChange={(e) => handleScholarChange("department", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <select value={scholarForm.type} onChange={(e) => handleScholarChange("type", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Regular">Regular</option>
                    <option value="Part-Time">Part-Time</option>
                  </select>
                  <input type="date" placeholder="Enrollment Date" value={scholarForm.enrollmentDate} onChange={(e) => handleScholarChange("enrollmentDate", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required/>
                  <input type="email" placeholder="Email" value={scholarForm.email} onChange={(e) => handleScholarChange("email", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required/>
                  <select value={scholarForm.association} onChange={(e) => handleScholarChange("association", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="" disabled>Assosiated As</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="coSupervisor">Co-Supervisor</option>
                  </select>
                  <input type="text" placeholder="Phone" value={scholarForm.phone} onChange={(e) => handleScholarChange("phone", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required/>
                  {scholarForm.association==="coSupervisor" && <input type="email" placeholder="Supervisor Email" value={scholarForm.supervisor} onChange={(e) => handleScholarChange("supervisor", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required/>}
                  <input type="file" placeholder="Profile image" value={scholarForm.profile} onChange={(e) => handleScholarChange("profile", e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <CustomButton variant="secondary" onClick={()=>setShowAddModal(false)}>
                    Cancel
                  </CustomButton>
                  <CustomButton type="submit" variant="primary">
                    Add
                  </CustomButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScholarFinder;
