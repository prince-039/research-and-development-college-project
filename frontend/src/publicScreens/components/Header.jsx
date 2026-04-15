import { GraduationCap, LogIn, Users } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white text-black p-4 shadow">
      <div className="grid grid-cols-1 gap-6 px-4 py-4 md:grid-cols-[auto_1fr_auto] md:items-center md:px-10">
        <div className="flex justify-start">
          <img
            src="cse.png"
            alt="CSE"
            className="h-20 w-30 cursor-pointer object-contain md:ml-20"
            onClick={() => navigate("/")}
          />
        </div>
        <div className="flex flex-col items-center">
          <div className="flex flex-wrap items-center justify-center gap-4 md:flex-nowrap">
            <span
              className="cursor-pointer text-2xl font-medium text-gray-800 hover:text-blue-300"
              onClick={() => navigate("/researchers")}
            >
              <GraduationCap className="mx-2 inline-block text-black" size={30} />
              Researchers
            </span>
            <span
              className="cursor-pointer text-2xl font-medium text-gray-800 hover:text-blue-300"
              onClick={() => navigate("/faculties")}
            >
              <Users className="mx-2 inline-block text-black " size={30} />
              Faculty
            </span>
            <span
              className="cursor-pointer text-xl font-medium text-gray-800 hover:text-blue-300"
              onClick={() => navigate("/login")}
            >
              <LogIn className="mx-2 inline-block text-black" size={20} />
              Login
            </span>
          </div>
          <div className="mt-5 w-full max-w-4xl overflow-x-auto rounded bg-gray-200 px-6 py-4">
            <div className="flex min-w-max items-center justify-center gap-8 whitespace-nowrap text-xl">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${isActive ? "bg-bule-400" : " "} space-x-4 px-1 hover:text-blue-500`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/academic"
              className={({ isActive }) =>
                `${isActive ? "bg-bule-400" : " "} space-x-4 px-1 hover:text-blue-500`
              }
            >
              Academic
            </NavLink>
            <NavLink
              to="/news"
              className={({ isActive }) =>
                `${isActive ? "text-bule-400" : " "} space-x-4 px-1 hover:text-blue-500`
              }
            >
              News
            </NavLink>
            <NavLink
              to="/events"
              className={({ isActive }) =>
                `${isActive ? "bg-bule-400" : " "} space-x-4 px-1 hover:text-blue-500`
              }
            >
              Events
            </NavLink>
            <span className="cursor-default hover:text-blue-600">Facility</span>
            <span className="cursor-default hover:text-blue-600">Labs</span>
            <span className="cursor-default hover:text-blue-600">Achivements</span>
            </div>
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <Link
            to="https://nitjsr.ac.in/"
            target="_blank"
            className="flex justify-end"
          >
            <img
              src="nitjsr.png"
              alt="Logo"
              className="h-20 w-20 object-contain md:mr-20"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
