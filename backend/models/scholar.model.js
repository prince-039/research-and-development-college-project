const mongoose = require("mongoose");

const scholarSchema = new mongoose.Schema({
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
    unique: true
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
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true,
    select: false 
  },

  semesters: [
    {
      name : String, 
      date: Date,
      registrationSlip : String,
      FeeReceipt : String,
      dpfForm : String
    }
  ],
   courseWork: {
        status: {
          type: String,
          enum: ["yes", "no"]
        },
        date: Date
      },

      comprehensiveExam: {
        status: {
          type: String,
          enum: ["yes", "no"]
        },
        date: Date
      },

      seminar: {
        topic: String,
        dateRegistration : Date,
        datePresentation : Date
      },

      thesis: {
        submissionSeminar: {
          status: String,
          date: Date
        },
        preSubmissionSeminar: {
          status: String,
          date: Date
        },
        openDefense: {
          status: String,
          date: Date
        }
      }

});

module.exports = mongoose.model("Scholar", scholarSchema);