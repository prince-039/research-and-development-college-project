const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const facultyDetailsSchema = new mongoose.Schema(
  {
    employeeId: {
      type: Number,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
    },
    profile: {
      type: String,
    },
    address: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    state: {
      type: String,
      required: false,
    },
    pincode: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    dob: {
      type: Date,
      required: false,
    },
    designation: {
      type: String,
      required: true,
    },
    joiningDate: {
      type: Date,
      required: false,
    },
    salary: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: false,
    },
    password: {
      type: String,
      required: false,
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
