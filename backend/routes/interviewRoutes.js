const router = require("express").Router();
const {
  createInterview,
  getCandidateInterviews,
  submitSolution,
  startInterview
} = require("../controllers/interviewController");

const { auth } = require("../middleware/authMiddleware");

router.post("/create", auth, createInterview);
router.put("/start", auth, startInterview); // ✅ NEW
router.get("/candidate", auth, getCandidateInterviews);
router.post("/submit", auth, submitSolution);

module.exports = router;