import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosWrapper from "../../utils/AxiosWrapper";

const FacultyDetail = () => {
  const facultyStatic = {
    firstName: "Dr. Deepak B. Phatak",
    designation: "Professor",
    department: "Department of CSE, NIT Jamshedpur",
    email: "dbp@nitjsr.ac.in",
    phone: "+91-22-25767747",
    office: "Kanwal Rekhi Building",
    website: "www.cse.nitjsr.ac.in/~dbp",
    img: "https://randomuser.me/api/portraits/men/10.jpg",
    bio: `Born on 2nd April 1948, Professor Phatak obtained his Bachelor's degree in Electrical Engineering...
    
He has guided several PhD and MTech students and authored multiple research papers. His work focuses on software engineering, distributed systems, and IT-enabled education.

He has contributed to national-level projects and innovation initiatives in India.`
  };
  const navigate=useNavigate();
  const [faculty, setFaculty]=useState(null);
  const {id, type}=useParams()

  useEffect(() => {
    const loadBio = async () => {
      try {
        const response = await axiosWrapper.get(type ? `/research/${id}` : `/faculty/my-bio/${id}`);
        console.log(response.data)
        if (response.data.success) {
          setFaculty(response.data.data);
        }
      } catch (error) {
        setFaculty([]);
      }
    };

    loadBio();
  }, []);
console.log(faculty)
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-orange-300 py-6 text-center">
        <h1 className="text-4xl font-bold tracking-widest text-white">
          {faculty?.firstName +" " + faculty?.lastName}
        </h1>
      </div>

      <div className="bg-red-500 text-white px-10 py-2">
        <span className="cursor-pointer hover:underline"
            onClick={()=>navigate(-1)}
            >Home
        </span>
      </div>

      {/* Profile Section */}
      <div className="max-w-5xl mx-auto mt-6 bg-white shadow p-6">
        <div className="flex flex-col md:flex-row gap-6 bg-orange-500 p-6 rounded">
          <img
            src={`http://localhost:8080/media/${faculty?.profile}` || `https://api.dicebear.com/7.x/avataaars/svg?seed=${faculty?.firstName}`}
            alt={faculty?.firstName}
            className="w-40 h-40 object-cover rounded"
          />
          <div className="text-white">
            <h2 className="text-2xl font-bold">
              {faculty?.firstName +" " + faculty?.lastName}
            </h2>

            <p className="mt-2">{faculty?.designation}</p>
            <p>{faculty?.department}</p>

            <div className="mt-3 text-sm space-y-1">
              <p>📞 {faculty?.phone}</p>
              <p>📧 {faculty?.email}</p>
              <p>🏢 {faculty?.office}</p>
              <p>
                🌐{" "}
                <a
                  href={`https://${faculty?.website}`}
                  className="underline"
                >
                  {faculty?.website}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="max-w-5xl mx-auto mt-6 bg-white shadow p-6">
        <h2 className="text-xl font-semibold mb-4 tracking-wide">
          {faculty?.firstName +" " + faculty?.lastName}
        </h2>

        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {faculty?.bio}
        </p>
      </div>

    </div>
  );
};

export default FacultyDetail;