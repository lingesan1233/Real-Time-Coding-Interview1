require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const dns = require("node:dns/promises");

dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = require("./config/db");
const { createDefaultAdmin } = require("./controllers/authController");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

const app = express();
const server = http.createServer(app);

// Socket
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"]
  }
});

// IMPORTANT
app.set("io", io);

// Init socket
require("./socket/socket")(io);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/interview", interviewRoutes);

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

connectDB().then(async () => {
  await createDefaultAdmin();

  server.listen(process.env.PORT || 5000, () => {
    console.log("Server running");
  });
});