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

    // Check if hostel already exists for the college
    const existingHostel = await Hostel.findOne({ name, college: collegeId });
    if (existingHostel) {
      return res.status(400).json({ message: "Hostel already exists" });
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
    const hostelId = req.params.hostelId;
    const { name, gender, totalRooms, roomCapacity } = req.body;

    const existingHostel = await Hostel.findById(hostelId);
    if (!existingHostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    if (roomCapacity && ![1, 2, 3].includes(roomCapacity)) {
      return res.status(400).json({
        message: "Room capacity must be 1, 2, or 3",
      });
    }

    if (gender && !["male", "female", "other"].includes(gender)) {
      return res.status(400).json({
        message: "Gender must be male, female, or other",
      });
    }

    if (name) {
      const duplicateHostel = await Hostel.findOne({
        _id: { $ne: hostelId },
        name: name,
        college: existingHostel.college,
      });

      if (duplicateHostel) {
        return res.status(400).json({
          message: "Another hostel with this name already exists",
        });
      }
    }

    // Build update object dynamically
    const updateFields = {};
    if (name) updateFields.name = name;
    if (gender) updateFields.gender = gender;
    if (totalRooms !== undefined) updateFields.totalRooms = totalRooms;
    if (roomCapacity !== undefined) updateFields.roomCapacity = roomCapacity;

    const updatedHostel = await Hostel.findByIdAndUpdate(
      hostelId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate("college");

    res.status(200).json({
      success: true,
      data: updatedHostel,
      message: "Hostel updated successfully",
    });
  } catch (err) {
    console.error("Update Hostel Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update hostel",
      error: err.message,
    });
  }
};
