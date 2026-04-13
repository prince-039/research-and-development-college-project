import { useEffect, useMemo, useState } from "react";
import axiosWrapper from "../../utils/AxiosWrapper";
import { useNavigate } from "react-router-dom";
import { BookOpenText, Mail, Phone } from "lucide-react";

const staticScholars = [
  {
    id: "static-scholar-1",
    name: "Nikhil Chandelkar",
    roll: "2023PHDCS001",
    thesis: "AI-based Traffic Prediction System",
    year: "2024",
    guide: "Prof. Rajesh Sharma",
    programType: "regular",
    department: "Computer Science and Engineering",
    email: "nikhil@xyz.edu",
    phone: "+91-9876543210",
    profileImage: "https://api.dicebear.com/7.x/adventurer/svg?seed=Nikhil",
    publications: [
      {
        category: "journal",
        title: "AI Paper",
        publicationName: "Nikhil",
        publicationType: "SCI",
        impactFactor: "NA",
        status: "Published",
        dateOfCommunication: "2024-01-10",
        isbn: "111-222",
        volumeNumber: "10",
        articleNumber: "A1",
        publishYear: "2024",
        link: "https://example.com",
      },
      {
        category: "journal",
        title: "ML Study",
        publicationName: "Nikhil",
        publicationType: "Scopus",
        impactFactor: "3.1",
        status: "Communicated",
        dateOfCommunication: "2024-02-10",
        isbn: "NA",
        volumeNumber: "NA",
        articleNumber: "NA",
        publishYear: "NA",
        link: "",
      },
    ],
    semesterRegistration: "Semester registration for 2026 is active. Please contact the department office for approval.",
  },
];

const Research = () => {
  const [activeTab, setActiveTab] = useState("regular");
  const [researchItems, setResearchItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadResearch = async () => {
      try {
        const response = await axiosWrapper.get("/research");
        if (response.data.success) {
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
        department: item.department,
        email: item.email,
        phone: item.phone,
        programType: item.programType || "regular",
        profileImage: item.profileImage,
        publications: item.publications || [],
        semesterRegistration: item.semesterRegistration || "",
      }));

    return [...dynamicScholars, ...staticScholars];
  }, [researchItems]);

  const filteredScholars = scholars.filter(
    (scholar) => (scholar.programType || "regular") === activeTab
  );

  return (
    <div className="bg-gray-100 px-6 py-8 md:px-10">
      <h2 className="text-center text-3xl font-semibold py-4 mb-2">
        Our Research Scholars
      </h2>
      <div className="mb-8 flex justify-center gap-4 text-base font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("regular")}
          className={`rounded-xl px-5 py-2 ${
            activeTab === "regular"
              ? "bg-orange-500 text-white"
              : "bg-white text-gray-700"
          }`}
        >
          Regular
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("partTime")}
          className={`rounded-xl px-5 py-2 ${
            activeTab === "partTime"
              ? "bg-orange-500 text-white"
              : "bg-white text-gray-700"
          }`}
        >
          Part-Time
        </button>
      </div>

      <div className="mx-auto max-w-6xl rounded bg-white p-4 shadow">
        <div className="grid gap-6 md:grid-cols-2">
          {filteredScholars.length === 0 ? (
            <div className="col-span-full rounded-lg bg-gray-50 p-8 text-center text-gray-500">
              No researchers found in this section.
            </div>
          ) : (
            filteredScholars.map((researcher) => (
              <div
                key={researcher.id}
                className="flex gap-4 rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <img
                  src={
                    researcher.profileImage ||
                    `https://api.dicebear.com/7.x/adventurer/svg?seed=${researcher.name}`
                  }
                  alt={researcher.name}
                  className="h-20 w-20 rounded-full object-cover bg-gray-100"
                />
                <div>
                  <h2
                    className="cursor-pointer pb-1 text-xl font-semibold text-blue-700 transition hover:underline"
                    onClick={() =>
                      navigate(`/researcher-details/phd/${researcher.id}`)
                    }
                  >
                    {researcher.name}
                  </h2>
                  {researcher.roll && (
                    <p className="text-sm text-red-500">({researcher.roll})</p>
                  )}

                  <div className="mt-2 space-y-1 text-sm text-gray-700">
                    <p>
                      <BookOpenText className="inline-block mr-1" size={15} />
                      {researcher.thesis}
                    </p>
                    {researcher.email && (
                      <p>
                        <Mail className="inline-block mr-1" size={15} />
                        {researcher.email}
                      </p>
                    )}
                    {researcher.phone && (
                      <p>
                        <Phone className="inline-block mr-1" size={15} />
                        {researcher.phone}
                      </p>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-gray-600">
                    Guide: {researcher.guide}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Research;
