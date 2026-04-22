const mongoose = require("mongoose");
const Scholar = require("../models/scholar.model");
const bcrypt = require("bcryptjs");
const ApiResponse = require("../utils/ApiResponse")
const { parseCsvFile } = require("../utils/csv.utils");
const fs = require("fs");

const FacultyDetail = require("../models/details/faculty-details.model.js");

exports.createScholar = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      rollNo, 
      email, 
      enrollmentDate, 
      phone,
    } = req.body;

    if (!firstName || !lastName || !rollNo || !email || !enrollmentDate || !phone) {
      return ApiResponse.badRequest("Required fields missing").send(res);
    }

    if (req.body.coSupervisor === "") {
      delete req.body.coSupervisor;
    }

    const existing = await Scholar.findOne({ rollNo });
    if (existing) {
      return ApiResponse.success("Scholar with this roll number already exists").send(res);
    }
    const password="student123";
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
    return ApiResponse.error(error.message).send(res);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    if (!currentPassword || !newPassword) {
      return ApiResponse.badRequest(
        "Current password and new password are required"
      ).send(res);
    }

    if (newPassword.length < 8) {
      return ApiResponse.badRequest(
        "New password must be at least 8 characters long"
      ).send(res);
    }

    const user = await Scholar.findById(userId).select("+password");
    if (!user) {
      return ApiResponse.notFound("User not found").send(res);
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return ApiResponse.unauthorized("Current password is incorrect").send(
        res
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await Scholar.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });

    return ApiResponse.success(null, "Password updated successfully").send(res);
  } catch (error) {
    console.error("Update Password Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

exports.addScholarByFaculty = async (req, res) => {
  try {
    const facultyId = req.userId;
    const { association, ...scholarData } = req.body;

    if(!scholarData.email){
      return ApiResponse.badRequest("Email required").send(res);
    }

    const exist= await Scholar.findOne({email : scholarData.email});
    if(exist){
      return ApiResponse.success("Already exist with email.").send(res);
    }
  
    if (!association) {
      return ApiResponse.badRequest("Association type required (supervisor / coSupervisor)").send(res);
    }

    if (association === "supervisor") {
      scholarData.supervisor = facultyId;
    } else if (association === "coSupervisor") {
      scholarData.coSupervisor = facultyId;
    } else {
      return ApiResponse.badRequest("Invalid association type").send(res);
    }

    scholarData.password=scholarData.firstName+"123";
    const scholar = await Scholar.create(scholarData);

    return ApiResponse.created(scholar, "Scholar added successfully").send(res);

  } catch (error) {
    console.error("Add Scholar Error:", error);
    return ApiResponse.error(error, "Server error").send(res);
  }
};

exports.initializeSemester = async (req, res) => {
  try {
    const {id, sem} = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.badRequest("Invalid ID").send(res);
    }

    if (!sem) {
      return ApiResponse.badRequest("Semester name requiered").send(res);
    }

    const exist= await Scholar.findById(id);
    if(!exist){
      return ApiResponse.success("Scholar not exist.").send(res);
    }

    const alreadyExists = exist.semesters.some(s => s.name === sem);

    if (!alreadyExists) {
      exist.semesters.push({
        name: sem,
        registrationSlip: "",
        FeeReceipt: "",
        dpfForm: ""
      });
    }
    await exist.save();

    return ApiResponse.created(exist, "Scholar added successfully").send(res);

  } catch (error) {
    return ApiResponse.error(error, "Server error").send(res);
  }
};

exports.getAllScholars = async (req, res) => {
  try {
    const scholars = await Scholar.find()
      .populate("supervisor", "firstName lastName")
      .populate("coSupervisor", "firstName lastName");
    if(!scholars)
      return ApiResponse.success([], "No Record!").send(res);

    return ApiResponse.success(scholars, "Data fetched Successfully!").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

exports.getScholar = async (req, res) => {
  try {
    const id = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.badRequest("Wrong request!").send(res);
    }

    const scholar = await Scholar.findById(id)
      .populate("supervisor", "firstName lastName")
      .populate("coSupervisor", "firstName lastName")
      .populate("srcCommittee.member", "firstName lastName");

    if (!scholar) {
      return ApiResponse.success("No Record!").send(res);
    }

    return ApiResponse.success(scholar, "Data fetched!").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

exports.findScholar = async (req, res) => {
  try {
    const id = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.badRequest("Wrong request!").send(res);
    }

    const scholars = await Scholar.find({
      $or: [
        { supervisor: id },
        { coSupervisor: id },
        { "srcCommittee.member": id }
      ] 
    });

    if (!scholars) {
      return ApiResponse.success("No Record!").send(res);
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

    return ApiResponse.success(scholarsWithRelation, "Data fetched!").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

exports.getScholarById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.badRequest("Wrong request!").send(res);
    }

    const scholar = await Scholar.findById(id)
      .populate("supervisor", "firstName lastName email")
      .populate("coSupervisor", "firstName lastName email")
      .populate("srcCommittee.member", "firstName lastName email");

    if (!scholar) {
      return ApiResponse.success("No Record!").send(res);
    }

    return ApiResponse.success(scholar, "Data fetched!").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};


exports.updateSemester = async (req, res) => {
  try {
    // const id = req.userId;
    const { semesterIndex, fieldName, id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.badRequest("Invalid ID").send(res);
    }

    if (!req.file) {
      return ApiResponse.badRequest("No file uploaded").send(res);
    }

    const allowedFields = ["registrationSlip", "FeeReceipt", "dpfForm"];

    if (!allowedFields.includes(fieldName)) {
      return ApiResponse.badRequest("Invalid field name").send(res);
    }

    const scholar = await Scholar.findById(id);

    if (!scholar) {
      return ApiResponse.success("Scholar not found").send(res);
    }

    if (!scholar.semesters[semesterIndex]) {
      scholar.semesters[semesterIndex] = {};
    }

    scholar.semesters[semesterIndex][fieldName] = req.file.filename;

    await scholar.save();

    return ApiResponse.success(scholar, "File updated!").send(res);
  } catch (error) {
    console.log(error)
    return ApiResponse.error(error.message).send(res);
  }
};

exports.updateScholar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.badRequest("Wrong request!").send(res);
    }

    const updated = await Scholar.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("supervisor", "firstName lastName")
      .populate("coSupervisor", "firstName lastName")
      .populate("srcCommittee.member", "firstName lastName");

    if (!updated) {
      return ApiResponse.success("Scholar not found").send(res);
    }

    return ApiResponse.success(updated, "Record updated!").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};


exports.deleteScholar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.badRequest("Wrong request!").send(res);
    }

    const deleted = await Scholar.findByIdAndDelete(id);

    if (!deleted) {
      return ApiResponse.success("Record not found").send(res);
    }

    return ApiResponse.success("Record deleted successfully").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

exports.generalBulkUploader = async (req, res) => {
  try {
    const filePath = req.file.path;

    const rows = await parseCsvFile(filePath);

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "CSV is empty",
      });
    }

    const scholarsToInsert = [];
    const errors = [];

    //  preload faculty
    const facultyList = await FacultyDetail.find({});
    const facultyMap = new Map();

    facultyList.forEach((f) => {
      facultyMap.set(f.email.toLowerCase(), f);
    });

    //  preload existing scholars (for duplicate check)
    const existingScholars = await Scholar.find({}, "email rollNo");

    const existingEmails = new Set(
      existingScholars.map((s) => s.email.toLowerCase())
    );

    const existingRollNos = new Set(
      existingScholars.map((s) => s.rollNo)
    );

    for (let row of rows) {
      try {
        //  required fields
        if (!row.firstname || !row.rollno || !row.email || !row.phone || !row.supervisor) {
          errors.push({
            row: row.__rowNumber,
            message: "Missing required fields",
          });
          continue;
        }

        //  duplicate email check
        if (existingEmails.has(row.email.toLowerCase())) {
          errors.push({
            row: row.__rowNumber,
            message: "Duplicate email",
          });
          continue;
        }

        //  duplicate rollNo check
        if (existingRollNos.has(row.rollno)) {
          errors.push({
            row: row.__rowNumber,
            message: "Duplicate rollNo",
          });
          continue;
        }

        //  supervisor
        const supervisorDoc = facultyMap.get(row.supervisor.toLowerCase());
        if (!supervisorDoc) {
          errors.push({
            row: row.__rowNumber,
            message: "Supervisor not found",
          });
          continue;
        }

        //  co-supervisor
        let coSupervisorDoc = null;
        if (row.cosupervisor) {
          coSupervisorDoc = facultyMap.get(row.cosupervisor.toLowerCase());
        }

        //  SRC committee
        let srcCommittee = [];
        if (row.srccommittee) {
          const members = row.srccommittee.split(",");
          for (let email of members) {
            const faculty = facultyMap.get(email.trim().toLowerCase());
            if (faculty) {
              srcCommittee.push({
                member: faculty._id,
                designation: "Member",
              });
            }
          }
        }

        //  password hash
        const hashedPassword = await bcrypt.hash(
          row.password || "default123",
          10
        );

        //  scholar object
        const scholarObj = {
          type: row.type || "Regular",
          firstName: row.firstname,
          lastName: row.lastname || "NA",
          rollNo: row.rollno,
          enrollmentDate: row.enrollmentdate || null,

          supervisor: supervisorDoc._id,
          coSupervisor: coSupervisorDoc?._id,

          srcCommittee,

          email: row.email,
          phone: row.phone,
          profile: row.profile || "NA",

          password: hashedPassword,

          courseWork: {
            status: row.courseworkstatus || "NA",
            date: row.courseworkdate || null,
          },

          comprehensiveExam: {
            status: row.comprehensiveexamstatus || "NA",
            date: row.comprehensiveexamdate || null,
          },

          seminar: {
            topic: row.seminartopic || "NA",
            dateRegistration: row.seminarregdate || null,
            datePresentation: row.seminarpresdate || null,
          },

          stipendEnhancementSeminar: {
            status: row.stipendstatus || "NA",
            date: row.stipenddate || null,
          },

          preSubmissionSeminar: {
            status: row.presubmissionstatus || "NA",
            date: row.presubmissiondate || null,
          },

          openDefense: {
            status: row.opendefensestatus || "NA",
            date: row.opendefensedate || null,
          },
        };

        scholarsToInsert.push(scholarObj);

        //  update sets (important for duplicates inside same CSV)
        existingEmails.add(row.email.toLowerCase());
        existingRollNos.add(row.rollno);

      } catch (err) {
        errors.push({
          row: row.__rowNumber,
          message: err.message,
        });
      }
    }

    //  insert
    let insertedCount = 0;

    if (scholarsToInsert.length > 0) {
      try {
        const result = await Scholar.insertMany(scholarsToInsert, {
          ordered: false,
        });
        insertedCount = result.length;
      } catch (err) {
        // ignore duplicate DB errors
        insertedCount = scholarsToInsert.length;
      }
    }

    //  delete file
    fs.unlinkSync(filePath);

    return res.status(200).json({
      success: true,
      inserted: insertedCount,
      failed: errors.length,
      errors,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Bulk upload failed",
      error: error.message,
    });
  }
};

exports.semesterBulkUploader = async (req, res) => {
  try {
    const filePath = req.file.path;

    const rows = await parseCsvFile(filePath);

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "CSV is empty",
      });
    }

    const errors = [];
    let successCount = 0;

    //  preload scholars
    const scholars = await Scholar.find({});
    const scholarMap = new Map();

    scholars.forEach((s) => {
      scholarMap.set(s.email.toLowerCase(), s);
    });

    //  track duplicates inside same CSV
    const processed = new Set();

    for (let row of rows) {
      try {
        // email required
        if (!row.email) {
          errors.push({
            row: row.__rowNumber,
            message: "Email is required",
          });
          continue;
        }

        const emailKey = row.email.toLowerCase();
        const scholar = scholarMap.get(emailKey);

        if (!scholar) {
          errors.push({
            row: row.__rowNumber,
            message: "Scholar not found",
          });
          continue;
        }

        //  prevent duplicate semester in same CSV
        const uniqueKey = `${emailKey}_${row.name || "NA"}`;
        if (processed.has(uniqueKey)) {
          errors.push({
            row: row.__rowNumber,
            message: "Duplicate semester in CSV",
          });
          continue;
        }

        //  prevent duplicate semester in DB
        const alreadyExists = scholar.semesters.some(
          (sem) =>
            (sem.name || "").toLowerCase() ===
            (row.name || "NA").toLowerCase()
        );

        if (alreadyExists) {
          errors.push({
            row: row.__rowNumber,
            message: "Semester already exists for this scholar",
          });
          continue;
        }

        //  semester object
        const semesterObj = {
          name: row.name || "NA",
          registrationSlip: row.registrationslip || "NA",
          FeeReceipt: row.feereceipt || "NA",
          dpfForm: row.dpfform || "NA",
        };

        //  push
        scholar.semesters.push(semesterObj);

        //  mark processed
        processed.add(uniqueKey);

        successCount++;

      } catch (err) {
        errors.push({
          row: row.__rowNumber,
          message: err.message,
        });
      }
    }

    //  save only modified scholars
    const savePromises = [];

    scholarMap.forEach((scholar) => {
      if (scholar.isModified("semesters")) {
        savePromises.push(scholar.save());
      }
    });

    await Promise.all(savePromises);

    //  delete file
    fs.unlinkSync(filePath);

    return res.status(200).json({
      success: true,
      updated: successCount,
      failed: errors.length,
      errors,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Semester bulk upload failed",
      error: error.message,
    });
  }
};

