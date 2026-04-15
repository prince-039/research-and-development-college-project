const express = require("express");
const router = express.Router();

const {
  createScholar,
  getAllScholars,
  getScholarById,
  updateScholar,
  deleteScholar,
  bulkUploadController,
  getScholar,
  findScholar
} = require("../controllers/scholar.controller");
const Auth = require("../middlewares/auth.middleware");
const mapFaculty = require("../middlewares/mapFaculty.middleware");
const upload = require("../middlewares/multer.middleware");


router.post("/", mapFaculty, createScholar);
router.post("/bulk-upload", Auth, upload.single("file"), bulkUploadController);

router.get("/", getAllScholars);
router.get("/my-details", Auth, getScholar);
router.get("/finder", Auth, findScholar);

router.get("/:id", getScholarById);

router.put("/:id",Auth, updateScholar);

router.delete("/:id",Auth, deleteScholar);

module.exports = router;