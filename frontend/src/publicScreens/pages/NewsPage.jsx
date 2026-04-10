import React, { useEffect, useMemo, useState } from "react";
import { Download, ListFilterPlus } from "lucide-react";
import axiosWrapper from "../../utils/AxiosWrapper";

const NewsPage = () => {
  const [notices, setNotices] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredNotice, setFilteredNotice] = useState([]);
  const [type, setType] = useState("");

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const response = await axiosWrapper.get("/notice");
        if (response.data.success) {
          setNotices(response.data.data);
          setFilteredNotice(response.data.data);
        }
      } catch (error) {
        setNotices([]);
      }
    };

    loadNotices();
  }, []);

  const downloadLink = (link) => {
    if (!link) return "#";

    const match = link.match(/\/d\/(.*?)\//);
    if (!match) return link;

    const fileId = match[1];
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  };
  
  useEffect(() => {
    const result = notices.filter((item) => {
      const matchesSearch =
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.type?.toLowerCase().includes(search.toLowerCase());

      if(type==="both")
        return matchesSearch;
      return matchesSearch && item.type === type;
    });

    setFilteredNotice(result);
  }, [search, type]);

  const news = useMemo(() => {
    const dynamicNews = filteredNotice.map((notice) => ({
      id: notice._id,
      title: notice.title,
      description: notice.description,
      link : notice.link,
      date: new Date(notice.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      type: notice.type
    }));
  
    return [...dynamicNews];
  }, [filteredNotice]);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10 md:px-16">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-center text-4xl font-bold text-gray-900">News</h1>
        {/* <p className="mt-3 text-center text-gray-600">
          Department notices and updates from the admin panel are shown here along
          with the current static news items.
        </p> */}
        <div className="mt-4 mx-4 flex justify-between">
            <input
              type="text"
              placeholder="Search..."
              className="rounded border px-3 py-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div>
              <label htmlFor="filter"><ListFilterPlus className="inline-block" size={24} /> </label>
              <select id="filter"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="both">All</option>
                <option value="student">Students</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>
          </div>

        <div className="mt-6 grid gap-2  md:grid-cols-1">
          {news.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:bg-slate-100 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {`${item.title} :`}
                    <span className="m-2 text-sm text-gray-600">{item.description}</span>
                  </h2>
                  <div className="flex justify-between mt-2">
                    <p className="text-xs mx-2 font-medium text-blue-600">
                      {item.date}
                    </p>
                    <p
                      className="inline-block text-sm font-medium text-blue-600 cursor-pointer"
                    >
                      <a href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                        >Open Notice
                      </a> 
                      <a href={downloadLink(item.link)}>
                        <Download className="mx-2 inline-block hover:text-blue-800" size={16}/>
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
