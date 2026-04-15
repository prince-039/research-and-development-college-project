import React from 'react'
import CustomButton from '../components/CustomButton'

const ScholarsInfo = ({scholar, openEditModal}) => {

    if(!scholar) return <div className='items-center mt-10 text-xl'>Loading...</div>
// console.log(scholar)
    return (
        <div className="min-h-screen bg-gray-100 p-6 ">
            <div className="max-w-5xl mx-auto my-4 bg-white shadow p-6">
                <div className="flex flex-col md:flex-row gap-6 bg-orange-300 p-6 rounded">
                    <img
                        src={scholar.profile ? `http://localhost:8080/media/${scholar.profile}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${scholar.firstName}`}
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
            <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-[50%_35%_10%] gap-4">
                    <p className="text-sm text-gray-500">Enrollment Date : 
                        <span className="font-medium"> {new Date(scholar.enrollmentDate).toLocaleDateString()}</span>
                    </p>
                    <p className="text-sm text-gray-500">Semester : 
                        <span className="font-medium">{scholar.semester || " 1st"} </span> 
                    </p>
                    <CustomButton onClick={openEditModal}>Edit</CustomButton>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <p className="text-sm text-gray-500">Supervisor : 
                        <span className="font-medium"> {scholar.supervisor ? scholar.supervisor.firstName+" "+scholar.supervisor.lastName : " --"} </span>
                    </p>

                    <p className="text-sm text-gray-500">Co-Supervisor : 
                        <span className="font-medium"> {scholar.coSupervisor ? scholar.coSupervisor.firstName+" "+scholar.coSupervisor.lastName : " --"}</span>
                    </p>
                </div>
                <div className='grid grid-cols-[70%_30%] gap-2'>
                    <div>
                        <div className="bg-gray-50 p-4 m-1 rounded-xl">
                            <h3 className="font-semibold text-gray-700 mb-3">
                                Comprehensive Examination
                            </h3>
                            <p>
                                <span className="text-gray-500">Status: </span>
                                <span className={`font-medium `}>
                                    {scholar.comprehensiveExam?.status}
                                </span>
                            </p>

                            {scholar.comprehensiveExam?.status === "yes" && (
                                <p className="mt-2">
                                    <span className="text-gray-500">Date: </span>
                                    <span className="font-medium"> {new Date(scholar.comprehensiveExam?.date).toLocaleDateString()}</span>
                                </p>
                            )}
                        </div>
                        <div className="bg-gray-50 p-4 my-1 rounded-xl">
                            <h3 className="font-semibold text-gray-700 mb-3">
                                Seminar Details
                            </h3>
                            <p>
                                <span className="text-gray-500">Topic: </span>
                                <span className="font-medium">{scholar.seminar?.topic ? scholar.seminar?.topic : "NA"}</span>
                            </p>

                            {scholar.seminar?.topic && (
                                <>
                                    <p className="mt-2">
                                        <span className="text-gray-500">Registration Seminar Date: </span>
                                        <span className="font-medium">{new Date(scholar.seminar?.dateRegistration).toLocaleDateString()}</span>
                                    </p>

                                    <p className="mt-2">
                                        <span className="text-gray-500">Presentation Date: </span>
                                        <span className="font-medium">
                                            {new Date(scholar.seminar?.datePresentation).toLocaleDateString() || "NA"}
                                        </span>
                                    </p>
                                </>
                            )}
                        </div>
                        <div className="bg-gray-50 p-4 my-1 rounded-xl space-y-3">
                            <h3 className="font-semibold text-gray-700">
                                Progress Status
                            </h3>
                            <div className='flex justify-between'>
                                <p className="text-gray-500">Stipend Enhancement:  
                                    <span className="font-medium text-black"> {scholar.stipendEnhancementSeminar?.status || " NA"}</span>
                                </p>
                                {scholar.stipendEnhancementSeminar?.status === "yes" && (
                                <p>
                                    <span className="text-gray-500">Date: </span>
                                    <span className="font-medium">{new Date(scholar.stipendEnhancementSeminar.date).toLocaleDateString()}</span>
                                </p>
                                )}
                            </div>

                            <p>
                                <span className="text-gray-500">Pre Submission: </span>
                                <span className="font-medium">{scholar.preSubmissionSeminar?.status || "NA"}</span>
                            </p>

                            {scholar.preSubmissionSeminar?.status === "yes" && (
                                <p>
                                    <span className="text-gray-500">Date: </span>
                                    <span className="font-medium">{new Date(scholar.preSubmissionSeminar.date).toLocaleDateString()}</span>
                                </p>
                            )}

                            <p>
                                <span className="text-gray-500">Open Defense: </span>
                                <span className="font-medium">{scholar.openDefense?.status || "NA"}</span>
                            </p>

                            {scholar.openDefense?.status === "yes" && (
                                <p>
                                    <span className="text-gray-500">Date: </span>
                                    <span className="font-medium">{new Date(scholar.openDefense.date).toLocaleDateString()}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <div className=" p-6 rounded-2xl border border-gray-300 max-h-100 overflow-y-scroll no-scrollbar">
                        <h2 className="text-lg font-semibold mb-4">SRC Committee</h2>
                        <div className=" pl-2 space-y-4 text-sm text-gray-500">
                            {scholar.srcCommittee?.slice()
                            .map((src, index) => (
                                <div key={src._id} className="relative">
                                    <span>{index+1}.</span>    
                                    {src.member && (
                                        <span className="font-bold ml-2" >
                                            {src.member.firstName+" "+src.member.lastName} 
                                        </span>
                                     )}
                                    <p className='ml-6' >{src.designation}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default ScholarsInfo