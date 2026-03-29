const Sidebar = () => {
  const links = [
    "About Department",
    "Faculty",
    "Programs",
    "Research",
    "Labs",
    "Contact"
  ];

  return (
    <div className="w-full md:w-64 bg-slate-100 border-r p-4 m-4 rounded-s">
      <h3 className="font-semibold mb-3">Quick Links</h3>

      <ul className="space-y-2">
        {links.map((link, i) => (
          <li
            key={i}
            className="cursor-pointer hover:text-blue-600 transition"
          >
            {link}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;