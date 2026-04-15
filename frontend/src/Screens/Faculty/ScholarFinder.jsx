import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Heading from "../../components/Heading";
import axiosWrapper from "../../utils/AxiosWrapper";
import CustomButton from "../../components/CustomButton";
import NoData from "../../components/NoData";
import ResearchDetail from "../Admin/ResearchDetail";

const ScholarFinder = () => {
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
            student.enrollmentNo
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

  return (
    <div className="w-full mx-auto mt-10 flex justify-center items-start flex-col mb-10">
      <div className="flex justify-between items-center w-full">
        <Heading title="Scholar Finder" />
      </div>

      <div className="my-6 mx-auto w-full">
        <form onSubmit={searchStudents} className="flex items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-[90%] mx-auto">
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
                <option value="">Select Branch</option>
                <option value="Regular">Regular</option>
                <option value="Regular">Part-Time</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-center w-[10%] mx-auto">
            <CustomButton
              type="submit"
              disabled={dataLoading}
              variant="primary"
            >
              {dataLoading ? "Searching..." : "Search"}
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
                          src={`${process.env.REACT_APP_MEDIA_LINK}/${student.profile}`}
                          alt={`${student.firstName}'s profile`}
                          className="w-12 h-12 object-cover rounded-full"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1744315900478-fa44dc6a4e89?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
                          }}
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
      </div>
    </div>
  );
};

export default ScholarFinder;
