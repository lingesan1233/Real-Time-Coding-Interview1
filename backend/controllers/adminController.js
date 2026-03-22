const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Create Candidate (NO DUPLICATES)
exports.createCandidate = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 🔴 Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Candidate already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "candidate"
    });

    res.json(user);

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all candidates
exports.getCandidates = async (req, res) => {
  try {
    const users = await User.find({ role: "candidate" });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching candidates" });
  }
};