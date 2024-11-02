import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const router = express.Router();

// Basic configuration
const PORT = parseInt(process.env.PORT || "8000");
const WS_PORT = parseInt(process.env.WS_PORT || "8001");
const HOST = process.env.HOST || "localhost";

// Initialize WebSocket server
const wss = new WebSocketServer({ port: WS_PORT });

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  ws.on('message', (message) => {
    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client !== ws) {
        client.send(message.toString());
      }
    });
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
router.get("/api/health", (req, res) => {
  res.json({ status: "healthy", version: "1.0.0" });
});

app.use(router);

// Static file serving for the React frontend
app.use(express.static(path.join(__dirname, '../client/dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 DevSpark server running on http://${HOST}:${PORT}`);
  console.log(`🔌 WebSocket server running on ws://${HOST}:${WS_PORT}`);
});
