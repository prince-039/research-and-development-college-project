const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const facultyDetailsSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      trim:true,
      required: true,
    },
    phone: {
      type: String,
    },
    profile: {
      type: String,
    },
    address: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    dob: {
      type: Date,
    },
    designation: {
      type: String,
      required: true,
    },
    joiningDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""],
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    password: {
      type: String,
      required: true,
    },
    publications: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Publication",
    },
  },
  { timestamps: true }
);

facultyDetailsSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

const facultyDetails = mongoose.model("FacultyDetail", facultyDetailsSchema);

module.exports = facultyDetails;
