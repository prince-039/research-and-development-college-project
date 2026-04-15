const express = require("express");
const router = express.Router();

const {
  createPublication,
  getAllPublications,
  getPublicationById,
  updatePublication,
  deletePublication
} = require("../controllers/publication.controller");
const Auth = require("../middlewares/auth.middleware")

router.post("/", createPublication);

router.get("/", getAllPublications);

router.get("/:type/:id", getPublicationById);

router.put("/:id", Auth, updatePublication);

router.delete("/:id", Auth, deletePublication);

module.exports = router;