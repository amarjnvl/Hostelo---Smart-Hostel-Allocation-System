const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
  ],
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  hostelChoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
  },
  capacity: {
    type: Number,
    default: 3,
    min: 1,
    max: 3,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Group", groupSchema);
