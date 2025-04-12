const Hostel = require("../models/Hostel");
const College = require("../models/College");


// Fetch all hostels for a college
exports.getHostelsByCollege = async (req, res) => {
  try {
    const hostels = await Hostel.find({ college: req.params.collegeId });
    res.status(200).json(hostels);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Fetch a specific hostel by ID
exports.getHostelById = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.hostelId);
    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }
    res.status(200).json(hostel);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Create a new hostel (Admin only)
exports.createHostel = async (req, res) => {
  try {
    const { name, gender, collegeId, totalRooms, roomCapacity } = req.body;

    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }

    const newHostel = new Hostel({
      name,
      gender,
      college: collegeId,
      totalRooms,
      roomCapacity,
    });

    await newHostel.save();
    res.status(201).json(newHostel);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Update hostel details (Admin only)
exports.updateHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findByIdAndUpdate(
      req.params.hostelId,
      req.body,
      { new: true }
    );
    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }
    res.status(200).json(hostel);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};
