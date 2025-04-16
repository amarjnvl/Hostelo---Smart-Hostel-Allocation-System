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
    console.log(
      `[sendRoommateRequest] From: ${fromRoll}, To: ${toRoll}, Hostel: ${hostelId}`
    );

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
    console.log(
      `[sendRoommateRequest] Found students - From: ${fromStudent.name}, To: ${toStudent.name}`
    );

    // Validation checks
    if (fromStudent._id.equals(toStudent._id)) {
      console.log("[sendRoommateRequest] Self-request attempt detected");
      return res
        .status(400)
        .json({ message: "Cannot send request to yourself" });
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
    console.log(
      `[sendRoommateRequest] Current groupId: ${groupId}, hostelChoice: ${chosenHostel?._id}`
    );

    // First member case
    if (!groupId) {
      console.log("[sendRoommateRequest] Creating new group...");
      groupId = `group_${fromStudent._id}_${Date.now()}`;
      fromStudent.groupId = groupId;
      fromStudent.isLeader = true; // Mark as group leader

      if (!hostelId) {
        console.log(
          "[sendRoommateRequest] Missing hostel choice for first member"
        );
        return res.status(400).json({
          success: false,
          message: "First member must choose a hostel",
        });
      }

      chosenHostel = await Hostel.findById(hostelId);
      console.log(
        `[sendRoommateRequest] Selected hostel: ${chosenHostel?.name}`
      );

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
      console.log(
        "[sendRoommateRequest] Created new group and saved hostel choice"
      );
    } else {
      chosenHostel = await Hostel.findById(fromStudent.groupHostelChoice);
      console.log(
        `[sendRoommateRequest] Using existing hostel: ${chosenHostel?.name}`
      );
    }

    // Add check for permission to send request
    if (fromStudent.groupId && !fromStudent.isLeader) {
      return res.status(403).json({
        success: false,
        message: "Only group leader can send roommate requests",
      });
    }

    // Check group size
    console.log("[sendRoommateRequest] Checking group size...");
    const groupMembers = await Student.find({
      groupId: groupId,
      college,
    });
    console.log(
      `[sendRoommateRequest] Current group size: ${groupMembers.length}`
    );

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
    console.log(
      `[sendRoommateRequest] Created request with ID: ${request._id}`
    );

    console.log("[sendRoommateRequest] Sending OTP email...");
    await sendOtp(
      toStudent.email,
      `<p>Hello <strong>${toStudent.name}</strong>,</p>
      <p>Your OTP for roommate request is <strong>${otp}</strong>.</p>
      <p>This request was initiated by <strong>${fromStudent.name}</strong> (Roll No: ${fromStudent.rollNo}).</p>
      <p>The OTP is valid for 10 minutes.</p>
      
      <ul>
        <li><strong>NOTE:</strong> <strong>Once you verify the OTP, you will <strong>NOT be able to deregister yourself </strong>from the hostel allocation process.</strong></li>
        <br />
        <li><strong>Additionally:</strong> <strong>You will <strong>NOT be able to add any of your friends</strong> to your group.</strong> -- <strong>Only the group leader, ${fromStudent.name}, will be able to add his and your friends to the group.</strong></li>
        <li><strong>${fromStudent.name} might add some friends which you might <strong>NOT want to room with </strong>, so please make sure to consent with ${fromStudent.name} before verifying the OTP.</strong></li>
      </ul>
      `,
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
  console.log("[verifyRoommateOtp] Starting OTP verification process...");
  try {
    const { toRoll, otp } = req.body;
    const fromRoll = req.user.rollNo;
    console.log(
      `[verifyRoommateOtp] From: ${fromRoll}, To: ${toRoll}, OTP: ${otp}`
    );

    const fromStudent = await Student.findOne({ rollNo: fromRoll }).populate(
      "groupHostelChoice"
    );
    const toStudent = await Student.findOne({ rollNo: toRoll });
    console.log(
      `[verifyRoommateOtp] Found students - From: ${fromStudent?.name}, To: ${toStudent?.name}`
    );

    if (!fromStudent || !toStudent) {
      return res
        .status(404)
        .json({ message: "One or both students not found" });
    }

    // Basic validations
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

    // Check the request and OTP
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
      console.log("[verifyRoommateOtp] Invalid OTP or expired request");
      return res
        .status(400)
        .json({ message: "Invalid OTP or request expired" });
    }

    // Keep only the leader check
    if (fromStudent.groupId) {
      // Check if request initiator is the group leader
      if (!fromStudent.isLeader) {
        return res.status(403).json({
          success: false,
          message: "Only group leader can add new members",
        });
      }
    }

    // After finding the students and before processing the request
    if (fromStudent.groupId) {
      // Check if request initiator is the group leader
      if (!fromStudent.isLeader) {
        return res.status(403).json({
          success: false,
          message: "Only group leader can add new members",
        });
      }
    }

    // Check group size against hostel capacity
    console.log("[verifyRoommateOtp] Checking group capacity...");
    const chosenHostel = await Hostel.findById(fromStudent.groupHostelChoice);

    if (!chosenHostel) {
      return res.status(400).json({
        success: false,
        message: "Hostel not found",
      });
    }

    const groupMembers = await Student.find({
      groupId: fromStudent.groupId || "new_group",
      college: fromStudent.college,
    });

    if (groupMembers.length + 1 > chosenHostel.roomCapacity) {
      console.log("[verifyRoommateOtp] Group size limit exceeded");
      return res.status(400).json({
        success: false,
        message: `Cannot add more members. Max allowed is ${chosenHostel.roomCapacity} per room in this hostel.`,
      });
    }

    // Continue with existing group creation/update logic
    console.log("[verifyRoommateOtp] Updating student records...");

    // Create a new group if neither student has one
    if (!fromStudent.groupId && !toStudent.groupId) {
      const newGroupId = `group_${fromStudent._id}_${Date.now()}`;
      fromStudent.groupId = newGroupId;
      fromStudent.isLeader = true; // First member is the leader
      toStudent.groupId = newGroupId;
      toStudent.isLeader = false;
    } else if (fromStudent.groupId && !toStudent.groupId) {
      toStudent.groupId = fromStudent.groupId;
      toStudent.isLeader = false;
    } else {
      return res.status(400).json({
        message: "Invalid group state",
        details: "One of the students is already in a different group",
      });
    }

    if (fromStudent.groupHostelChoice) {
      toStudent.groupHostelChoice = fromStudent.groupHostelChoice;
    }

    request.status = "accepted";

    // Set isRegistered to true for both students
    fromStudent.isRegistered = true;
    toStudent.isRegistered = true;

    // Save all changes
    await Promise.all([toStudent.save(), fromStudent.save(), request.save()]);

    console.log("[verifyRoommateOtp] Successfully saved all changes");

    res.status(200).json({
      success: true,
      message: "Roommate added successfully",
      data: {
        fromStudent: {
          name: fromStudent.name,
          rollNo: fromStudent.rollNo,
          isRegistered: fromStudent.isRegistered,
          groupId: fromStudent.groupId,
        },
        toStudent: {
          name: toStudent.name,
          rollNo: toStudent.rollNo,
          isRegistered: toStudent.isRegistered,
          groupId: toStudent.groupId,
        },
      },
    });
  } catch (err) {
    console.error("[verifyRoommateOtp] Error:", err);
    console.error("[verifyRoommateOtp] Stack:", err.stack);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
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
