
const AcademicSection = () => {
  const programs = [
    {
      id: 1,
      title: "B.Tech.",
      desc: "The B.Tech. programme follows a flexible curriculum covering core computer science and systems.",
      bg: "bg-blue-100"
    },
    {
      id: 2,
      title: "M.Tech.",
      desc: "M.Tech combines coursework with research and offers flexibility for academic growth.",
      bg: "bg-gray-100"
    },
    {
    id: 3,
    title: "MCA",
    desc: "The Master of Computer Applications (MCA) programme focuses on advanced concepts in computer science, software development, and application design. It prepares students for careers in software engineering, system management, and IT industry roles.",
    bg: "bg-gray-100"
    },
    {
      id: 4,
      title: "Ph.D.",
      desc: "The Ph.D. programme focuses on original research leading to publications in top conferences.",
      bg: "bg-blue-100"
    }
  ];


  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="relative h-80">
        <img
          src="https://images.unsplash.com/photo-1509062522246-3755977927d7"
          alt="banner"
          className="w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-blue-900/60 flex items-center justify-center">
          <h1 className="text-white text-3xl md:text-4xl font-semibold">
            Academic Programmes
          </h1>
        </div>
      </div>

      {/* Description */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <p className="text-gray-700 leading-relaxed">
          The CSE department offers B.Tech., MCA, Dual Degree, M.Tech., M.S., and Ph.D. programmes in computer science and engineering.
          B.Tech. is undergraduate, while MCA M.Tech., M.S., and Ph.D. are postgraduate programmes.
          Dual-degree combines both B.Tech. and M.Tech. degrees.
        </p>
      </div>

      {/* Program Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-10 grid md:grid-cols-2 gap-6">
        {programs.map((prog) => (
          <div
            key={prog.id}
            className={`${prog.bg} p-6 rounded-xl shadow-sm hover:shadow-md transition`}
          >
            <h2 className="text-xl font-semibold text-blue-700 mb-3">
              {prog.title}
            </h2>

            <p className="text-gray-700 text-sm mb-6">
              {prog.desc}
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button className="bg-white px-4 py-2 rounded shadow text-sm hover:bg-gray-100">
                Know more
              </button>

              <button className="bg-white px-4 py-2 rounded shadow text-sm hover:bg-gray-100">
                Admission Details
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AcademicSection;