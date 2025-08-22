import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import cors from "cors";

const app = express();
app.use(cors());

// Example HTTP route to test
app.get("/", (req, res) => {
  res.send("Stranger Chat backend is running ✅");
});

// Create HTTP + WebSocket server
const server = http.createServer(app);

// 👇 Notice we add path: "/match"
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
