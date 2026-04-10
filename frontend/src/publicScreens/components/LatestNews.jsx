import { useEffect, useMemo, useState } from "react";
import { Milestone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosWrapper from "../../utils/AxiosWrapper";

const staticNews = [
  {
    id: "static-1",
    title: "Research paper published in IEEE Conference",
    date: "March 2026",
    link: ""
  },
  {
    id: "static-2",
    title: "AI Lab inaugurated in CSE Department",
    date: "February 2026",
    link: ""
  },
  {
    id: "static-3",
    title: "Students secured top rank in Hackathon",
    date: "January 2026",
    link: ""
  },
  {
    id: "static-4",
    title: "New Blockchain course introduced",
    date: "December 2025",
    link: ""
  },
];

const LatestNews = () => {
  const [notices, setNotices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const response = await axiosWrapper.get("/notice");
        if (response.data.success) {
          setNotices(response.data.data);
        }
      } catch (error) {
        setNotices([]);
      }
    };

    loadNotices();
  }, []);

  const news = useMemo(() => {
    const dynamicNews = notices.map((notice) => ({
      id: notice._id,
      title: notice.title,
      link : notice.link,
      date: new Date(notice.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    }));

    return [...dynamicNews, ...staticNews].slice(0, 5);
  }, [notices]);

  return (
    <div className="m-4 w-full rounded-lg border-r bg-slate-100 p-4 shadow-sm md:w-70">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Latest News</h3>
      <div className="space-y-2">
        {news.map((item) => (
          <div
            key={item.id}
            className="cursor-pointer p-3 transition hover:rounded-md hover:shadow-md hover:text-blue-300"
          >
            <a href={item.link} target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium text-orange-500 hover:text-blue-400">
              <Milestone className="mx-2 inline-block" />
              {item.title}
            </a>

            <p className="ml-8 mt-1 text-xs text-gray-500">{item.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestNews;
