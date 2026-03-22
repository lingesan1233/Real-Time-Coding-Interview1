const router = require("express").Router();
const {
  createInterview,
  getCandidateInterviews,
  submitSolution
} = require("../controllers/interviewController");

const { auth } = require("../middleware/authMiddleware");

router.post("/create", auth, createInterview);
router.get("/candidate", auth, getCandidateInterviews);
router.post("/submit", auth, submitSolution);

module.exports = router;