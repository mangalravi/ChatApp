// server.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const PORT = 5050;

const app = express();
const server = createServer(app);

// CORS config for frontend
app.use(
  cors({
    origin: "http://localhost:5173", // frontend port
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Welcome messages
  socket.emit("welcome", `Welcome ${socket.id} to the Socket.io server!`);
  socket.broadcast.emit("welcome", `${socket.id} has joined the chat.`);

  // Listen to messages from clients
  socket.on("message", (msg) => {
    console.log(`Message from ${socket.id}:`, msg);
    io.emit("message", { id: socket.id, text: msg });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    io.emit("message", { id: "system", text: `${socket.id} left the chat.` });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
