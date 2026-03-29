import {GraduationCap, Users} from "lucide-react"
import {NavLink, useNavigate, Link } from "react-router-dom"
const Header = () => {
  const navigate=useNavigate()
  return (
    <div className="bg-white text-black p-4 shadow">
      <div className="grid grid-cols-3 items-center px-10 py-4">
        <div className="flex justify-start">
          <img src="cse.png" alt="CSE" className="w-30 h-20 object-contain ml-20 cursor-pointer" 
            onClick={()=>navigate('/')}
          />
        </div>
        <div className="flex flex-col items-center">
          <div className="flex gap-4">
            <span className="text-2xl font-medium text-gray-800 cursor-pointer hover:text-blue-300"
              onClick={()=>navigate('/academic')}
              >
              <GraduationCap className="inline-block mx-2 text-black" size={30}/>
              Academic
            </span>
            <span className="text-2xl font-medium text-gray-800 cursor-pointer hover:text-blue-300"
              onClick={()=>navigate('/faculty')}
              >
              <Users className="inline-block mx-2 text-black " size={30}/>
              Faculty
            </span>
          </div>
          <div className="flex gap-6 mt-5 bg-gray-200 px-6 py-2 rounded ">
            <NavLink to="/" 
              className={({isActive})=>`${isActive ? "bg-bule-400" : " "} space-x-4 px-1 hover:text-blue-500`}
              >Home
            </NavLink>
            <NavLink to="/Research" 
              className={({isActive})=>`${isActive ? "bg-bule-400" : " "} space-x-4 px-1 hover:text-blue-500`}
              >Research
            </NavLink>
            <NavLink to="/facilities" 
              className={({isActive})=>`${isActive ? "text-bule-400" : " "} space-x-4 px-1 hover:text-blue-500`}
              >News
            </NavLink>
            <NavLink to="/events" 
              className={({isActive})=>`${isActive ? "bg-bule-400" : " "} space-x-4 px-1 hover:text-blue-500`}
              >Events
            </NavLink>
            <a href="#" className="hover:text-blue-600">Facility</a>
            <a href="#" className="hover:text-blue-600">Labs</a>
            <a href="#" className="hover:text-blue-600">Achivements</a>
          </div>
        </div>
        <Link to='https://nitjsr.ac.in/' target="_blank" className="flex justify-end">
          <img src="nitjsr.png" alt="Logo" className="w-20 h-20 object-contain mr-20" />
        </Link>
      </div>
    </div>
  );
};

export default Header;