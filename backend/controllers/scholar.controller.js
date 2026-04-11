const mongoose = require("mongoose");
const Scholar = require("../models/scholar.model");

const bcrypt = require("bcryptjs");


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
      return res.status(400).json({
        message: "Required fields missing"
      });
    }

    const existing = await Scholar.findOne({ rollNo });
    if (existing) {
      return res.status(400).json({
        message: "Scholar with this roll number already exists"
      });
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

    res.status(201).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getAllScholars = async (req, res) => {
  try {
    const scholars = await Scholar.find()
      .populate("supervisor", "name")
      .populate("coSupervisor", "name")
      .populate("srcCommittee.member", "name");

    res.status(200).json(scholars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getScholarById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const scholar = await Scholar.findById(id)
      .populate("supervisor", "name")
      .populate("coSupervisor", "name")
      .populate("srcCommittee.member", "name");

    if (!scholar) {
      return res.status(404).json({ message: "Scholar not found" });
    }

    res.status(200).json(scholar);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.updateScholar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
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
      return res.status(404).json({ message: "Scholar not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.deleteScholar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const deleted = await Scholar.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Scholar not found" });
    }

    res.status(200).json({ message: "Scholar deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};