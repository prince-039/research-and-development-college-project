import { Landmark } from "lucide-react";
import Carousel from "./Carousel";

const DepartmentInfo = () => {
  return (
    <div className="mb-6">
      <Carousel />
      <h2 className="text-2xl font-semibold my-4">
        <Landmark className="inline-block mx-2" />
        Department of Computer Science and Engg
      </h2>

      <p className="text-gray-700 mb-2 ml-8">
        The Department of Computer Science and Engineering at the National Institute of Technology Jamshedpur, was formed in 1992. Since its inception, the department has always been recognized all over the country for its excellence. The Department has consistently produced quality professionals in the field of Computer Science & Engineering and strived for excellence in research and development.
        It offers UG, PG, and PhD programs with strong industry exposure.
      </p>
      <h2 className="text-2xl font-semibold mb-2 ml-6">Vision</h2>
      <p className="text-gray-700 mb-2 ml-8">
        Producing high quality industry ready Computer engineers to cater to the needs of the society.
      </p>
      <h2 className="text-2xl font-semibold mb-2 ml-6">Mission</h2>
      <p className="text-gray-700 mb-2 ml-8">
        To train young minds and to equip them with the best possible technical knowledge to meet the current and future demands of the industry, academia & research. To create infrastructure, motivation and culture for the state of the art research work in the area of Computer Science & Information Technology.
      </p>
      <h2 className="text-2xl font-semibold mb-2 ml-6">Head of Department</h2>
      <div className="flex gap-4 rounded-xl p-2 ml-6">
        <img src="HOD_Sir.png" alt="HOD Sir"
          className="h-30 w-20 rounded-full object-cover"
        />
        <div>
          <h2 className="pb-1 text-xl font-semibold">
            Dr. Dilip Kumar Shaw
          </h2>
          <div className="mt-1 space-y-1 text-gray-800">
            <p>Phone(HOD Office) : NA</p>
            <p>Email : hod.cse@nitjsr.ac.in</p>
            <p>Fax : NA</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentInfo;