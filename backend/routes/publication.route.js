const express = require("express");
const router = express.Router();

const {
  createPublication,
  getAllPublications,
  getPublicationById,
  updatePublication,
  deletePublication
} = require("../controllers/publication.controller");

router.post("/", createPublication);

router.get("/", getAllPublications);

router.get("/:id", getPublicationById);

router.put("/:id", updatePublication);

router.delete("/:id", deletePublication);

module.exports = router;