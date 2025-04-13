const Student = require("../models/Student");
const RoommateRequest = require("../models/RoommateRequest");
const Allocation = require("../models/Allocation");
const Room = require("../models/Room");
const generateOtp = require("../utils/generateOtp");
const sendOtp = require("../utils/sendOtp");
const Hostel = require("../models/Hostel");

exports.sendRoommateRequest = async (req, res) => {
  console.log("[sendRoommateRequest] Starting roommate request process...");
  try {
    const { toRoll, hostelId } = req.body;
    const fromRoll = req.user.rollNo;
    const college = req.user.college;
    console.log(`[sendRoommateRequest] From: ${fromRoll}, To: ${toRoll}, Hostel: ${hostelId}`);

    // Validate students
    console.log("[sendRoommateRequest] Validating students...");
    const fromStudent = await Student.findOne({
      rollNo: fromRoll,
      college,
    }).populate("groupHostelChoice");
    const toStudent = await Student.findOne({
      rollNo: toRoll,
      college,
    });

    if (!fromStudent || !toStudent) {
      console.log("[sendRoommateRequest] Student(s) not found");
      return res.status(404).json({
        success: false,
        message: "One or both students not found in your college",
      });
    }
    console.log(`[sendRoommateRequest] Found students - From: ${fromStudent.name}, To: ${toStudent.name}`);

    // Validation checks
    if (fromStudent._id.equals(toStudent._id)) {
      console.log("[sendRoommateRequest] Self-request attempt detected");
      return res.status(400).json({ message: "Cannot send request to yourself" });
    }

    if (fromStudent.gender !== toStudent.gender) {
      console.log("[sendRoommateRequest] Gender mismatch detected");
      return res.status(400).json({ message: "Roommate must be same gender" });
    }

    if (fromStudent.isAllocated || toStudent.isAllocated) {
      return res.status(400).json({
        success: false,
        message: "One of the students is already allocated a room",
      });
    }

    if (fromStudent.groupId && fromStudent.groupId === toStudent.groupId) {
      return res.status(400).json({ message: "Already in the same group" });
    }

    if (toStudent.groupId && toStudent.groupId !== fromStudent.groupId) {
      return res
        .status(400)
        .json({ message: "Student already in another group" });
    }

    const existing = await RoommateRequest.findOne({
      $or: [
        { from: fromStudent._id, to: toStudent._id },
        { from: toStudent._id, to: fromStudent._id },
      ],
      status: "pending",
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Roommate request already pending" });
    }

    let groupId = fromStudent.groupId;
    let chosenHostel = fromStudent.groupHostelChoice;
    console.log(`[sendRoommateRequest] Current groupId: ${groupId}, hostelChoice: ${chosenHostel?._id}`);

    // First member case
    if (!groupId) {
      console.log("[sendRoommateRequest] Creating new group...");
      groupId = `group_${fromStudent._id}_${Date.now()}`;
      fromStudent.groupId = groupId;

      if (!hostelId) {
        console.log("[sendRoommateRequest] Missing hostel choice for first member");
        return res.status(400).json({
          success: false,
          message: "First member must choose a hostel",
        });
      }

      chosenHostel = await Hostel.findById(hostelId);
      console.log(`[sendRoommateRequest] Selected hostel: ${chosenHostel?.name}`);

      if (!chosenHostel) {
        console.log("[sendRoommateRequest] Selected hostel not found");
        return res.status(400).json({
          success: false,
          message: "Selected hostel not found",
        });
      }

      if (chosenHostel.gender !== fromStudent.gender) {
        return res
          .status(400)
          .json({ message: "Selected hostel is not suitable for your gender" });
      }

      fromStudent.groupHostelChoice = chosenHostel._id;
      await fromStudent.save();
      console.log("[sendRoommateRequest] Created new group and saved hostel choice");
    } else {
      chosenHostel = await Hostel.findById(fromStudent.groupHostelChoice);
      console.log(`[sendRoommateRequest] Using existing hostel: ${chosenHostel?.name}`);
    }

    // Check group size
    console.log("[sendRoommateRequest] Checking group size...");
    const groupMembers = await Student.find({
      groupId: groupId,
      college,
    });
    console.log(`[sendRoommateRequest] Current group size: ${groupMembers.length}`);

    if (groupMembers.length + 1 > chosenHostel.roomCapacity) {
      console.log("[sendRoommateRequest] Group size limit exceeded");
      return res.status(400).json({
        success: false,
        message: `Cannot add more members. Max allowed is ${chosenHostel.roomCapacity} per room in this hostel.`,
      });
    }

    // Generate and send OTP
    console.log("[sendRoommateRequest] Generating OTP...");
    const otp = generateOtp();

    const request = await RoommateRequest.create({
      from: fromStudent._id,
      to: toStudent._id,
      otp,
      college: fromStudent.college,
      status: "pending",
      groupId: groupId,
      createdAt: new Date(),
    });
    console.log(`[sendRoommateRequest] Created request with ID: ${request._id}`);

    console.log("[sendRoommateRequest] Sending OTP email...");
    await sendOtp(
      toStudent.email,
      `<p>Hello <strong>${toStudent.name}</strong>,</p>
      <p>Your OTP for roommate request is <strong>${otp}</strong>.</p>
      <p>This request was initiated by <strong>${fromStudent.name}</strong> (Roll No: ${fromStudent.rollNo}).</p>
      <p>The OTP is valid for 10 minutes.</p>`,
      "Roommate Request OTP"
    );
    console.log("[sendRoommateRequest] OTP email sent successfully");

    res.status(200).json({
      success: true,
      message: `Roommate request sent successfully: ${otp}`,
    });
  } catch (err) {
    console.error("[sendRoommateRequest] Error:", err);
    console.error("[sendRoommateRequest] Stack:", err.stack);
    res.status(500).json({
      success: false,
      message: "Failed to send roommate request",
      error: err.message,
    });
  }
};

exports.verifyRoommateOtp = async (req, res) => {
  try {
    const { toRoll, otp } = req.body;
    const fromRoll = req.user.rollNo;

    const fromStudent = await Student.findOne({ rollNo: fromRoll }).populate(
      "groupHostelChoice"
    );
    const toStudent = await Student.findOne({ rollNo: toRoll });

    if (!fromStudent || !toStudent) {
      return res
        .status(404)
        .json({ message: "One or both students not found" });
    }

    if (fromStudent.gender !== toStudent.gender) {
      return res
        .status(400)
        .json({ message: "Roommate group must be same gender" });
    }

    if (!fromStudent.college.equals(toStudent.college)) {
      return res
        .status(400)
        .json({ message: "Students must belong to the same college" });
    }

    if (fromStudent.isAllocated || toStudent.isAllocated) {
      return res
        .status(400)
        .json({ message: "One of the students is already allocated a room" });
    }

    if (fromStudent.groupId && fromStudent.groupId === toStudent.groupId) {
      return res.status(400).json({ message: "Already in the same group" });
    }

    if (toStudent.groupId && toStudent.groupId !== fromStudent.groupId) {
      return res
        .status(400)
        .json({ message: "Student already in another group" });
    }

    const request = await RoommateRequest.findOne({
      from: fromStudent._id,
      to: toStudent._id,
      otp,
      status: "pending",
    });

    if (
      !request ||
      request.otp !== otp ||
      (request.createdAt &&
        Date.now() - request.createdAt.getTime() > 10 * 60 * 1000)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid OTP or request expired" });
    }

    const groupMembers = await Student.find({ groupId: request.groupId });
    const allocated = groupMembers.find((stu) => stu.isAllocated);

    if (allocated) {
      const allocation = await Allocation.findOne({
        students: allocated._id,
      }).populate("room");

      if (!allocation || !allocation.room) {
        return res.status(400).json({ message: "Allocated room not found" });
      }

      const room = await Room.findById(allocation.room._id).populate(
        "occupants"
      );
      if (room.occupants.length >= room.capacity) {
        return res
          .status(400)
          .json({ message: "Room is full. Cannot add to group." });
      }
    }

    if (fromStudent.groupHostelChoice) {
      toStudent.groupHostelChoice = fromStudent.groupHostelChoice;
    }

    request.status = "accepted";
    toStudent.groupId = request.groupId;

    await toStudent.save();
    await request.save();

    res.status(200).json({ message: "Roommate added to group successfully" });
  } catch (err) {
    console.error("VerifyRoommateOtp Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteRoommateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await RoommateRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Roommate request not found" });
    }
    await request.deleteOne();
    res.status(200).json({ message: "Roommate request deleted successfully" });
  } catch (err) {
    console.error("DeleteRoommateRequest Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
