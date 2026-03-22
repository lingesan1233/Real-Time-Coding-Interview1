const router = require("express").Router();
const { createCandidate, getCandidates } = require("../controllers/adminController");
const { auth, adminOnly } = require("../middleware/authMiddleware");

router.post("/create-candidate", auth, adminOnly, createCandidate);
router.get("/candidates", auth, adminOnly, getCandidates);

module.exports = router;