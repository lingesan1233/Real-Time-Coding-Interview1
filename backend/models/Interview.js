const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
  roomId: String,
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  task: String,
  status: {
    type: String,
    enum: ["scheduled", "ongoing", "completed"],
    default: "scheduled"
  },
  solution: String
});

module.exports = mongoose.model("Interview", interviewSchema);