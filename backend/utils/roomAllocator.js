const Room = require("../models/Room");
const Allocation = require("../models/Allocation");
const Hostel = require("../models/Hostel");

const allocateRoomForStudent = async (student) => {
  console.log(
    `[allocateRoom] Starting allocation for student: ${student.rollNo}`
  );
  try {
    let preferredHostel = student.preferredHostel;
    console.log(
      `[allocateRoom] Initial preferred hostel: ${preferredHostel?._id}`
    );

    if (!preferredHostel) {
      console.log("[allocateRoom] No preferred hostel, finding default...");
      preferredHostel = await Hostel.findOne({
        college: student.college,
        gender: student.gender,
      }).sort({ roomCapacity: -1 });
      console.log(
        `[allocateRoom] Selected default hostel: ${preferredHostel?._id}`
      );
    }

    console.log("[allocateRoom] Searching for available rooms...");
    let rooms = await Room.find({
      hostel: preferredHostel._id,
      isFull: false,
    }).populate("occupants");
    console.log(
      `[allocateRoom] Found ${rooms.length} available rooms in preferred hostel`
    );

    if (!rooms.length) {
      console.log(
        "[allocateRoom] No rooms in preferred hostel, checking alternatives..."
      );
      const otherHostels = await Hostel.find({
        college: student.college,
        gender: student.gender,
        _id: { $ne: preferredHostel._id },
      });
      console.log(
        `[allocateRoom] Found ${otherHostels.length} alternative hostels`
      );

      if (otherHostels.length) {
        preferredHostel = otherHostels[0];
        console.log(
          `[allocateRoom] Selected alternative hostel: ${preferredHostel._id}`
        );
        rooms = await Room.find({
          hostel: preferredHostel._id,
          isFull: false,
        }).populate("occupants");
        console.log(
          `[allocateRoom] Found ${rooms.length} rooms in alternative hostel`
        );
      }
    }

    // First pass: exact fit
    console.log("[allocateRoom] Looking for exact fit room...");
    let selectedRoom = rooms.find((r) => r.capacity - r.occupants.length === 1);
    if (selectedRoom) {
      console.log(`[allocateRoom] Found exact fit room: ${selectedRoom._id}`);
    }

    // Second pass: any available room
    if (!selectedRoom) {
      console.log(
        "[allocateRoom] No exact fit, looking for any available room..."
      );
      selectedRoom = rooms.find((r) => r.capacity - r.occupants.length >= 1);
      if (selectedRoom) {
        console.log(`[allocateRoom] Found available room: ${selectedRoom._id}`);
      }
    }

    if (!selectedRoom) {
      console.log("[allocateRoom] No available rooms found");
      throw new Error("No available room found.");
    }

    console.log("[allocateRoom] Updating room occupancy...");
    selectedRoom.occupants.push(student._id);
    if (selectedRoom.occupants.length === selectedRoom.capacity) {
      selectedRoom.isFull = true;
      console.log(`[allocateRoom] Room ${selectedRoom._id} is now full`);
    }
    await selectedRoom.save();

    console.log("[allocateRoom] Creating allocation record...");
    const allocation = new Allocation({
      room: selectedRoom._id,
      students: [student._id],
      allocatedAt: new Date(),
      college: student.college,
    });
    await allocation.save();
    console.log(`[allocateRoom] Created allocation: ${allocation._id}`);

    console.log("[allocateRoom] Updating student record...");
    student.isAllocated = true;
    student.allocation = allocation._id;
    await student.save();
    console.log(
      `[allocateRoom] Successfully allocated room for student ${student.rollNo}`
    );

    return allocation;
  } catch (err) {
    console.error("[allocateRoom] Error:", err.message);
    console.error("[allocateRoom] Stack:", err.stack);
    throw err;
  }
};

const allocateRoomForGroup = async (students) => {
  console.log(
    `[allocateGroup] Starting allocation for group of ${students.length} students`
  );
  try {
    const unallocatedStudents = students.filter((s) => !s.isAllocated);
    console.log(
      `[allocateGroup] Unallocated students: ${unallocatedStudents.length}/${students.length}`
    );

    if (unallocatedStudents.length !== students.length) {
      console.log(
        "[allocateGroup] Some students already allocated, skipping group"
      );
      return null;
    }

    const leader = unallocatedStudents[0];
    console.log(`[allocateGroup] Group leader: ${leader.rollNo}`);
    let preferredHostel = leader.preferredHostel;
    console.log(
      `[allocateGroup] Initial preferred hostel: ${preferredHostel?._id}`
    );

    if (!preferredHostel) {
      console.log("[allocateGroup] Finding default hostel...");
      preferredHostel = await Hostel.findOne({
        college: leader.college,
        gender: leader.gender,
      }).sort({ roomCapacity: -1 });
      console.log(
        `[allocateGroup] Selected default hostel: ${preferredHostel?._id}`
      );
    }

    console.log("[allocateGroup] Searching for rooms...");
    let rooms = await Room.find({
      hostel: preferredHostel._id,
      isFull: false,
    }).populate("occupants");
    console.log(`[allocateGroup] Found ${rooms.length} available rooms`);

    const groupSize = unallocatedStudents.length;
    console.log(
      `[allocateGroup] Looking for room to fit ${groupSize} students`
    );

    let selectedRoom = rooms.find(
      (r) => r.capacity - r.occupants.length === groupSize
    );
    if (selectedRoom) {
      console.log(`[allocateGroup] Found exact fit room: ${selectedRoom._id}`);
    }

    if (!selectedRoom) {
      console.log("[allocateGroup] No exact fit, looking for larger room...");
      selectedRoom = rooms.find(
        (r) => r.capacity - r.occupants.length >= groupSize
      );
      if (selectedRoom) {
        console.log(`[allocateGroup] Found larger room: ${selectedRoom._id}`);
      }
    }

    if (!selectedRoom) {
      console.log("[allocateGroup] Checking other hostels...");
      const otherHostels = await Hostel.find({
        college: leader.college,
        gender: leader.gender,
        _id: { $ne: preferredHostel._id },
      });
      console.log(
        `[allocateGroup] Found ${otherHostels.length} alternative hostels`
      );

      for (let hostel of otherHostels) {
        console.log(`[allocateGroup] Checking hostel: ${hostel._id}`);
        rooms = await Room.find({
          hostel: hostel._id,
          isFull: false,
        }).populate("occupants");

        selectedRoom =
          rooms.find((r) => r.capacity - r.occupants.length === groupSize) ||
          rooms.find((r) => r.capacity - r.occupants.length >= groupSize);

        if (selectedRoom) {
          console.log(
            `[allocateGroup] Found suitable room in alternative hostel: ${selectedRoom._id}`
          );
          break;
        }
      }
    }

    if (!selectedRoom) {
      console.log("[allocateGroup] No suitable room found for group");
      throw new Error("No available room found for group.");
    }

    console.log("[allocateGroup] Updating room occupancy...");
    selectedRoom.occupants.push(...unallocatedStudents.map((s) => s._id));
    if (selectedRoom.occupants.length === selectedRoom.capacity) {
      selectedRoom.isFull = true;
      console.log(`[allocateGroup] Room ${selectedRoom._id} is now full`);
    }
    await selectedRoom.save();

    console.log("[allocateGroup] Creating allocation record...");
    const allocation = new Allocation({
      room: selectedRoom._id,
      students: unallocatedStudents.map((s) => s._id),
      allocatedAt: new Date(),
      college: leader.college,
    });
    await allocation.save();
    console.log(`[allocateGroup] Created allocation: ${allocation._id}`);

    console.log("[allocateGroup] Updating student records...");
    for (let student of unallocatedStudents) {
      student.isAllocated = true;
      student.allocation = allocation._id;
      await student.save();
      console.log(`[allocateGroup] Updated student: ${student.rollNo}`);
    }

    console.log(
      `[allocateGroup] Successfully allocated room for group of ${groupSize} students`
    );
    return allocation;
  } catch (err) {
    console.error("[allocateGroup] Error:", err.message);
    console.error("[allocateGroup] Stack:", err.stack);
    throw err;
  }
};

module.exports = {
  allocateRoomForStudent,
  allocateRoomForGroup,
};
