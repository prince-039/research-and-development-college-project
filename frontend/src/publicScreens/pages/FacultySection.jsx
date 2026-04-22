import { useEffect, useMemo, useState } from "react";
import { Building, Mail, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosWrapper from "../../utils/AxiosWrapper";
import { baseApiURL } from "../../baseUrl";

const FacultySection = () => {
  const [search, setSearch] = useState("");
  const [dynamicFaculty, setDynamicFaculty] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFaculty = async () => {
      try {
        const response = await axiosWrapper.get("/faculty/public");
        if (response.data.success) {
          // console.log(response.data.data)
          setDynamicFaculty(response.data.data);
        }
      } catch (error) {
        setDynamicFaculty([]);
      }
    };

    loadFaculty();
  }, []);

  const mediaBaseUrl = baseApiURL().replace(/\/api$/, "");

  const faculty = useMemo(() => {
    const mappedDynamicFaculty = dynamicFaculty.map((item) => ({
      id: item._id,
      name: `${item.firstName || ""} ${item.lastName || ""}`.trim(),
      designation: item.designation || "Faculty Member",
      email: item.email ? item.email.replace("@cse.nitjsr.ac.in", "") : "",
      phone: item.phone || "",
      office: [item.address, item.city, item.state].filter(Boolean).join(", "),
      research: item.branchId?.name
        ? `Branch: ${item.branchId.name}`
        : "Faculty details added from admin panel.",
      profile: item.profile,
    }));

    return [...mappedDynamicFaculty];
  }, [dynamicFaculty, mediaBaseUrl]);

  const filteredFaculty = faculty.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 md:px-16">
      <h1 className="mb-2 text-center text-3xl font-semibold">Faculty</h1>
      <p className="mb-6 text-center text-sm text-gray-600">
        To contact a faculty member append @cse.nitjsr.ac.in to username
      </p>

      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search"
          className="w-full rounded-full border px-4 py-2 outline-none focus:ring-1 focus:ring-orange-400 md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredFaculty.length===0 && <p className="text-center text-lg">No records found!</p> }
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredFaculty.map((facultyItem) => (
          <div
            key={facultyItem.id}
            className="flex gap-4 rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <img
              src={facultyItem.profile ? `${process.env.REACT_APP_MEDIA_LINK}/${facultyItem.profile}` : "user.png"}
              alt={facultyItem.name}
              className="h-20 w-20 rounded-full object-cover"
            />
            <div>
              <h2
                className="cursor-pointer pb-1 text-xl font-semibold text-blue-700 transition hover:underline"
                onClick={() => navigate(`/faculty-details/${facultyItem.id}`)}
              >
                {facultyItem.name}
              </h2>
              {facultyItem.designation && (
                <p className="text-sm text-red-500">({facultyItem.designation})</p>
              )}

              <div className="mt-2 space-y-1 text-sm text-gray-700">
                <p>
                  <Mail className="inline-block" size={15} /> {facultyItem.email}
                </p>
                <p>
                  <Phone className="inline-block" size={15} /> {facultyItem.phone || "-"}
                </p>
                <p>
                  <Building className="inline-block" size={15} /> {facultyItem.address || "-"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FacultySection;
