const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },
    roomNumber: { type: String, required: true },
    capacity: { type: Number, required: true },
    occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    isFull: { type: Boolean, default: false },
  },
  { timestamps: true }
);

roomSchema.index({ roomNumber: 1, hostel: 1 }, { unique: true });

module.exports = mongoose.model("Room", roomSchema);
