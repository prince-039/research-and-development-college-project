import { useState } from "react";
import { Building, Mail, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FacultySection = () => {
  const [search, setSearch] = useState("");
  const navigate=useNavigate();

  const faculty = [
    {
      id: 1,
      name: "Deepak B. Phatak",
      designation: "Faculty Emeritus",
      email: "dbp",
      phone: "7747",
      office: "KR314, Kanwal Rekhi Building",
      research:
        "Database Management Systems, Software Engineering, Distributed Systems",
      img: "https://randomuser.me/api/portraits/men/1.jpg"
    },
    {
      id: 2,
      name: "Bharat G Adsul",
      designation: "Assistant Professor",
      email: "adsul",
      phone: "7712",
      office: "CC317, Computing Complex",
      research:
        "Formal methods in Concurrency, Logics and Games, Geometric Complexity",
      img: "https://randomuser.me/api/portraits/men/2.jpg"
    },
    {
      id: 3,
      name: "Arpit Agarwal",
      designation: "Assosiat Professor",
      email: "aarpit",
      phone: "7906",
      office: "KR222, Kanwal Rekhi Building",
      research:
        "Machine Learning, Human-AI Interaction, Responsible AI",
      img: "https://randomuser.me/api/portraits/men/3.jpg"
    }
  ];

  const filteredFaculty = faculty.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-6 md:px-16 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-semibold text-center mb-2">
        Faculty
      </h1>
      <p className="text-center text-gray-600 mb-6 text-sm">
        To contact a faculty member append @cse.nitjsr.ac.in to username
      </p>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search"
          className="w-full md:w-1/3 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {filteredFaculty.map((f) => (
          <div
            key={f.id}
            className="bg-white rounded-xl shadow-sm border p-5 flex gap-4 hover:shadow-md transition"
          >
            <img
              src={f.img}
              alt={f.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-semibold text-blue-700 hover:underline transition pb-1 cursor-pointer"
                onClick={()=>navigate('/faculty-details')}
                >
                {f.name}
              </h2>
              {f.designation && (
                <p className="text-red-500 text-sm">
                  ({f.designation})
                </p>
              )}

              <div className="text-sm text-gray-700 mt-2 space-y-1">
                <p><Mail className="inline-block" size={15} /> {f.email}</p>
                <p><Phone className="inline-block" size={15}/> {f.phone}</p>
                <p><Building className="inline-block" size={15}/> {f.office}</p>
              </div>

              <p className="text-sm text-gray-600 mt-2">
                {f.research}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FacultySection;