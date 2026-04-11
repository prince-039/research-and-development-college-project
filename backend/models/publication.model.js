const mongoose = require("mongoose");

const publicationSchema = new mongoose.Schema({
  scholar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Scholar",
    required: true
  },

  type: {
    type: String,
    enum: ["journal", "conference", "book-chapter", "patent"],
    required: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  name: {
    type: String, 
    trim: true
  },

  category: {
    type: String,
    enum: ["SCI", "SCIE", "Scopus", "Other"],
    default: "Other"
  },

  impactFactor: {
  type: Number,
  min: 0,
  default: 0
},

  scopusIndex: {
  type: String,
  enum: ["yes", "no", "NA"],
  default: "NA"
},

  applicationNo: {
    type: Number
  },

  dateOfFiled: {
    type: Date,
    default: null
  },

  dateOfFER: {
    type: Date,
    default: null
  },

  dateOfGrant: {
    type: Date,
    default: null
  },

  grantNo: {
    type: Number
  },

  publisher: {
    type: String,
    trim: true
  },

  status: {
    type: String,
    enum: ["published", "accepted", "submitted", "communicated", "under review", "filed", "fer", "grant"],
    default: "submitted"
  },

  communicationDate: {
    type: Date,
    default: null
  },

  isbn: {
    type: String,
    default: "NA"
  },

  volume: {
    type: Number
  },

  articleNo: {
    type: Number
  },

  publishedYear: {
    type: String,
    trim: true,
    default: "NA"
  },

  link: {
    type: String,
    trim: true,
    default: "NA"
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Publication", publicationSchema);