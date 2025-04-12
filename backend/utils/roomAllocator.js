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

    const rooms = await Room.find({
      hostel: preferredHostel._id,
      isFull: false,
    }).populate("occupants");

    // First pass: exact fit (1 vacancy)
    let selectedRoom = rooms.find((r) => r.capacity - r.occupants.length === 1);

    // Second pass: any available room with space
    if (!selectedRoom) {
      selectedRoom = rooms.find((r) => r.capacity - r.occupants.length >= 1);
    }

    if (!selectedRoom) {
      throw new Error("No available room found.");
    }

    selectedRoom.occupants.push(student._id);
    if (selectedRoom.occupants.length === selectedRoom.capacity) {
      selectedRoom.isFull = true;
    }
    await selectedRoom.save();

    const allocation = new Allocation({
      room: selectedRoom._id,
      students: [student._id],
      allocatedAt: new Date(),
      college: student.college,
    });
    await allocation.save();

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
      }).sort({ roomCapacity: -1 });
    }

    const rooms = await Room.find({
      hostel: preferredHostel._id,
      isFull: false,
    }).populate("occupants");

    const groupSize = students.length;

    // First pass: exact fit
    let selectedRoom = rooms.find(
      (r) => r.capacity - r.occupants.length === groupSize
    );

    // Second pass: allow >= groupSize
    if (!selectedRoom) {
      selectedRoom = rooms.find(
        (r) => r.capacity - r.occupants.length >= groupSize
      );
    }

    if (!selectedRoom) {
      throw new Error("No available room found for group.");
    }

    selectedRoom.occupants.push(...students.map((s) => s._id));
    if (selectedRoom.occupants.length === selectedRoom.capacity) {
      selectedRoom.isFull = true;
    }
    await selectedRoom.save();

    const allocation = new Allocation({
      room: selectedRoom._id,
      students: students.map((s) => s._id),
      allocatedAt: new Date(),
      college: leader.college,
    });
    await allocation.save();

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
