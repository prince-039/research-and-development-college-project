const express = require("express");
const router = express.Router();
const {
  loginFacultyController,
  registerFacultyController,
  bulkUploadFacultyController,
  updateFacultyController,
  deleteFacultyController,
  getAllFacultyController,
  getMyFacultyDetailsController,
  sendFacultyResetPasswordEmail,
  updateFacultyPasswordHandler,
  updateLoggedInPasswordController,
  getMyBioDetailsController,
} = require("../../controllers/details/faculty-details.controller");
const upload = require("../../middlewares/multer.middleware");
const auth = require("../../middlewares/auth.middleware");

router.post("/register", upload.single("file"), registerFacultyController);
router.post("/bulk-upload", auth, upload.single("file"), bulkUploadFacultyController);
router.post("/login", loginFacultyController);
router.get("/public", getAllFacultyController);
router.get("/my-details", auth, getMyFacultyDetailsController);
router.get("/my-bio/:id",  getMyBioDetailsController);

router.get("/", auth, getAllFacultyController);
router.patch("/:id", auth, upload.single("file"), updateFacultyController);
router.delete("/:id", auth, deleteFacultyController);
router.post("/forgot-password", sendFacultyResetPasswordEmail);
router.post("/forget-password", sendFacultyResetPasswordEmail);
router.post("/update-password/:resetId", updateFacultyPasswordHandler);
router.post("/change-password", auth, updateLoggedInPasswordController);

module.exports = router;
