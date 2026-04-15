const FacultyDetail = require("../models/details/faculty-details.model");

const mapFaculty = async (req, res, next) => {
  try {
    const { supervisor, coSupervisor, srcCommittee } = req.body;
    if (supervisor) {
      const faculty = await FacultyDetail.findOne({ email: supervisor });
      if (!faculty) {
        return res.status(404).json({ message: "Supervisor not found" });
      }
      req.body.supervisor = faculty._id;
    }

    if (coSupervisor) {
      const faculty = await FacultyDetail.findOne({ email: coSupervisor });
      if (!faculty) {
        return res.status(404).json({ message: "Co-Supervisor not found" });
      }
      req.body.coSupervisor = faculty._id;
    }

    if (Array.isArray(srcCommittee)) {
      const updatedCommittee = [];

      for (const memberObj of srcCommittee) {
        if (memberObj.member) {
          const faculty = await FacultyDetail.findOne({
            email: memberObj.member
          });

          if (!faculty) {
            return res.status(404).json({
              message: `SRC member not found: ${memberObj.member}`
            });
          }

          updatedCommittee.push({
            ...memberObj,
            member: faculty._id
          });
        }
      }

      req.body.srcCommittee = updatedCommittee;
    }

    next();
  } catch (error) {
    // console.error("Middleware error:", error);
    return ApiResponse.created(error.message).send(res);
  }
};

module.exports = mapFaculty;