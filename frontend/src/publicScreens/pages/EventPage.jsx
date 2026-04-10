import React, { useEffect, useMemo, useState } from "react";
import axiosWrapper from "../../utils/AxiosWrapper";

const staticEvents = [
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


const EventPage = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const response = await axiosWrapper.get("/event");
        if (response.data.success) {
          setEvents(response.data.data);
        }
      } catch (error) {
        setEvents([]);
      }
    };

    // loadEvents();
  }, []);

  const mergedEvents = useMemo(() => {
    const dynamicEvents = events.map((event) => ({
      id: event._id,
      title: event.title,
      description: event.description,
      date: new Date(event.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      link: event.link,
    }));

    return [...dynamicEvents, ...staticEvents];
  }, [events]);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10 md:px-16">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-center text-4xl font-bold text-gray-900">Events</h1>
        {/* <p className="mt-3 text-center text-gray-600">
          Department events and updates from the admin panel are shown here along
          with the current static news items.
        </p> */}

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {mergedEvents.map((item) => (
            <div key={item.id}
                className="rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md overflow-hidden"
                >
                <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=400"
                    alt={item.title}
                    className="w-full h-40 object-cover"
                />
                <div className="p-6">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-gray-900 hover:underline hover:text-blue-500 cursor-pointer">
                            {item.title}
                        </h2>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                        {item.description}
                    </p>
                    <div className="mt-auto flex justify-between">
                        <p className="mt-1 text-xs font-medium text-blue-600">
                            {item.date}
                        </p>
                        <button className="text-orange-500 border-orange-600 border-2 px-2 py-1 rounded-full text-sm hover:bg-orange-400 hover:text-white transition">
                            Register
                        </button>
                    </div>
                </div>
            </div>))}
        </div>
      </div>
    </div>
  );
};

export default EventPage;
