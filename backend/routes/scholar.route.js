const express = require("express");
const router = express.Router();

const {
  createScholar,
  getAllScholars,
  getScholarById,
  updateScholar,
  deleteScholar
} = require("../controllers/scholar.controller");

// ✅ Create Scholar
router.post("/", createScholar);

// ✅ Get All Scholars
router.get("/", getAllScholars);

// ✅ Get Single Scholar
router.get("/:id", getScholarById);

// ✅ Update Scholar
router.put("/:id", updateScholar);

// ✅ Delete Scholar
router.delete("/:id", deleteScholar);

module.exports = router;