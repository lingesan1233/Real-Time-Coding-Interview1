const router = require("express").Router();

const {
  createInterview,
  getCandidateInterviews,
  submitSolution,
  startInterview,
  getInterviewByRoom
} = require("../controllers/interviewController");

const { auth } = require("../middleware/authMiddleware");

router.post("/create", auth, createInterview);
router.put("/start", auth, startInterview);
router.get("/candidate", auth, getCandidateInterviews);
router.get("/room/:roomId", auth, getInterviewByRoom);
router.post("/submit", auth, submitSolution);

module.exports = router;