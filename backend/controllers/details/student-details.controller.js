const studentDetails = require("../../models/details/student-details.model");
const Branch = require("../../models/branch.model");
const resetToken = require("../../models/reset-password.model");
const bcrypt = require("bcryptjs");
const ApiResponse = require("../../utils/ApiResponse");
const jwt = require("jsonwebtoken");
const sendResetMail = require("../../utils/SendMail");
const mongoose = require("mongoose");
const fs = require("fs/promises");
const { parseCsvFile } = require("../../utils/csv.utils");

const isDatabaseConnected = () => mongoose.connection.readyState === 1;
const Scholar = require("../../models/scholar.model")

const resolveBranch = async (branchValue) => {
  const trimmedBranchValue = String(branchValue || "").trim();

  if (!trimmedBranchValue) {
    return null;
  }

  if (mongoose.Types.ObjectId.isValid(trimmedBranchValue)) {
    const branchById = await Branch.findById(trimmedBranchValue);
    if (branchById) {
      return branchById;
    }
  }

  const branchRegex = new RegExp(`^${trimmedBranchValue}$`, "i");
  return Branch.findOne({
    $or: [{ name: branchRegex }, { branchId: branchRegex }],
  });
};

const loginStudentController = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await studentDetails.findOne({ email });

    if (!user) {
      user = await Scholar.findOne({ email }).select("+password");
    }
    if(!user)
      return ApiResponse.notFound("User not found").send(res);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return ApiResponse.unauthorized("Invalid password").send(res);
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    let userType="";
    if(user.type)
      userType="scholar";

    return ApiResponse.success({ token, userType }, "Login successful").send(res);
  } catch (error) {
    console.error("Login Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const getAllDetailsController = async (req, res) => {
  try {
    const users = await studentDetails
      .find()
      .select("-__v -password")
      .populate("branchId");

    if (!users || users.length === 0) {
      return ApiResponse.notFound("No Student Found").send(res);
    }

    return ApiResponse.success(users, "Student Details Found!").send(res);
  } catch (error) {
    console.error("Get Details Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const registerStudentController = async (req, res) => {
  try {
    const profile = req.file?.filename || "";

    const {enrollmentNo} = req.body; 
    const email = `${enrollmentNo}@nitjsr.ac.in`;

    const user = await studentDetails.create({
      ...req.body,
      profile,
      password: "student123",
      email,
      enrollmentNo,
    });

    const sanitizedUser = await studentDetails
      .findById(user._id)
      .select("-__v -password");

    return ApiResponse.created(sanitizedUser, "Student Details Added!").send(
      res
    );
  } catch (error) {
    console.error("Add Details Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const bulkUploadStudentsController = async (req, res) => {
  try {
    if (!req.file) {
      return ApiResponse.badRequest("CSV file is required").send(res);
    }

    const rows = await parseCsvFile(req.file.path);
    await fs.unlink(req.file.path).catch(() => {});

    if (rows.length === 0) {
      return ApiResponse.badRequest(
        "CSV file must contain at least one student row"
      ).send(res);
    }

    const inserted = [];
    const errors = [];
    const seenEmails = new Set();
    const seenPhones = new Set();
    const seenEnrollmentNumbers = new Set();

    for (const row of rows) {
      try {
        const firstName = String(row.firstname || "").trim();
        const middleName = String(row.middlename || "").trim();
        const lastName = String(row.lastname || "").trim();
        const phone = String(row.phone || "").trim();
        const semester = Number(row.semester || 0);
        const branchInput = row.branchid || row.branch || row.branchname;
        const gender = String(row.gender || "").trim().toLowerCase();
        const dob = String(row.dob || "").trim();
        const address = String(row.address || "").trim();
        const city = String(row.city || "").trim();
        const state = String(row.state || "").trim();
        const pincode = String(row.pincode || "").trim();
        const country = String(row.country || "").trim();
        const bloodGroup = String(row.bloodgroup || "").trim();
        const status = String(row.status || "active").trim().toLowerCase();
        const emergencyContact = {
          name: String(row.emergencycontactname || "").trim(),
          relationship: String(
            row.emergencycontactrelationship || ""
          ).trim(),
          phone: String(row.emergencycontactphone || "").trim(),
        };

        if (
          !firstName ||
          !lastName ||
          !phone ||
          !semester ||
          !branchInput ||
          !gender ||
          !dob ||
          !address ||
          !city ||
          !state ||
          !pincode ||
          !country
        ) {
          throw new Error(
            "Missing required fields. Required: firstName, lastName, phone, semester, branch, gender, dob, address, city, state, pincode, country"
          );
        }

        if (!/^\d{10}$/.test(phone)) {
          throw new Error("Phone number must be exactly 10 digits");
        }

        if (!["male", "female", "other"].includes(gender)) {
          throw new Error("Gender must be male, female, or other");
        }

        if (!["active", "inactive"].includes(status)) {
          throw new Error("Status must be active or inactive");
        }

        const branch = await resolveBranch(branchInput);
        if (!branch) {
          throw new Error(`Branch not found for "${branchInput}"`);
        }

        let enrollmentNo = String(row.enrollmentno || "").trim();
        if (!enrollmentNo) {
          enrollmentNo = await generateUniqueEnrollmentNo();
        }

        const email =
          String(row.email || "").trim() || `${enrollmentNo}@nitjsr.ac.in`;

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new Error("Invalid email format");
        }

        if (seenEmails.has(email.toLowerCase())) {
          throw new Error("Duplicate email in uploaded file");
        }

        if (seenPhones.has(phone)) {
          throw new Error("Duplicate phone number in uploaded file");
        }

        if (seenEnrollmentNumbers.has(enrollmentNo)) {
          throw new Error("Duplicate enrollment number in uploaded file");
        }

        const existingStudent = await studentDetails.findOne({
          $or: [{ email }, { phone }, { enrollmentNo }],
        });

        if (existingStudent) {
          throw new Error(
            "Student with the same email, phone, or enrollment number already exists"
          );
        }

        const createdStudent = await studentDetails.create({
          enrollmentNo,
          firstName,
          middleName: middleName || "-",
          lastName,
          email,
          phone,
          semester,
          branchId: branch._id,
          gender,
          dob,
          address,
          city,
          state,
          pincode,
          country,
          profile: "",
          status,
          bloodGroup: bloodGroup || undefined,
          emergencyContact,
          password: "student123",
        });

        inserted.push({
          _id: createdStudent._id,
          enrollmentNo: createdStudent.enrollmentNo,
          email: createdStudent.email,
        });
        seenEmails.add(email.toLowerCase());
        seenPhones.add(phone);
        seenEnrollmentNumbers.add(enrollmentNo);
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
        ? "Student bulk upload processed"
        : "No students were uploaded"
    ).send(res);
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    console.error("Bulk Upload Students Error: ", error);
    return ApiResponse.internalServerError(
      error.message || "Student bulk upload failed"
    ).send(res);
  }
};

const signupStudentController = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return ApiResponse.error(
        "Database not connected. Please start MongoDB and try again.",
        503
      ).send(res);
    }

      const {
        firstName,
        middleName,
        lastName,
        enrollmentNo,
        email,
        phone,
      semester,
      branchId,
      gender,
      dob,
      address,
      city,
      state,
      pincode,
      country,
      password,
      } = req.body;
      const normalizedMiddleName = String(middleName || "").trim();
      const normalizedEnrollmentNo = String(enrollmentNo || "").trim();
      const normalizedSemester = Number(semester);

    if (
        !firstName ||
        !lastName ||
        !enrollmentNo ||
        !email ||
      !phone ||
      !semester ||
      !branchId ||
      !gender ||
      !dob ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      !country ||
      !password
    ) {
      return ApiResponse.badRequest("Please fill in all required fields").send(
        res
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return ApiResponse.badRequest("Invalid email format").send(res);
    }

      if (!/^\d{10}$/.test(phone)) {
        return ApiResponse.badRequest("Phone number must be 10 digits").send(res);
      }

      if (!normalizedEnrollmentNo) {
        return ApiResponse.badRequest("Enrollment number is required").send(res);
      }

    if (password.length < 8) {
      return ApiResponse.badRequest(
        "Password must be at least 8 characters long"
      ).send(res);
    }

    if (Number.isNaN(normalizedSemester) || normalizedSemester <= 0) {
      return ApiResponse.badRequest("Invalid semester").send(res);
    }

    const branchValue = String(branchId).trim();
    let resolvedBranch = null;

    if (mongoose.Types.ObjectId.isValid(branchValue)) {
      resolvedBranch = await Branch.findById(branchValue);
    }

    if (!resolvedBranch) {
      const branchRegex = new RegExp(`^${branchValue}$`, "i");
      resolvedBranch = await Branch.findOne({
        $or: [{ name: branchRegex }, { branchId: branchRegex }],
      });
    }

    if (!resolvedBranch) {
      const normalizedBranch = branchValue.toUpperCase();
      try {
        resolvedBranch = await Branch.create({
          branchId: normalizedBranch,
          name: normalizedBranch,
        });
      } catch (branchError) {
        if (branchError.code === 11000) {
          resolvedBranch = await Branch.findOne({
            $or: [{ name: normalizedBranch }, { branchId: normalizedBranch }],
          });
        } else {
          throw branchError;
        }
      }
    }

    if (!resolvedBranch) {
      return ApiResponse.internalServerError("Unable to resolve branch").send(
        res
      );
    }

      const existingStudent = await studentDetails.findOne({
        $or: [{ email }, { phone }, { enrollmentNo: normalizedEnrollmentNo }],
      });

      if (existingStudent) {
        return ApiResponse.conflict(
          "Student with this email, phone, or enrollment number already exists"
        ).send(res);
      }
  
      const user = await studentDetails.create({
        firstName,
        middleName: normalizedMiddleName || "-",
        lastName,
        enrollmentNo: normalizedEnrollmentNo,
        email,
      phone,
      semester: normalizedSemester,
      branchId: resolvedBranch._id,
      gender,
      dob,
      address,
      city,
        state,
        pincode,
        country,
        password,
        profile: "",
        status: "active",
    });

    const sanitizedUser = await studentDetails
      .findById(user._id)
      .select("-__v -password")
      .populate("branchId");

    return ApiResponse.created(
      sanitizedUser,
      "Student account created successfully"
    ).send(res);
  } catch (error) {
    console.error("Student Signup Error: ", error);
    return ApiResponse.internalServerError(
      error.message || "Student signup failed"
    ).send(res);
  }
};

const getMyDetailsController = async (req, res) => {
  try {
    const user = await studentDetails
      .findById(req.userId)
      .select("-password -__v")
      .populate("branchId");

    if (!user) {
      return ApiResponse.notFound("User not found").send(res);
    }

    return ApiResponse.success(user, "My Details Found!").send(res);
  } catch (error) {
    console.error("Get My Details Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const updateDetailsController = async (req, res) => {
  try {
    if (!req.params.id) {
      return ApiResponse.badRequest("Student ID is required").send(res);
    }

    const updateData = { ...req.body };
    const { email, phone, password, enrollmentNo } = updateData;

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return ApiResponse.badRequest("Invalid email format").send(res);
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      return ApiResponse.badRequest("Phone number must be 10 digits").send(res);
    }

    if (password && password.length < 8) {
      return ApiResponse.badRequest(
        "Password must be at least 8 characters long"
      ).send(res);
    }

    if (phone) {
      const existingStudent = await studentDetails.findOne({
        _id: { $ne: req.params.id },
        phone: phone,
      });

      if (existingStudent) {
        return ApiResponse.conflict("Phone number already in use").send(res);
      }
    }

    if (email) {
      const existingStudent = await studentDetails.findOne({
        _id: { $ne: req.params.id },
        email: email,
      });

      if (existingStudent) {
        return ApiResponse.conflict("Email already in use").send(res);
      }
    }

    if (enrollmentNo) {
      const existingStudent = await studentDetails.findOne({
        _id: { $ne: req.params.id },
        enrollmentNo: enrollmentNo,
      });

      if (existingStudent) {
        return ApiResponse.conflict("Enrollment number already in use").send(
          res
        );
      }
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    if (req.file) {
      updateData.profile = req.file.filename;
    }

    if (updateData.dob) {
      updateData.dob = new Date(updateData.dob);
    }
    if (updateData.joiningDate) {
      updateData.joiningDate = new Date(updateData.joiningDate);
    }

    const updatedUser = await studentDetails
      .findByIdAndUpdate(req.params.id, updateData, { new: true })
      .select("-__v -password");

    if (!updatedUser) {
      return ApiResponse.notFound("Student not found").send(res);
    }

    return ApiResponse.success(updatedUser, "Updated Successfully!").send(res);
  } catch (error) {
    console.error("Update Details Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const deleteDetailsController = async (req, res) => {
  try {
    if (!req.params.id) {
      return ApiResponse.badRequest("Student ID is required").send(res);
    }

    const user = await studentDetails.findById(req.params.id);

    if (!user) {
      return ApiResponse.notFound("No Student Found").send(res);
    }

    await studentDetails.findByIdAndDelete(req.params.id);

    return ApiResponse.success(null, "Deleted Successfully!").send(res);
  } catch (error) {
    console.error("Delete Details Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const sendForgetPasswordEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return ApiResponse.badRequest("Email is required").send(res);
    }

    const user = await studentDetails.findOne({ email });

    if (!user) {
      return ApiResponse.notFound("No Student Found").send(res);
    }
    const resetTkn = jwt.sign(
      {
        _id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );

    await resetToken.deleteMany({
      type: "StudentDetails",
      userId: user._id,
    });

    const resetId = await resetToken.create({
      resetToken: resetTkn,
      type: "StudentDetails",
      userId: user._id,
    });

    await sendResetMail(user.email, resetId._id, "student");

    return ApiResponse.success(null, "Reset Mail Send Successful").send(res);
  } catch (error) {
    console.error("Send Reset Mail Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const updatePasswordHandler = async (req, res) => {
  try {
    const { resetId } = req.params;
    const { password } = req.body;
    if (!resetId || !password) {
      return ApiResponse.badRequest("Password and ResetId is Required").send(
        res
      );
    }

    const resetTkn = await resetToken.findById(resetId);

    if (!resetTkn) {
      return ApiResponse.notFound("No Reset Request Found").send(res);
    }

    const verifyToken = await jwt.verify(
      resetTkn.resetToken,
      process.env.JWT_SECRET
    );

    if (!verifyToken) {
      return ApiResponse.notFound("Token Expired").send(res);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await studentDetails.findByIdAndUpdate(verifyToken._id, {
      password: hashedPassword,
    });

    await resetToken.deleteMany({
      type: "StudentDetails",
      userId: verifyToken._id,
    });

    return ApiResponse.success(null, "Password Updated!").send(res);
  } catch (error) {
    console.error("Update Password Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const searchStudentsController = async (req, res) => {
  try {
    const { enrollmentNo, name, semester, branch } = req.body;
    let query = {};

    if (!enrollmentNo && !name && !semester && !branch) {
      return ApiResponse.badRequest("Select at least one filter").send(res);
    }

    if (enrollmentNo) {
      query.enrollmentNo = enrollmentNo;
    }

    if (name) {
      query.$or = [
        { firstName: { $regex: name, $options: "i" } },
        { middleName: { $regex: name, $options: "i" } },
        { lastName: { $regex: name, $options: "i" } },
      ];
    }

    if (semester) {
      query.semester = semester;
    }

    if (branch) {
      query.branchId = branch;
    }

    const students = await studentDetails
      .find(query)
      .select("-password -__v")
      .populate("branchId")
      .sort({ enrollmentNo: 1 });

    if (!students || students.length === 0) {
      return ApiResponse.notFound("No students found").send(res);
    }

    return ApiResponse.success(students, "Students found successfully").send(
      res
    );
  } catch (error) {
    console.error("Search Students Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const updateLoggedInPasswordController = async (req, res) => {
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

    const user = await studentDetails.findById(userId);
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

    await studentDetails.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });

    return ApiResponse.success(null, "Password updated successfully").send(res);
  } catch (error) {
    console.error("Update Password Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

module.exports = {
  loginStudentController,
  getAllDetailsController,
  registerStudentController,
  bulkUploadStudentsController,
  signupStudentController,
  updateDetailsController,
  deleteDetailsController,
  getMyDetailsController,
  sendForgetPasswordEmail,
  updatePasswordHandler,
  searchStudentsController,
  updateLoggedInPasswordController,
};
