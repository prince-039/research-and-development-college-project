import DepartmentInfo from "../components/DepartmentInfo";
import LatestNews from "../components/LatestNews";
import CurrentEvents from "../components/CurrentEvents";

const DepartmentPage = () => {

  return (<>
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row mx-6">
        <div>
          <LatestNews />
          <CurrentEvents />
        </div>

        <div className="flex-1 p-4 md:p-6">
          <DepartmentInfo />
        </div>
      </div>
    </div>
  </>);
};

export default DepartmentPage;