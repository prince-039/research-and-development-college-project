const mongoose = require("mongoose");
const Publication = require("../models/publication.model");
const ApiResponse = require("../utils/ApiResponse");
const { parseCsvFile } = require("../utils/csv.utils");
const Scholar = require("../models/scholar.model");
const fs = require("fs");

exports.createPublication = async (req, res) => {
  try {
    const { title, type, scholar, name} = req.body;

    if (!title || !type || !scholar || !name) {
      return ApiResponse.badRequest("Title, type, scholar and name are required").send(res);
    }

    const publication = new Publication(req.body);
    const saved = await publication.save();

    return ApiResponse.success(saved, "Data Saved!").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};


exports.getAllPublications = async (req, res) => {
  try {
    const publications = await Publication.find()
      .populate("scholar", "firstName lastName rollNo");

    return ApiResponse.success(publications, "Data fetched").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

exports.getPublicationById = async (req, res) => {
  try {
    const { type, id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !type) {
      return ApiResponse.badRequest("Wrong Request").send(res);
    }

    const publication = await Publication.find({scholar : id, type})
      .populate("scholar", "firstName lastName rollNo");

    if (!publication) {
      return ApiResponse.notFound("No Records").send(res);
    }

    return ApiResponse.success(publication, "Data Fetched").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

exports.updatePublication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.badRequest("Wrong Request").send(res);
    }

    const updated = await Publication.findByIdAndUpdate(id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("scholar", "firstName lastName rollNo");

    if (!updated) {
      return ApiResponse.notFound("Publication not found!").send(res);
    }

    return ApiResponse.success(updated, "Publication updated.").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};


exports.deletePublication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.badRequest("Wrong Request").send(res);
    }

    const deleted = await Publication.findByIdAndDelete(id);

    if (!deleted) {
      return ApiResponse.notFound("Publication not found!").send(res);
    }

    return ApiResponse.success(deleted, "Publication deleted successfully.").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};


exports.publicationBulkUploader = async (req, res) => {
  try {
    const filePath = req.file.path;

    const rows = await parseCsvFile(filePath);

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "CSV is empty",
      });
    }

    const publicationsToInsert = [];
    const errors = [];

    // 🔥 preload scholars (optimization)
    const scholars = await Scholar.find({});
    const scholarMap = new Map();

    scholars.forEach((s) => {
      scholarMap.set(s.email.toLowerCase(), s);
    });

    for (let row of rows) {
      try {
        if (!row.email || !row.type || !row.title) {
          errors.push({
            row: row.__rowNumber,
            message: "Missing required fields (email/type/title)",
          });
          continue;
        }

        const scholar = scholarMap.get(row.email.toLowerCase());

        if (!scholar) {
          errors.push({
            row: row.__rowNumber,
            message: "Scholar not found",
          });
          continue;
        }

        // 🧠 Create publication object
        const publicationObj = {
          scholar: scholar._id,

          type: row.type,
          title: row.title,

          name: row.name || "NA",

          category: row.category || "Other",

          impactFactor: row.impactfactor ? Number(row.impactfactor) : 0,

          scopusIndex: row.scopusindex || "NA",

          conferenceDate: row.conferencedate || null,
          conferenceVenue: row.conferencevenue || "NA",

          applicationNo: row.applicationno
            ? Number(row.applicationno)
            : null,

          dateOfFiled: row.dateoffiled || null,
          dateOfFER: row.dateoffer || null,
          dateOfGrant: row.dateofgrant || null,

          grantNo: row.grantno ? Number(row.grantno) : null,

          publisher: row.publisher || "NA",

          status: row.status || "communicated",

          communicationDate: row.communicationdate || null,

          isbn: row.isbn || "NA",

          volumeNo: row.volumeno ? Number(row.volumeno) : null,

          articleNo: row.articleno ? Number(row.articleno) : null,

          publishedYear: row.publishedyear || "NA",

          link: row.link || "NA",
        };

        publicationsToInsert.push(publicationObj);

      } catch (err) {
        errors.push({
          row: row.__rowNumber,
          message: err.message,
        });
      }
    }

    // 🚀 insert
    if (publicationsToInsert.length > 0) {
      await Publication.insertMany(publicationsToInsert, {
        ordered: false,
      });
    }

    fs.unlinkSync(filePath);

    return res.status(200).json({
      success: true,
      inserted: publicationsToInsert.length,
      failed: errors.length,
      errors,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Publication bulk upload failed",
      error: error.message,
    });
  }
};
