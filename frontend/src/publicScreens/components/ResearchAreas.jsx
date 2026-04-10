const staticResearchAreas = [
  {
    id: "static-area-1",
    title: "Algorithms and Theory",
    desc: "This group works on design and analysis of algorithms, combinatorial optimization, and computational geometry.",
    faculty: ["A Das", "P Bhowmick", "P Dey", "S Kolay"],
  },
  {
    id: "static-area-2",
    title: "Artificial Intelligence and Machine Learning",
    desc: "Focuses on AI, deep learning, NLP, and intelligent systems.",
    faculty: ["R Sharma", "A Singh"],
  },
  {
    id: "static-area-3",
    title: "Cyber Security",
    desc: "Research in cryptography, network security, and data protection.",
    faculty: ["S Kumar", "D Raj"],
  },
];

const researchAreas= ()=>{
    
  const researchAreas = useMemo(() => {
    const dynamicAreas = researchItems
      .filter((item) => item.type === "area")
      .map((item) => ({
        id: item._id,
        title: item.title,
        desc: item.description,
        faculty: item.faculty || [],
      }));

    return [...dynamicAreas];
  }, [researchItems]);

  return <>
    {activeTab === "areas" && (
      <div className="mx-auto max-w-5xl rounded border bg-white shadow">
        {researchAreas.map((area, index) => (
          <div key={area.id || index} className="border-b">
            <div
              className={`cursor-pointer p-4 font-semibold hover:bg-gray-200 ${
                openIndex === index ? "bg-gray-300" : "bg-gray-100"
              }`}
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              >
              {openIndex === index ? "▼" : "▶"} {area.title}
            </div>

            {openIndex === index && (
              <div className="p-4 text-sm text-gray-700">
                <p className="mb-4">{area.desc}</p>
                <div className="flex flex-wrap gap-4">
                  {area.faculty.map((facultyName, facultyIndex) => (
                    <div key={`${area.id}-${facultyIndex}`} className="text-center">
                      <div className="mb-1 h-16 w-16 rounded-full bg-gray-300" />
                      <p className="text-xs">{facultyName}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </>
}