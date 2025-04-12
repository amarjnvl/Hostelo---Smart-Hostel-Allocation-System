const mongoose = require("mongoose");

const roommateRequestSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "timeout"],
    default: "pending",
  },
  groupId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Document expires after 10 minutes
  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
  },
});

// Add validation to prevent self-requests
roommateRequestSchema.pre("save", function (next) {
  if (this.from.toString() === this.to.toString()) {
    next(new Error("Cannot send roommate request to yourself"));
  }
  next();
});

module.exports = mongoose.model("RoommateRequest", roommateRequestSchema);
