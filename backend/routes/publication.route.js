const express = require("express");
const router = express.Router();

const {
  createPublication,
  getAllPublications,
  getPublicationById,
  updatePublication,
  publicationBulkUploader,
  deletePublication
} = require("../controllers/publication.controller");
const Auth = require("../middlewares/auth.middleware")
const upload = require("../middlewares/multer.middleware");

router.post("/", Auth, createPublication);

router.post("/bulk-upload", Auth, upload.single("file"), publicationBulkUploader);

router.get("/", getAllPublications);

router.get("/:type/:id", getPublicationById);

router.put("/:id", Auth, updatePublication);

router.delete("/:id", Auth, deletePublication);

module.exports = router;