const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Create default admin
exports.createDefaultAdmin = async () => {
  const exists = await User.findOne({ email: "webspirelabs@gmail.com" });

  if (!exists) {
    const hashed = await bcrypt.hash("webspirelabs@2026", 10);

    await User.create({
      name: "webspirelabs",
      email: "webspirelabs@gmail.com",
      password: hashed,
      role: "admin"
    });

    console.log("Default Admin Created");
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ msg: "Invalid password" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token, user });
};