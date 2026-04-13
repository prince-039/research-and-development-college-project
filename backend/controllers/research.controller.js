const Research = require("../models/research.model");
const ApiResponse = require("../utils/ApiResponse");
const fs = require("fs/promises");
const { parseCsvFile } = require("../utils/csv.utils");

const normalizeFaculty = (faculty) => {
  if (Array.isArray(faculty)) {
    return faculty.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof faculty === "string") {
    return faculty
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizePublication = (publication) => ({
  category: String(publication?.category || "").trim(),
  title: String(publication?.title || "").trim(),
  publicationName: String(publication?.publicationName || "").trim(),
  applicationNumber: String(publication?.applicationNumber || "").trim(),
  scopusIndex: String(publication?.scopusIndex || "").trim(),
  dateOfConference: String(publication?.dateOfConference || "").trim(),
  venueOfConference: String(publication?.venueOfConference || "").trim(),
  publisher: String(publication?.publisher || "").trim(),
  dateOfFiled: String(publication?.dateOfFiled || "").trim(),
  dateOfFer: String(publication?.dateOfFer || "").trim(),
  dateOfGrant: String(publication?.dateOfGrant || "").trim(),
  grantNumber: String(publication?.grantNumber || "").trim(),
  publicationType: String(publication?.publicationType || "").trim(),
  impactFactor: String(publication?.impactFactor || "").trim(),
  status: String(publication?.status || "").trim(),
  dateOfCommunication: String(publication?.dateOfCommunication || "").trim(),
  isbn: String(publication?.isbn || "").trim(),
  volumeNumber: String(publication?.volumeNumber || "").trim(),
  articleNumber: String(publication?.articleNumber || "").trim(),
  publishYear: String(publication?.publishYear || "").trim(),
  link: String(publication?.link || "").trim(),
});

const normalizePayload = (body) => ({
  ...body,
  faculty: normalizeFaculty(body.faculty),
  publications: Array.isArray(body.publications)
    ? body.publications
        .map(normalizePublication)
        .filter((publication) => publication.category && publication.title)
    : [],
});

const validateScholarPayload = (payload) => {
  if (!payload.name || !payload.roll || !payload.department) {
    return "Name, roll and department are required for researchers";
  }

  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return "Invalid researcher email format";
  }

  if (payload.phone && !/^\+?[0-9\s-]{10,15}$/.test(payload.phone)) {
    return "Invalid researcher phone number";
  }

  if (
    payload.programType &&
    !["regular", "partTime"].includes(payload.programType)
  ) {
    return "Program type must be regular or partTime";
  }

  const invalidPublication = (payload.publications || []).find(
    (publication) =>
      !["journal", "conference", "bookChapter", "patent"].includes(
        publication.category
      )
  );

  if (invalidPublication) {
    return "Invalid publication category";
  }

  return null;
};

const getResearchController = async (req, res) => {
  try {
    const query = {};

    if (req.query.type && ["area", "scholar"].includes(req.query.type)) {
      query.type = req.query.type;
    }

    const researchItems = await Research.find(query).sort({
      type: 1,
      createdAt: -1,
    });

    if (!researchItems || researchItems.length === 0) {
      return ApiResponse.error("No Research Data Found", 404).send(res);
    }

    return ApiResponse.success(researchItems, "Research Data Loaded!").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

const addResearchController = async (req, res) => {
  try {
    const { type } = req.body;

    if (!type || !["area", "scholar"].includes(type)) {
      return ApiResponse.error("Valid research type is required", 400).send(res);
    }

    const payload = normalizePayload(req.body);

    if (type === "area" && (!payload.title || !payload.description)) {
      return ApiResponse.error(
        "Title and description are required for research areas",
        400
      ).send(res);
    }

    if (type === "scholar") {
      const validationError = validateScholarPayload(payload);
      if (validationError) {
        return ApiResponse.error(validationError, 400).send(res);
      }
    }

    const researchItem = await Research.create(payload);
    return ApiResponse.created(researchItem, "Research Added Successfully!").send(
      res
    );
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

const myResearchController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return ApiResponse.error("Bad Request", 401).send(res);
    }

    const data = await Research.findById(id);

    if (!data) {
      return ApiResponse.error("No Research Data Found", 404).send(res);
    }

    return ApiResponse.success(data, "Research Data Loaded!").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

const updateResearchController = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);

    if (payload.type === "area" && (!payload.title || !payload.description)) {
      return ApiResponse.error(
        "Title and description are required for research areas",
        400
      ).send(res);
    }

    if (payload.type === "scholar") {
      const validationError = validateScholarPayload(payload);
      if (validationError) {
        return ApiResponse.error(validationError, 400).send(res);
      }
    }

    const researchItem = await Research.findByIdAndUpdate(req.params.id, payload, {
      new: true,
    });

    if (!researchItem) {
      return ApiResponse.error("Research Item Not Found!", 404).send(res);
    }

    return ApiResponse.success(
      researchItem,
      "Research Updated Successfully!"
    ).send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

const deleteResearchController = async (req, res) => {
  try {
    const researchItem = await Research.findByIdAndDelete(req.params.id);

    if (!researchItem) {
      return ApiResponse.error("Research Item Not Found!", 404).send(res);
    }

    return ApiResponse.success(null, "Research Deleted Successfully!").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

const bulkUploadResearchController = async (req, res) => {
  try {
    if (!req.file) {
      return ApiResponse.badRequest("CSV file is required").send(res);
    }

    const rows = await parseCsvFile(req.file.path);
    await fs.unlink(req.file.path).catch(() => {});

    if (rows.length === 0) {
      return ApiResponse.badRequest(
        "CSV file must contain at least one researcher row"
      ).send(res);
    }

    const inserted = [];
    const errors = [];
    const seenRolls = new Set();

    for (const row of rows) {
      try {
        const payload = normalizePayload({
          type: "scholar",
          name: row.name,
          roll: row.roll,
          department: row.department || "Computer Science and Engineering",
          email: row.email,
          phone: row.phone,
          website: row.website,
          profileImage: row.profileimage,
          thesis: row.thesis,
          year: row.year,
          guide: row.guide,
          programType: row.programtype || "regular",
          semesterRegistration: row.semesterregistration,
          publications:
            row.publicationtitle || row.publicationcategory
              ? [
                  {
                    category: row.publicationcategory || "journal",
                    title: row.publicationtitle || "",
                    publicationName: row.publicationname || "",
                    applicationNumber: row.applicationnumber || "",
                    scopusIndex: row.scopusindex || "",
                    dateOfConference: row.dateofconference || "",
                    venueOfConference: row.venueofconference || "",
                    publisher: row.publisher || "",
                    dateOfFiled: row.dateoffiled || "",
                    dateOfFer: row.dateoffer || "",
                    dateOfGrant: row.dateofgrant || "",
                    grantNumber: row.grantnumber || "",
                    publicationType: row.publicationtype || "",
                    impactFactor: row.impactfactor || "",
                    status: row.status || "",
                    dateOfCommunication: row.dateofcommunication || "",
                    isbn: row.isbn || "",
                    volumeNumber: row.volumenumber || "",
                    articleNumber: row.articlenumber || "",
                    publishYear: row.publishyear || "",
                    link: row.link || "",
                  },
                ]
              : [],
        });

        const validationError = validateScholarPayload(payload);
        if (validationError) {
          throw new Error(validationError);
        }

        const normalizedRoll = String(payload.roll || "").trim().toLowerCase();
        if (seenRolls.has(normalizedRoll)) {
          throw new Error("Duplicate roll number in uploaded file");
        }

        const existingResearcher = await Research.findOne({
          type: "scholar",
          roll: payload.roll,
        });

        if (existingResearcher) {
          throw new Error("Researcher with this roll number already exists");
        }

        const createdResearcher = await Research.create(payload);
        inserted.push({
          _id: createdResearcher._id,
          name: createdResearcher.name,
          roll: createdResearcher.roll,
        });
        seenRolls.add(normalizedRoll);
      } catch (rowError) {
        errors.push({
          row: row.__rowNumber,
          message: rowError.message || "Invalid row",
        });
      }
    }

    return ApiResponse.success(
      {
        insertedCount: inserted.length,
        failedCount: errors.length,
        inserted,
        errors,
      },
      inserted.length > 0
        ? "Research bulk upload processed"
        : "No researchers were uploaded"
    ).send(res);
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    return ApiResponse.internalServerError(
      error.message || "Research bulk upload failed"
    ).send(res);
  }
};

module.exports = {
  getResearchController,
  addResearchController,
  myResearchController,
  updateResearchController,
  deleteResearchController,
  bulkUploadResearchController,
};
