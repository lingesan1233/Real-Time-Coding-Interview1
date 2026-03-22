module.exports = (io) => {

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // ✅ JOIN ROOM
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log("Joined room:", roomId); // 🔥 debug
    });

    // 🎥 WebRTC signaling
    socket.on("offer", ({ roomId, offer }) => {
      socket.to(roomId).emit("offer", offer);
    });

    socket.on("answer", ({ roomId, answer }) => {
      socket.to(roomId).emit("answer", answer);
    });

    socket.on("ice-candidate", ({ roomId, candidate }) => {
      socket.to(roomId).emit("ice-candidate", candidate);
    });

    // 💻 Code sync
    socket.on("code-change", ({ roomId, code }) => {
      socket.to(roomId).emit("code-update", code);
    });

    // 📝 Task sync
    socket.on("task-update", ({ roomId, task }) => {
      socket.to(roomId).emit("task-update", task);
    });

    // ❌ End call
    socket.on("end-call", (roomId) => {
      socket.to(roomId).emit("end-call");
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });

  });

};