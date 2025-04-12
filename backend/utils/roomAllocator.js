const Room = require("../models/Room");
const Allocation = require("../models/Allocation");
const Hostel = require("../models/Hostel");

const allocateRoomForStudent = async (student) => {
  try {
    let preferredHostel = student.preferredHostel;

    if (!preferredHostel) {
      preferredHostel = await Hostel.findOne({
        college: student.college,
        gender: student.gender,
      }).sort({ roomCapacity: -1 });
    }

    // Try to find a partially filled room (not full, same hostel, same gender)
    let room = await Room.findOne({
      hostel: preferredHostel._id,
      isFull: false,
    }).populate("occupants");

    
    if (!room) {
      throw new Error("No available room found.");
    }

    // Assign student to room
    if (!room.occupants.includes(student._id)) {
      room.occupants.push(student._id);
    }

    if (room.occupants.length === room.capacity) {
      room.isFull = true;
    }

    await room.save();

    // Create allocation entry
    const allocation = new Allocation({
      room: room._id,
      students: [student._id],
      allocatedAt: new Date(),
      college: student.college,
    });
    await allocation.save();

    // Update student status
    student.isAllocated = true;
    student.allocation = allocation._id;
    await student.save();

    return allocation;
  } catch (err) {
    console.error("Room allocation error:", err.message);
    throw err;
  }
};

const allocateRoomForGroup = async (students) => {
  try {
    const leader = students[0];
    let preferredHostel = leader.preferredHostel;

    if (!preferredHostel) {
      preferredHostel = await Hostel.findOne({
        college: leader.college,
        gender: leader.gender,
      }).sort({
        roomCapacity: -1,
      });
    }

    // Find room with enough capacity for entire group
    const room = await Room.findOne({
      hostel: preferredHostel._id,
      isFull: false,
      capacity: { $gte: students.length },
    }).populate("occupants");

    if (!room) {
      throw new Error("No available room found for group.");
    }

    // Assign all students to the room
    room.occupants.push(...students.map((s) => s._id));
    if (room.occupants.length === room.capacity) {
      room.isFull = true;
    }
    await room.save();

    // Create allocation
    const allocation = new Allocation({
      room: room._id,
      students: students.map((s) => s._id),
      allocatedAt: new Date(),
      college: leader.college,
    });
    await allocation.save();

    // Mark all students allocated
    for (let student of students) {
      student.isAllocated = true;
      student.allocation = allocation._id;
      await student.save();
    }
    return allocation;
  } catch (err) {
    console.error("Room group allocation error:", err.message);
    throw err;
  }
};
module.exports = {
  allocateRoomForStudent,
  allocateRoomForGroup,
};