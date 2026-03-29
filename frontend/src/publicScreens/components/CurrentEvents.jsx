import { Milestone } from "lucide-react";

const CurrentEvents = () => {
  const events = [
    {
      id: 1,
      title: "National Tech Symposium 2026",
      date: "April 5, 2026",
      status: "Upcoming"
    },
    {
      id: 2,
      title: "Workshop on Machine Learning",
      date: "March 30, 2026",
      status: "Ongoing"
    },
    {
      id: 3,
      title: "Coding Hackathon",
      date: "March 20, 2026",
      status: "Completed"
    }
  ];

  return (
    <div className="w-full md:w-70 bg-slate-100 border-r p-4 m-4 rounded-lg shadow-sm">
      
      {/* Title */}
      <h3 className="font-semibold mb-4 text-lg text-gray-800">
        Current Events
      </h3>

      {/* Events List */}
      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className=" p-3 hover:rounded-md hover:shadow-md transition cursor-pointer"
          >
            <p className="text-sm font-medium text-orange-500 hover:text-blue-400">
              <Milestone className="inline-block mx-2" />
              {event.title}
            </p>

            <p className="text-xs text-gray-500 mt-1 ml-8">
              {event.date}

              {/* Status Badge */}
              <span
                className={`inline-block mt-2 text-xs px-2 py-1 ml-2 rounded ${
                  event.status === "Upcoming"
                    ? "bg-blue-100 text-blue-700"
                    : event.status === "Ongoing"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                  }`}
                >
                {event.status}
              </span>
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default CurrentEvents;