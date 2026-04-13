const mongoose = require("mongoose");

const publicationSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["journal", "conference", "bookChapter", "patent"],
      required: true,
    },
    title: {
      type: String,
      trim: true,
      required: true,
    },
    publicationName: {
      type: String,
      trim: true,
      default: "",
    },
    applicationNumber: {
      type: String,
      trim: true,
      default: "",
    },
    scopusIndex: {
      type: String,
      trim: true,
      default: "",
    },
    dateOfConference: {
      type: String,
      trim: true,
      default: "",
    },
    venueOfConference: {
      type: String,
      trim: true,
      default: "",
    },
    publisher: {
      type: String,
      trim: true,
      default: "",
    },
    dateOfFiled: {
      type: String,
      trim: true,
      default: "",
    },
    dateOfFer: {
      type: String,
      trim: true,
      default: "",
    },
    dateOfGrant: {
      type: String,
      trim: true,
      default: "",
    },
    grantNumber: {
      type: String,
      trim: true,
      default: "",
    },
    publicationType: {
      type: String,
      trim: true,
      default: "",
    },
    impactFactor: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      trim: true,
      default: "",
    },
    dateOfCommunication: {
      type: String,
      trim: true,
      default: "",
    },
    isbn: {
      type: String,
      trim: true,
      default: "",
    },
    volumeNumber: {
      type: String,
      trim: true,
      default: "",
    },
    articleNumber: {
      type: String,
      trim: true,
      default: "",
    },
    publishYear: {
      type: String,
      trim: true,
      default: "",
    },
    link: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const researchSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["area", "scholar"],
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    faculty: {
      type: [String],
      default: [],
    },
    name: {
      type: String,
      trim: true,
    },
    roll: {
      type: String,
      trim: true,
    },
    thesis: {
      type: String,
      trim: true,
    },
    year: {
      type: String,
      trim: true,
    },
    guide: {
      type: String,
      trim: true,
    },
    programType: {
      type: String,
      enum: ["regular", "partTime"],
      default: "regular",
    },
    department: {
      type: String,
      trim: true,
      default: "Computer Science and Engineering",
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    profileImage: {
      type: String,
      trim: true,
      default: "",
    },
    semesterRegistration: {
      type: String,
      trim: true,
      default: "",
    },
    publications: {
      type: [publicationSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Research", researchSchema);
