const mongoose = require("mongoose");
const Publication = require("../models/publication.model");

exports.createPublication = async (req, res) => {
  try {
    const { title, type, scholar, name} = req.body;

    if (!title || !type || !scholar || !name) {
      return res.status(400).json({
        message: "Title, type, scholar and name are required"
      });
    }

    const publication = new Publication(req.body);
    const saved = await publication.save();

    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getAllPublications = async (req, res) => {
  try {
    const publications = await Publication.find()
      .populate("scholar", "firstName lastName rollNo");

    res.status(200).json(publications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPublicationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const publication = await Publication.findById(id)
      .populate("scholar", "firstName lastName rollNo");

    if (!publication) {
      return res.status(404).json({ message: "Publication not found" });
    }

    res.status(200).json(publication);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePublication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const updated = await Publication.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("scholar", "firstName lastName rollNo");

    if (!updated) {
      return res.status(404).json({ message: "Publication not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.deletePublication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const deleted = await Publication.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Publication not found" });
    }

    res.status(200).json({ message: "Publication deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};