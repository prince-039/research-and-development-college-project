import { useEffect, useMemo, useState } from "react";
import axiosWrapper from "../../utils/AxiosWrapper";
import { useNavigate } from "react-router-dom";
import { BookOpenText, Building, Mail, Phone } from "lucide-react";

const Research = () => {
  const [activeTab, setActiveTab] = useState("Regular");
  const [openIndex, setOpenIndex] = useState(-1);
  const [search, setSearch] = useState("");
  const [scholars, setScholars] = useState([]);
  const navigate=useNavigate();

  useEffect(() => {
    const loadScholars = async () => {
      try {
        const response = await axiosWrapper.get("/scholar");
        if (response.data.success) {
          // console.log(response.data)
          setScholars(response.data.data) ;
        }
      } catch (error) {
        setScholars([]);
      }
    };

    loadScholars();
  }, []);


  const filteredScholars = scholars.filter((scholar) =>{
    let name=scholar.firstName + scholar.lastName;
    return name.toLowerCase().includes(search.toLowerCase())
  });

  const researchScholars = useMemo(
    () =>
      filteredScholars.filter(
        (item) => item.type === activeTab
      ),
    [activeTab, filteredScholars]
  );

  return (
    <div className="bg-gray-100 px-10 py-4">
      <h2 className="text-center text-3xl font-semibold py-2 ">Our Research Scholars</h2>
      <div className="flex gap-2 justify-center mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-full focus:outline-none focus:ring-1 focus:ring-orange-400"
        />
      </div>
      <div className="mb-6 flex justify-center gap-6 text-2xl font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("Regular")}
          className={
            activeTab === "Regular"
              ? "font-semibold text-orange-400 underline"
              : ""
          }
        >
          Regular
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("Part-Time")}
          className={
            activeTab === "Part-Time"
              ? "font-semibold text-orange-400 underline"
              : ""
          }
        >
          Part-Time
        </button>
      </div>

      {activeTab && (
        <div className="mx-auto rounded bg-gray-50 p-4 shadow">
          {researchScholars.length===0 && <p className="text-center text-lg">No records found!</p> }
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {researchScholars.map((researcher) => (
            <div
              key={researcher._id}
              className="flex gap-4 rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <img
                src={process.env.REACT_APP_MEDIA_LINK/researcher?.profile || "user.png"}
                alt={researcher.name}
                className="h-20 w-20 rounded-full object-cover"
              />
              <div>
                <h2
                  className="cursor-pointer pb-1 text-xl font-semibold text-blue-700 transition hover:underline"
                  onClick={() => navigate(`/researcher-details/${researcher._id}`)}
                >
                  {researcher.firstName +" "+ researcher.lastName}
                </h2>
                {researcher.rollNo && (
                  <p className="text-sm text-red-500">({researcher.rollNo})</p>
                )}

                <div className="mt-2 space-y-1 text-sm text-gray-700">
                  <p>
                    <BookOpenText className="inline-block" size={15} /> {researcher.seminar?.topic || "NA"}
                  </p>
                  <p>
                    <Mail className="inline-block" size={15} /> {researcher.email}
                  </p>
                  <p>
                    <Phone className="inline-block" size={15} /> {researcher.phone || "-"}
                  </p>
                </div>

                {/* <p className="mt-2 text-sm text-gray-600">{researcher.research}</p> */}
              </div>
            </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Research;
