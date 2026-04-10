import { useEffect, useMemo, useState } from "react";
import axiosWrapper from "../../utils/AxiosWrapper";
import { useNavigate } from "react-router-dom";
import { BookOpenText, Building, Mail, Phone } from "lucide-react";

const staticScholars = [
  {
    id: "static-scholar-1",
    name: "Ankur Priyadarshini",
    roll: "PHD/CS/10054/2017",
    thesis: "POS Tagger & Named Entity Recognition",
    year: "2021",
    guide: "Dr. S. K. Saha",
  },
  {
    id: "static-scholar-2",
    name: "D.R.D. Adhikari",
    roll: "Ph.D/CS/10002/2012",
    thesis: "Wireless Sensor Networks Optimization",
    year: "2019",
    guide: "Dr. D. K. Mallick",
  },
  {
    id: "static-scholar-3",
    name: "Dipti Kumari",
    roll: "Ph.D/CS/10004/2012",
    thesis: "Software Fault Prediction Models",
    year: "2019",
    guide: "Dr. K. Rajnish",
  },
];

const Research = () => {
  const [activeTab, setActiveTab] = useState("scholars");
  const [openIndex, setOpenIndex] = useState(-1);
  const [search, setSearch] = useState("");
  const [researchItems, setResearchItems] = useState([]);
  const navigate=useNavigate();

  useEffect(() => {
    const loadResearch = async () => {
      try {
        const response = await axiosWrapper.get("/research");
        if (response.data.success) {
          console.log(response.data)
          setResearchItems(response.data.data);
        }
      } catch (error) {
        setResearchItems([]);
      }
    };

    loadResearch();
  }, []);



  const scholars = useMemo(() => {
    const dynamicScholars = researchItems
      .filter((item) => item.type === "scholar")
      .map((item) => ({
        id: item._id,
        name: item.name,
        roll: item.roll,
        thesis: item.thesis,
        year: item.year,
        guide: item.guide,
      }));

    return [...dynamicScholars, ...staticScholars];
  }, [researchItems]);

  const filteredScholars = scholars.filter((scholar) =>
    scholar.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gray-100 px-10 py-4">
      <h2 className="text-center text-3xl font-semibold py-4 mb-2">Our Research Scholars</h2>
      <div className="mb-6 flex justify-center gap-6 text-2xl font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("scholars")}
          className={
            activeTab === "scholars"
              ? "font-semibold text-orange-400 underline"
              : ""
          }
        >
          Regular
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("partTime")}
          className={
            activeTab === "partTime"
              ? "font-semibold text-orange-400 underline"
              : ""
          }
        >
          Part-Time
        </button>
      </div>

      {activeTab === "scholars" && (
        <div className="mx-auto max-w-6xl rounded bg-white p-4 shadow">
          <div className="grid gap-6 md:grid-cols-2">
            {filteredScholars.map((researcher) => (
          <div
            key={researcher.id}
            className="flex gap-4 rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <img
              src={researcher.img || `https://api.dicebear.com/7.x/avataaars/svg?seed=${researcher.name}`}
              alt={researcher.name}
              className="h-20 w-20 rounded-full object-cover"
            />
            <div>
              <h2
                className="cursor-pointer pb-1 text-xl font-semibold text-blue-700 transition hover:underline"
                onClick={() => navigate(`/researcher-details/phd/${researcher.id}`)}
              >
                {researcher.name}
              </h2>
              {researcher.roll && (
                <p className="text-sm text-red-500">({researcher.roll})</p>
              )}

              <div className="mt-2 space-y-1 text-sm text-gray-700">
                <p>
                  <BookOpenText className="inline-block" size={15} /> {researcher.thesis}
                </p>
                <p>
                  <Mail className="inline-block" size={15} /> {researcher.email}
                </p>
                <p>
                  <Phone className="inline-block" size={15} /> {researcher.phone}
                </p>
              </div>

              <p className="mt-2 text-sm text-gray-600">{researcher.research}</p>
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
