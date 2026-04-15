const mongoose = require("mongoose");
const Scholar = require("../models/scholar.model");
const bcrypt = require("bcryptjs");
const ApiResponse = require("../utils/ApiResponse")


exports.createScholar = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      rollNo, 
      email, 
      enrollmentDate, 
      phone,
      password 
    } = req.body;

    if (!firstName || !lastName || !rollNo || !email || !enrollmentDate || !phone || !password) {
      return ApiResponse.created("Required fields missing").send(res);
    }

    const existing = await Scholar.findOne({ rollNo });
    if (existing) {
      return ApiResponse.created("Scholar with this roll number already exists").send(res);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const scholar = new Scholar({
      ...req.body,
      password: hashedPassword
    });

    const saved = await scholar.save();

    const result = saved.toObject();
    delete result.password;

    return ApiResponse.created(result, "Record Added.").send(res);

  } catch (error) {
    return ApiResponse.created(error.message).send(res);
  }
};

exports.bulkUploadController = async (req, res) => {
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
          type: "Regular",
          firstName: row.firstName,
          lastName: row.lastName,
          rollNo: row.rollNo,
          enrollmentDate: row.enrollmentDate,
          department: row.department || "Computer Science and Engineering",
          email: row.email,
          phone: row.phone,
          profile: row.profile,
          supervisor: row.supervisor,
          coSupervisor: row.coSupervisor,
        });

        const validationError = validateScholarPayload(payload);
        if (validationError) {
          throw new Error(validationError);
        }

        const normalizedRoll = String(payload.roll || "").trim().toLowerCase();
        if (seenRolls.has(normalizedRoll)) {
          throw new Error("Duplicate roll number in uploaded file");
        }

        const existingResearcher = await Scholar.findOne({
          type: "Regular",
          rollNo: payload.rollNo,
        });

        if (existingResearcher) {
          throw new Error("Researcher with this roll number already exists");
        }

        const createdResearcher = await Scholar.create(payload);
        inserted.push({
          _id: createdResearcher._id,
          firstName: createdResearcher.firstName,
          lastName: createdResearcher.lastName,
          rollNo: createdResearcher.rollNo,
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

exports.getAllScholars = async (req, res) => {
  try {
    const scholars = await Scholar.find()
      .populate("supervisor", "firstName lastName")
      .populate("coSupervisor", "firstName lastName");
    if(!scholars)
      return ApiResponse.created([], "No Record!").send(res);

    return ApiResponse.created(scholars, "Data fetched Successfully!").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

exports.getScholar = async (req, res) => {
  try {
    const id = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.created("Wrong request!").send(res);
    }

    const scholar = await Scholar.findById(id)
      .populate("supervisor", "firstName lastName")
      .populate("coSupervisor", "firstName lastName")
      .populate("srcCommittee.member", "firstName lastName");

    if (!scholar) {
      return ApiResponse.created("No Record!").send(res);
    }

    return ApiResponse.created(scholar, "Data fetched!").send(res);
  } catch (error) {
    return ApiResponse.created(error.message).send(res);
  }
};

exports.findScholar = async (req, res) => {
  try {
    const id = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.created("Wrong request!").send(res);
    }

    const scholars = await Scholar.find({
      $or: [
        { supervisor: id },
        { coSupervisor: id },
        { "srcCommittee.member": id }
      ] 
    });

    if (!scholars) {
      return ApiResponse.created("No Record!").send(res);
    }

    const scholarsWithRelation = scholars.map((scholar) => {
      let relation = [];

      if (scholar.supervisor?.toString() === id.toString()) {
        relation.push("Supervisor");
      }

      if (scholar.coSupervisor?.toString() === id.toString()) {
        relation.push("Co-Supervisor");
      }

      const isCommittee = scholar.srcCommittee?.some(
        (m) => m.member?.toString() === id.toString()
      );

      if (isCommittee) {
        relation.push("Committee Member");
      }

      return {
        ...scholar.toObject(),
        relation
      };
    });

    return ApiResponse.created(scholarsWithRelation, "Data fetched!").send(res);
  } catch (error) {
    return ApiResponse.created(error.message).send(res);
  }
};

exports.getScholarById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.created("Wrong request!").send(res);
    }

    const scholar = await Scholar.findById(id)
      .populate("supervisor", "firstName lastName")
      .populate("coSupervisor", "firstName lastName")
      .populate("srcCommittee.member", "firstName lastName");

    if (!scholar) {
      return ApiResponse.created("No Record!").send(res);
    }

    return ApiResponse.created(scholar, "Data fetched!").send(res);
  } catch (error) {
    return ApiResponse.created(error.message).send(res);
  }
};


exports.updateScholar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.created("Wrong request!").send(res);
    }

    const updated = await Scholar.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("supervisor", "name")
      .populate("coSupervisor", "name")
      .populate("srcCommittee.member", "name");

    if (!updated) {
      return ApiResponse.created("Scholar not found").send(res);
    }

    return ApiResponse.created(updated, "Record updated!").send(res);
  } catch (error) {
    return ApiResponse.created(error.message).send(res);
  }
};


exports.deleteScholar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.created("Wrong request!").send(res);
    }

    const deleted = await Scholar.findByIdAndDelete(id);

    if (!deleted) {
      return ApiResponse.created("Record not found").send(res);
    }

    return ApiResponse.created("Record deleted successfully").send(res);
  } catch (error) {
    return ApiResponse.created(error.message).send(res);
  }
};