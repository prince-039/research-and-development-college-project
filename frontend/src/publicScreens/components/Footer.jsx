import { MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-orange-500 to-amber-800 text-white px-6 md:px-16 py-10">

      {/* Top Section */}
      <div className="grid md:grid-cols-3 gap-8 border-b border-red-900 pb-6">

        {/* Left - Logo + Address */}
        <div>
          <h2 className="text-lg font-semibold mb-2">
            DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING
          </h2>
          <p className="text-sm mb-3">
            NATIONAL INSTITUTE OF TECHNOLOGY JAMSHEDPUR
          </p>

          <hr className="border-red-800 my-3" />

          <p className="text-sm">
            Next to the Administrative Building, Golchakkar <br />
            National Institute of Technology Jamshedpur <br />
            Adityapur, Jamshedpur 831014
          </p>

          <div className="flex gap-4 mt-3 text-sm">
            <span className="flex items-center gap-1 cursor-pointer hover:underline">
              <MapPin className="inline-block text-amber-900" /> Location
            </span>
            <span className="flex items-center text-amber-950 gap-1 cursor-pointer hover:underline">
              🗺 <span className="text-white">Department Map</span>
            </span>
          </div>
        </div>

        {/* Middle - Contact */}
        <div className="text-sm">
          <p className="mb-2">office@cse.nitjsr.ac.in</p>
          <p>+91 1234567890</p>
        </div>

        {/* Right - Links */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <ul className="space-y-1">
            <li className="hover:underline cursor-pointer">About Us</li>
            <li className="hover:underline cursor-pointer">Programs</li>
            <li className="hover:underline cursor-pointer">Admissions</li>
          </ul>

          <ul className="space-y-1">
            <li className="hover:underline cursor-pointer">News</li>
            <li className="hover:underline cursor-pointer">Faculty</li>
            <li className="hover:underline cursor-pointer">Calendar</li>
          </ul>

          <ul className="space-y-1">
            <li className="hover:underline cursor-pointer">Events</li>
            <li className="hover:underline cursor-pointer">Students</li>
            <li className="hover:underline cursor-pointer">Reach Us</li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-6 flex flex-col md:flex-row justify-between items-center text-sm">
        <p>
          © 2026 Copyright: Webteam, Department of CSE, NIT Jamshedpur
        </p>

        {/* Scroll to Top Button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mt-4 md:mt-0 border border-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-orange-100 hover:text-blue-900 transition"
        >
          ↑
        </button>
      </div>

    </footer>
  );
};

export default Footer;