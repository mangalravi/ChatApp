import { useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
} from "@mui/material";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "https://chatapp-production-eeff.up.railway.app";
const App = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Create socket connection only once

  const socket = useMemo(() => {
    return io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      secure: true,
      withCredentials: true,
    });
  }, []);

  // Handle incoming messages
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected with ID:", socket.id);
    });

    socket.on("welcome", (msg) => {
      console.log(msg);
      setMessages((prev) => [...prev, { id: "system", text: msg }]);
    });

    socket.on("message", (data) => {
      console.log("Message from server:", data);
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  // Send message
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    socket.emit("message", message);
    setMessage("");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Socket.io Chat
      </Typography>

      {/* Message list */}
      <Paper sx={{ p: 2, mb: 2, height: 300, overflowY: "auto" }}>
        {messages.map((msg, idx) => (
          <Box key={idx} sx={{ mb: 1 }}>
            <Typography
              variant="body2"
              color={msg.id === "system" ? "text.secondary" : "text.primary"}
            >
              {msg.id !== "system" && <strong>{msg.id}:</strong>} {msg.text}
            </Typography>
          </Box>
        ))}
      </Paper>

      {/* Input form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px" }}>
        <TextField
          fullWidth
          value={message}
          placeholder="Type a message..."
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary">
          Send
        </Button>
      </form>
    </Container>
  );
};

export default App;
