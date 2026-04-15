import React from "react";
import Login from "./Screens/Login";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import mystore from "./redux/store";
import StudentHome from "./Screens/Student/Home";
import FacultyHome from "./Screens/Faculty/Home";
import AdminHome from "./Screens/Admin/Home";
import ForgetPassword from "./Screens/ForgetPassword";
import UpdatePassword from "./Screens/UpdatePassword";
import Signup from "./pages/Signup";
import Layout from "./publicScreens/Layout"
import DepartmentPage from "./publicScreens/pages/DepartmentPage";
import AcademicSection from "./publicScreens/pages/AcademicSection";
import FacultySection from "./publicScreens/pages/FacultySection";
import FacultyDetail from "./publicScreens/pages/FacultyDetail";
import ResearchPage from "./publicScreens/pages/ResearchPage";
import NewsPage from "./publicScreens/pages/NewsPage";
import EventPage from "./publicScreens/pages/EventPage";
import ResearcherDetails from "./publicScreens/pages/ResearcherDetails";
import ScholarsInfo from "./Screens/ScholarsInfo";
import ScholarsPublications from "./Screens/ScholarsPublications";
import ScholarsSemesters from "./Screens/ScholarsSemesters";

const App = () => {
  return (
    <>
      <Provider store={mystore}>
        <Router>
          <Routes>
            {/* public routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<DepartmentPage />} />
              <Route path="faculties" element={<FacultySection />} />
              <Route path="academic" element={<AcademicSection />} />
              <Route path="researchers" element={<ResearchPage />} />
              <Route path="news" element={<NewsPage />} />
              <Route path="events" element={<EventPage />} />

            </Route>
            <Route path="faculty-details/:id" element={<FacultyDetail />} />
            <Route path="researcher-details/:id" element={<ResearcherDetails />} />
            
            {/* protected routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgetPassword />} />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route
              path="/:type/update-password/:resetId"
              element={<UpdatePassword />}
            />
            <Route path="/student" element={<StudentHome />} />
            <Route path="/faculty" element={<FacultyHome />} />
            <Route path="/admin" element={<AdminHome />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </Provider>
    </>
  );
};

export default App;
