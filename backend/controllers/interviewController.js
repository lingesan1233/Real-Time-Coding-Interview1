const Interview = require("../models/Interview");
const { v4: uuidv4 } = require("uuid");

// Create Interview
exports.createInterview = async (req, res) => {
  try {
    const { candidateId, task } = req.body;

    const interview = await Interview.create({
      roomId: uuidv4(),
      candidateId,
      adminId: req.user.id,
      task,
      status: "scheduled"
    });

    res.json(interview);
  } catch (err) {
    res.status(500).json({ msg: "Error creating interview" });
  }
};

// ✅ SINGLE CLEAN startInterview (MERGED)
exports.startInterview = async (req, res) => {
  try {
    const { interviewId, task } = req.body;

    const updated = await Interview.findByIdAndUpdate(
      interviewId,
      {
        status: "ongoing",
        ...(task && { task }) // ✅ update task if sent
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: "Error starting interview" });
  }
};

// Get Candidate Interviews
exports.getCandidateInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({
      candidateId: req.user.id
    }).populate("adminId", "name email");

    res.json(interviews);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching interviews" });
  }
};

// Get Interview by RoomId
exports.getInterviewByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const interview = await Interview.findOne({ roomId })
      .populate("candidateId", "name email")
      .populate("adminId", "name email");

    res.json(interview);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching interview" });
  }
};

// Submit Solution (REALTIME)
exports.submitSolution = async (req, res) => {
  try {
    const { interviewId, solution } = req.body;

    const updated = await Interview.findByIdAndUpdate(
      interviewId,
      { solution, status: "completed" },
      { new: true }
    );

    // 🔥 Send to admin instantly
    const io = req.app.get("io");
    io.to(updated.roomId).emit("solution-submitted", {
      solution: updated.solution,
      interviewId: updated._id
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: "Error submitting solution" });
  }
};