import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Dot, Milestone } from 'lucide-react'

const scholar = {
    "_id": "scholar_001",
    "firstName": "Nikhil",
    "lastName": "Chandelkar",
    "roll": "2023PHDCS001",
    "department": "Computer Science and Engineering",
    "university": "XYZ University",
    "email": "nikhil@xyz.edu",
    "phone": "+91-9876543210",
    "profileImage": "https://api.dicebear.com/7.x/avataaars/svg?seed=Nikhil",

    "research": {
        "title": "AI-based Traffic Prediction System",
        "abstract": "This research focuses on predicting real-time traffic congestion using machine learning and deep learning models.",
        "keywords": ["AI", "Machine Learning", "Traffic Prediction", "Data Science"],
        "startDate": "2023-01-10",
        "expectedCompletion": "2026-06-30"
    },

    "supervisor": {
        "firstName": "Rajesh",
        "lastName": "Sharma",
        "designation": "Professor",
        "department": "Computer Science",
        "email": "rajesh.sharma@xyz.edu"
    },

    "milestones": [
        {
            "title": "Research Proposal Submitted",
            "status": "completed",
            "date": "2023-03-01"
        },
        {
            "title": "Literature Review Completed",
            "status": "completed",
            "date": "2023-06-15"
        },
        {
            "title": "Data Collection",
            "status": "completed",
            "date": "2023-10-10"
        },
        {
            "title": "Model Development",
            "status": "ongoing",
            "date": "2024-05-01"
        },
        {
            "title": "Thesis Submission",
            "status": "pending",
            "date": "2026-06-30"
        }
    ],

    "publications": [
        {
            "title": "Traffic Prediction using Deep Learning publicatonds",
            "journal": "IEEE Transactions on Intelligent Transportation Systems",
            "date": "08/2024",
            "status": "published",
            "link": "https://doi.org/xxxx"
        },
        {
            "title": "Smart City Traffic Analysis",
            "journal": "Springer Conference on AI",
            "date": "05/2025",
            "status": "under review",
            "link": ""
        }
    ],

    "skills": [
        "Python",
        "C++",
        "Machine Learning",
        "TensorFlow",
        "MongoDB",
        "React"
    ],

    "achievements": [
        "Best Paper Award - AI Conference 2024",
        "Qualified GATE 2022",
        "Presented at International Conference on Smart Cities"
    ],

    "progress": {
        "completionPercentage": 65,
        "currentPhase": "Model Development"
    },

    "createdAt": "2023-01-01",
    "updatedAt": "2025-03-10"
}

const ResearcherDetails = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-100 mb-8">
            <div className="bg-orange-300 py-6 text-center">
                <h1 className="text-4xl font-bold tracking-widest text-white">
                    {scholar.firstName + " " + scholar.lastName}
                </h1>
            </div>

            <div className="bg-orange-700 text-white px-10 py-2 flex justify-evenly">
                <NavLink className="cursor-pointer hover:underline"
                    onClick={() => navigate(-1)}
                >Home
                </NavLink>
                <NavLink className="cursor-pointer hover:underline"
                    onClick={() => navigate(-1)}
                >Profile
                </NavLink>
                <NavLink className="cursor-pointer hover:underline"
                    onClick={() => navigate(-1)}
                >Publications
                </NavLink>
                <NavLink className="cursor-pointer hover:underline"
                    onClick={() => navigate(-1)}
                >Semester Registration
                </NavLink>
            </div>

            {/* Profile Section */}
            <div className="max-w-5xl mx-auto mt-6 bg-white shadow p-6">
                <div className="flex flex-col md:flex-row gap-6 bg-orange-500 p-6 rounded">
                    <img
                        src={scholar.profile ? `http://localhost:8080/media/${scholar.profile}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${scholar.firstName}`}
                        alt={scholar.firstName}
                        className="w-40 h-40 object-cover rounded"
                    />
                    <div className="text-white">
                        <h2 className="text-2xl font-bold">
                            {scholar.firstName + " " + scholar.lastName}
                        </h2>

                        <p className="mt-2">{scholar.roll}</p>
                        <p>{scholar.department}</p>

                        <div className="mt-3 text-sm space-y-1">
                            <p>📞 {scholar.phone}</p>
                            <p>📧 {scholar.email}</p>
                            {/* <p>🏢 {scholar.office}</p> */}
                            <p>
                                🌐{" "}
                                <a
                                    href={`https://${scholar.website}`}
                                    className="underline"
                                >
                                    {scholar.website}
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default ResearcherDetails