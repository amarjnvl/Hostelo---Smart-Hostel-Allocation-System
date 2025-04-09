const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  students: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  ],
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    required: true,
  },
  allocatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Allocation", allocationSchema);
