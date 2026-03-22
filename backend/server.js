require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const dns = require("node:dns/promises");

dns.setServers(['8.8.8.8'], ['8.8.4.4']);

const connectDB = require("./config/db");
const { createDefaultAdmin } = require("./controllers/authController");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*"
  }
});

// Socket init
require("./socket/socket")(io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/interview", interviewRoutes);

// Start
connectDB().then(() => {
  createDefaultAdmin();

  server.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
});