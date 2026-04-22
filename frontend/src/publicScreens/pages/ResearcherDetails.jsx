import React, { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import axiosWrapper from '../../utils/AxiosWrapper'
import ScholarsPublications from '../../Screens/ScholarsPublications';


const ResearcherDetails = () => {
    const {id}=useParams();
    const [scholar, setScholar]=useState({});
    const [loading, setLoading]=useState(false);

    useEffect(()=>{
        const loadData=async ()=>{
            try{
                setLoading(true);
                const response=await axiosWrapper.get(`/scholar/${id}`);
                if(response.data.success){
                    // console.log(response.data.data)
                    setScholar(response.data.data);
                }
            }
            catch(error){
                console.log(error)
            }
            finally{
                setLoading(false);
            }
        }
        loadData();
    },[])

    if(!scholar || loading)
        return <div className='text-center text-xl mt-14'>Loadnig...</div>

    return (
        <div className="min-h-screen bg-gray-100 mb-8">
            <div className="bg-orange-300 py-6 text-center">
                <h1 className="text-4xl font-bold tracking-widest text-white">
                    {scholar.firstName + " " + scholar.lastName}
                </h1>
            </div>

            <div className="bg-orange-700 text-white px-10 py-2 flex justify-evenly">
                <NavLink to={"/researchers"} className="cursor-pointer hover:underline"
                    >Home
                </NavLink>
                <NavLink to={`/researcher-details/${id}`} className="cursor-pointer hover:underline"
                    >Profile
                </NavLink>
            </div>

            <div className="max-w-5xl mx-auto my-4 bg-white shadow p-6">
                <div className="flex flex-col md:flex-row gap-6 bg-orange-300 p-6 rounded">
                    <img
                        src={scholar.profile ? `${process.env.REACT_APP_MEDIA_LINK}/${scholar.profile}` : "../user.png"}
                        alt={scholar.firstName}
                        className="w-40 h-40 object-cover rounded"
                    />
                    <div className="text-white">
                        <h2 className="text-2xl font-bold">
                            {scholar.firstName + " " + scholar.lastName}
                        </h2>

                        <p className="mt-2">{scholar.rollNo}</p>
                        <p>Computer Science and Engineering</p>

                        <div className="mt-3 text-sm space-y-1">
                            <p>📞 {scholar.phone}</p>
                            <p>📧 {scholar.email}</p>
                            {/* <p>🏢 {scholar.office}</p> */}
                        </div>
                    </div>
                </div>
            </div>

            <div className=''>
                <h2 className='text-center text-2xl font-semibold mt-8'>Publications</h2>
                <ScholarsPublications />
            </div>

        </div>
    );
  }

export default ResearcherDetails;
