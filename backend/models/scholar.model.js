const mongoose = require("mongoose");

const scholarSchema = new mongoose.Schema({
  type : {
    type : String,
    enum : ["Regular", "Part-Time"],
    required : true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
  },
  rollNo: {
    type: String,
    required: true,
    unique: true,
    trim : true
  },
  enrollmentDate: {
    type: Date
  },

  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FacultyDetail",
    required: true     
  },

  coSupervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FacultyDetail",
  },

  srcCommittee: [
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacultyDetail",
      required: true
    },
    designation: {
      type: String,
    }
  }
  ],
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true
  },

  phone: {
    type: String,
    required: true
  },
  profile:{
    type: String
  },

  password: {
    type: String,
    required: true,
    select: false 
  },

  semesters: [
    {
      name : String,
      registrationSlip : String,
      FeeReceipt : String,
      dpfForm : String
    }
  ],
  courseWork: {
    status: {
      type: String,
      enum: ["yes", "no", "NA"],
      default: "NA"
    },
    date: Date
  },

  comprehensiveExam: {
    status: {
      type: String,
      enum: ["yes", "no", "NA"],
      default: "NA"
    },
    date: Date
  },

  seminar: {
    topic: String,
    dateRegistration : Date,
    datePresentation : Date
  },

  stipendEnhancementSeminar: {
    status: {type : String, 
      enum :["yes", "no", "NA"],
      default : "NA"
    },
    date: Date
  },
  preSubmissionSeminar: {
    status: {type : String, 
      enum :["yes", "no", "NA"],
      default : "NA"
    },
    date: Date
  },
  openDefense: {
    status: {type : String, 
      enum :["yes", "no", "NA"],
      default : "NA"
    },
    date: Date
  }

}, {timestamps : true});

module.exports = mongoose.model("Scholar", scholarSchema);