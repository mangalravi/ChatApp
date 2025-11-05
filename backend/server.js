// server.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const PORT = process.env.PORT || 5050;
const app = express();
const server = createServer(app);

// ✅ IMPORTANT: No trailing slash!
const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN || "https://chat-app-seven-lemon-14.vercel.app";

app.use(
  cors({
    origin: [FRONTEND_ORIGIN, "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Optional health route
app.get("/", (req, res) => res.send("✅ Backend is running"));

const io = new Server(server, {
  cors: {
    origin: [FRONTEND_ORIGIN, "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.emit("welcome", `Welcome ${socket.id} to the server!`);

  socket.on("message", (msg) => {
    console.log(`Message from ${socket.id}:`, msg);
    io.emit("message", { id: socket.id, text: msg });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    io.emit("message", { id: "system", text: `${socket.id} left the chat.` });
  });
});

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
