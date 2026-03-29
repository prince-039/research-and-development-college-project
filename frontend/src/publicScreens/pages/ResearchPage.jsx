import { useState } from "react";

const Research = () => {
  const [activeTab, setActiveTab] = useState("areas");
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState("");

  // 🔹 Research Areas Data
  const researchAreas = [
    {
      title: "Algorithms and Theory",
      desc: "This group works on design and analysis of algorithms, combinatorial optimization, and computational geometry.",
      faculty: ["A Das", "P Bhowmick", "P Dey", "S Kolay"]
    },
    {
      title: "Artificial Intelligence and Machine Learning",
      desc: "Focuses on AI, deep learning, NLP, and intelligent systems.",
      faculty: ["R Sharma", "A Singh"]
    },
    {
      title: "Cyber Security",
      desc: "Research in cryptography, network security, and data protection.",
      faculty: ["S Kumar", "D Raj"]
    }
  ];

  // 🔹 Scholars Data
  const scholars = [
    {
      name: "Ankur Priyadarshini",
      roll: "PHD/CS/10054/2017",
      thesis: "POS Tagger & Named Entity Recognition",
      year: "2021",
      guide: "Dr. S. K. Saha"
    },
    {
      name: "D.R.D. Adhikari",
      roll: "Ph.D/CS/10002/2012",
      thesis: "Wireless Sensor Networks Optimization",
      year: "2019",
      guide: "Dr. D. K. Mallick"
    },
    {
      name: "Dipti Kumari",
      roll: "Ph.D/CS/10004/2012",
      thesis: "Software Fault Prediction Models",
      year: "2019",
      guide: "Dr. K. Rajnish"
    }
  ];

  // 🔍 Filter
  const filteredScholars = scholars.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className=" bg-gray-100 py-6 px-10">
      {/* Tabs */}
      <div className="flex gap-6 text-2xl font-medium mb-6 justify-center">
        <button
          onClick={() => setActiveTab("areas")}
          className={activeTab === "areas" ? "underline font-semibold text-orange-400" : ""}
        >
          Research Areas
        </button>

        <button
          onClick={() => setActiveTab("scholars")}
          className={activeTab === "scholars" ? "underline font-semibold text-orange-400" : ""}
        >
          Our Research Scholars
        </button>
      </div>

      {/*  RESEARCH AREAS  */}
      {activeTab === "areas" && (
        <div className="max-w-5xl mx-auto bg-white border rounded shadow">

          {researchAreas.map((area, index) => (
            <div key={index} className="border-b">

              {/* Header */}
              <div
                className={`p-4 cursor-pointer hover:bg-gray-200 font-semibold ${openIndex===index ? 'bg-gray-300' : 'bg-gray-100'}`}
                onClick={() =>
                  setOpenIndex(openIndex === index ? -1 : index)
                }
              >
                {openIndex===index ? "▼" : "▶"} {area.title}
              </div>

              {/* Content */}
              {openIndex === index && (
                <div className="p-4 text-sm text-gray-700">
                  <p className="mb-4">{area.desc}</p>

                  {/* Faculty */}
                  <div className="flex gap-4 flex-wrap">
                    {area.faculty.map((f, i) => (
                      <div
                        key={i}
                        className="text-center"
                      >
                        <div className="w-16 h-16 bg-gray-300 rounded-full mb-1"></div>
                        <p className="text-xs">{f}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

        </div>
      )}

      {/* SCHOLARS TABLE */}
      {activeTab === "scholars" && (
        <div className="max-w-6xl mx-auto bg-white p-4 rounded shadow">

          {/* Search */}
          <div className="flex justify-end mb-4">
            <input
              type="text"
              placeholder="Search..."
              className="border px-3 py-1 rounded"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border text-sm">

              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Roll</th>
                  <th className="p-2 border">Thesis Title</th>
                  <th className="p-2 border">Year</th>
                  <th className="p-2 border">Guide</th>
                </tr>
              </thead>

              <tbody>
                {filteredScholars.map((s, i) => (
                  <tr key={i} className="hover:bg-gray-200">
                    <td className="p-2 border">{s.name}</td>
                    <td className="p-2 border">{s.roll}</td>
                    <td className="p-2 border">{s.thesis}</td>
                    <td className="p-2 border">{s.year}</td>
                    <td className="p-2 border">{s.guide}</td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        </div>
      )}

    </div>
  );
};

export default Research;