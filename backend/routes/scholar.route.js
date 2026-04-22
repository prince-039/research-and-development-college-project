const express = require("express");
const router = express.Router();

const {
  createScholar,
  getAllScholars,
  getScholarById,
  updateScholar,
  deleteScholar,
  generalBulkUploader,
  semesterBulkUploader,
  getScholar,
  findScholar,
  addScholarByFaculty,
  updateSemester,
  initializeSemester,
  changePassword
} = require("../controllers/scholar.controller");
const Auth = require("../middlewares/auth.middleware");
const mapFaculty = require("../middlewares/mapFaculty.middleware");
const upload = require("../middlewares/multer.middleware");


router.post("/", mapFaculty, createScholar);
router.post("/general-bulk-upload", Auth, upload.single("file"), generalBulkUploader);
router.post("/semester-bulk-upload", Auth, upload.single("file"), semesterBulkUploader);
router.post("/by-faculty", Auth, mapFaculty, addScholarByFaculty);
router.post("/semester", Auth, initializeSemester);
router.post("/change-password", Auth, changePassword);

router.get("/", getAllScholars);
router.get("/my-details", Auth, getScholar);
router.get("/finder", Auth, findScholar);

router.get("/:id", getScholarById);

router.put("/update-semester", Auth, upload.single("file"), updateSemester);
router.put("/:id",Auth, updateScholar);

router.delete("/:id",Auth, deleteScholar);

module.exports = router;