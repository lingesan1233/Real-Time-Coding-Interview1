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

// ✅ Start Interview
exports.startInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    const updated = await Interview.findByIdAndUpdate(
      interviewId,
      { status: "ongoing" },
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

// Submit Solution
exports.submitSolution = async (req, res) => {
  try {
    const { interviewId, solution } = req.body;

    const updated = await Interview.findByIdAndUpdate(
      interviewId,
      { solution, status: "completed" },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: "Error submitting solution" });
  }
};