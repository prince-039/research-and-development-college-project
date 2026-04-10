const Research = require("../models/research.model");
const ApiResponse = require("../utils/ApiResponse");

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

    if (type === "area" && (!req.body.title || !req.body.description)) {
      return ApiResponse.error(
        "Title and description are required for research areas",
        400
      ).send(res);
    }

    if (
      type === "scholar" &&
      (!req.body.name || !req.body.roll || !req.body.thesis || !req.body.guide)
    ) {
      return ApiResponse.error(
        "Name, roll, thesis and guide are required for scholars",
        400
      ).send(res);
    }

    const payload = {
      ...req.body,
      faculty: Array.isArray(req.body.faculty)
        ? req.body.faculty
        : typeof req.body.faculty === "string" && req.body.faculty.trim()
        ? req.body.faculty
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    };

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
    const {id}=req.params;

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
    const updateData = {
      ...req.body,
      faculty: Array.isArray(req.body.faculty)
        ? req.body.faculty
        : typeof req.body.faculty === "string"
        ? req.body.faculty
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    };

    const researchItem = await Research.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

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

    return ApiResponse.success(
      null,
      "Research Deleted Successfully!"
    ).send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

module.exports = {
  getResearchController,
  addResearchController,
  myResearchController,
  updateResearchController,
  deleteResearchController,
};
