import { Milestone } from "lucide-react";

const LatestNews = () => {
  const news = [
    {
      id: 1,
      title: "Research paper published in IEEE Conference",
      date: "March 2026"
    },
    {
      id: 2,
      title: "AI Lab inaugurated in CSE Department",
      date: "February 2026"
    },
    {
      id: 3,
      title: "Students secured top rank in Hackathon",
      date: "January 2026"
    },
    {
      id: 4,
      title: "New Blockchain course introduced",
      date: "December 2025"
    }
  ];

  return (
    <div className="w-full md:w-70 bg-slate-100 border-r p-4 m-4 rounded-lg shadow-sm">
      <h3 className="font-semibold mb-4 text-lg text-gray-800">
        Latest News
      </h3>
      <div className="space-y-2">
        {news.map((item) => (
          <div
            key={item.id}
            className=" p-3 hover:shadow-md hover:rounded-md hover:text-blue-300 transition cursor-pointer"
          >
            <p className="text-sm font-medium text-orange-500 hover:text-blue-400">
            <Milestone className="inline-block mx-2"/>
              {item.title}
            </p>

            <p className="text-xs text-gray-500 mt-1 ml-8">
              {item.date}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default LatestNews;