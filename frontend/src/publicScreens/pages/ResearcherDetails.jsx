import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosWrapper from "../../utils/AxiosWrapper";
import {
  publicationCategories as publicationTabs,
  publicationFieldConfig,
} from "../../utils/researchPublicationConfig";

const staticScholarMap = {
  "static-scholar-1": {
    _id: "static-scholar-1",
    type: "scholar",
    name: "Nikhil Chandelkar",
    roll: "2023PHDCS001",
    department: "Computer Science and Engineering",
    email: "nikhil@xyz.edu",
    phone: "+91-9876543210",
    website: "",
    profileImage: "https://api.dicebear.com/7.x/adventurer/svg?seed=Nikhil",
    thesis: "AI-based Traffic Prediction System",
    year: "2024",
    guide: "Prof. Rajesh Sharma",
    semesterRegistration:
      "Semester registration is open for the current session. Please connect with the department office to complete the process.",
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
  },
};

const navTabs = [
  { key: "home", label: "Home" },
  { key: "profile", label: "Profile" },
  { key: "publications", label: "Publications" },
  { key: "semester", label: "Semester Registration" },
];

const ResearcherDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [scholar, setScholar] = useState(null);
  const [activeNav, setActiveNav] = useState("home");
  const [publicationTab, setPublicationTab] = useState("journal");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScholar = async () => {
      if (staticScholarMap[id]) {
        setScholar(staticScholarMap[id]);
        setLoading(false);
        return;
      }

      try {
        const response = await axiosWrapper.get(`/research/${id}`);
        if (response.data.success) {
          setScholar(response.data.data);
        } else {
          setScholar(null);
        }
      } catch (error) {
        setScholar(null);
      } finally {
        setLoading(false);
      }
    };

    loadScholar();
  }, [id]);

  const visiblePublications = useMemo(
    () =>
      (scholar?.publications || []).filter(
        (publication) => publication.category === publicationTab
      ),
    [scholar, publicationTab]
  );

  const renderProfileCard = () => (
    <div className="max-w-5xl mx-auto mt-6 bg-white shadow p-6">
      <div className="flex flex-col md:flex-row gap-6 bg-orange-500 p-6 rounded">
        <img
          src={
            scholar?.profileImage ||
            `https://api.dicebear.com/7.x/adventurer/svg?seed=${scholar?.name || "Scholar"}`
          }
          alt={scholar?.name}
          className="w-40 h-40 object-cover rounded bg-white"
        />
        <div className="text-white">
          <h2 className="text-2xl font-bold">{scholar?.name}</h2>

          <p className="mt-2">{scholar?.roll}</p>
          <p>{scholar?.department}</p>

          <div className="mt-3 text-sm space-y-1">
            {scholar?.phone && <p>Phone: {scholar.phone}</p>}
            {scholar?.email && <p>Email: {scholar.email}</p>}
            {scholar?.website && (
              <p>
                Website:{" "}
                <a
                  href={scholar.website.startsWith("http")
                    ? scholar.website
                    : `https://${scholar.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {scholar.website}
                </a>
              </p>
            )}
            {scholar?.guide && <p>Guide: {scholar.guide}</p>}
            {scholar?.thesis && <p>Research: {scholar.thesis}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPublications = () => (
    <div className="px-5 py-6">
      <div className="flex flex-wrap gap-4">
        {publicationTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setPublicationTab(tab.key)}
            className={`rounded-xl px-6 py-3 font-medium ${
              publicationTab === tab.key
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 shadow-sm"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-700">
              <th className="px-4 py-4">S.No.</th>
              {publicationFieldConfig[publicationTab].columns.map(([field, label]) => (
                <th key={field} className="px-4 py-4">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visiblePublications.length === 0 ? (
              <tr>
                <td
                  colSpan={publicationFieldConfig[publicationTab].columns.length + 1}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No publications added in this category yet.
                </td>
              </tr>
            ) : (
              visiblePublications.map((publication, index) => (
                <tr key={`${publication.category}-${index}`} className="border-t">
                  <td className="px-4 py-4">{index + 1}</td>
                  {publicationFieldConfig[publicationTab].columns.map(([field]) => (
                    <td key={field} className="px-4 py-4">
                      {field === "link"
                        ? publication.link ? (
                            <a
                              href={publication.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 underline"
                            >
                              View
                            </a>
                          ) : (
                            "NA"
                          )
                        : publication[field] || "NA"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        Loading researcher details...
      </div>
    );
  }

  if (!scholar) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        Researcher not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 mb-8">
      <div className="bg-orange-300 py-6 text-center">
        <h1 className="text-4xl font-bold tracking-widest text-white">
          {scholar.name}
        </h1>
      </div>

      <div className="bg-orange-700 text-white px-4 py-3 flex flex-wrap justify-evenly gap-4">
        {navTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className="cursor-pointer hover:underline"
            onClick={() => {
              if (tab.key === "home") {
                navigate("/researchers");
                return;
              }
              setActiveNav(tab.key);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {(activeNav === "home" || activeNav === "profile") && renderProfileCard()}
      {activeNav === "publications" && renderPublications()}
      {activeNav === "semester" && (
        <div className="max-w-5xl mx-auto mt-6 bg-white shadow p-8">
          <h2 className="text-2xl font-semibold text-orange-600 mb-4">
            Semester Registration
          </h2>
          <p className="text-gray-700 leading-7">
            {scholar.semesterRegistration ||
              "Semester registration details have not been added yet."}
          </p>
        </div>
      )}
    </div>
  );
};

export default ResearcherDetails;
