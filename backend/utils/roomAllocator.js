const Student = require("../models/Student");
const Room = require("../models/Room");
const Allocation = require("../models/Allocation");

const allocateGroupToRoom = async (groupId) => {
  const students = await Student.find({ groupId });
  if (students.length === 0) throw new Error("No students found in group");

  const hostelPref = students[0].groupHostelChoice;
  const collegeId = students[0].college;

  const rooms = await Room.find({
    hostel: hostelPref,
    isFull: false,
  }).populate("occupants");

  for (let room of rooms) {
    if (room.occupants.length + students.length <= room.capacity) {
      // Assign students
      for (const stu of students) {
        stu.isAllocated = true;
        await stu.save();
      }

      room.occupants.push(...students.map((s) => s._id));
      room.isFull = room.occupants.length === room.capacity;
      await room.save();

      const allocation = new Allocation({
        room: room._id,
        students: students.map((s) => s._id),
        college: collegeId,
        allocatedAt: new Date(),
      });

      await allocation.save();

      return { message: "Group allocated to room successfully" };
    }
  }

  throw new Error("No suitable room found");
};

module.exports = { allocateGroupToRoom };
