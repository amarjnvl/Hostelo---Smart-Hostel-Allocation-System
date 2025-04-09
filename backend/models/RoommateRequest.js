const mongoose = require("mongoose");

const roommateRequestSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  otp: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "timeout"],
    default: "pending",
  },
  groupId: { type: String }, // Same for all accepted friends
  createdAt: { type: Date, default: Date.now },
  college: { type: mongoose.Schema.Types.ObjectId, ref: "College" },
});

module.exports = mongoose.model("RoommateRequest", roommateRequestSchema);