import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import cors from "cors";
import dotenv from "dotenv";
import { AccessToken } from "livekit-server-sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Stranger Chat backend is running ✅");
});

// 🔑 LiveKit Token API
app.get("/get-token", (req, res) => {
  try {
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: "user-" + Math.random().toString(36).substring(7), // random user id
      }
    );

    at.addGrant({ roomJoin: true, room: "stranger-room" });

    const token = at.toJwt();
    res.json({ token });
  } catch (err) {
    console.error("Token error:", err);
    res.status(500).json({ error: "Could not create token" });
  }
});

// ✅ Your existing WebSocket logic (for text messages)
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/match" });

let clients = [];
wss.on("connection", (ws) => {
  console.log("New client connected");
  clients.push(ws);

  ws.on("message", (message) => {
    console.log("Received:", message.toString());
    const stranger = clients.find(
      (client) => client !== ws && client.readyState === ws.OPEN
    );
    if (stranger) {
      stranger.send(message.toString());
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    clients = clients.filter((client) => client !== ws);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`Backend running on port ${PORT}`)
);
