import { WebSocket, WebSocketServer } from "https://deno.land/x/websocket@v0.1.4/mod.ts";

interface Client {
  id: string;
  ws: WebSocket;
  username: string;
  room?: string;
}

class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, Client> = new Map();

  constructor(port: number) {
    this.wss = new WebSocketServer(port);
    this.initialize();
  }

  private initialize() {
    this.wss.on("connection", (ws: WebSocket) => {
      const clientId = crypto.randomUUID();
      
      ws.on("message", (message: string) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(clientId, data);
        } catch (error) {
          console.error("Failed to parse message:", error);
        }
      });

      ws.on("close", () => {
        this.handleDisconnect(clientId);
      });
    });
  }

  private handleMessage(clientId: string, data: any) {
    switch (data.type) {
      case "join":
        this.handleJoin(clientId, data);
        break;
      case "cursor":
        this.broadcastCursorPosition(clientId, data);
        break;
      case "edit":
        this.broadcastEdit(clientId, data);
        break;
      case "chat":
        this.broadcastChat(clientId, data);
        break;
    }
  }

  private handleJoin(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (client) {
      client.username = data.username;
      client.room = data.room;
      this.broadcastToRoom(client.room, {
        type: "user_joined",
        username: client.username,
      });
    }
  }

  private handleDisconnect(clientId: string) {
    const client = this.clients.get(clientId);
    if (client && client.room) {
      this.broadcastToRoom(client.room, {
        type: "user_left",
        username: client.username,
      });
      this.clients.delete(clientId);
    }
  }

  private broadcastToRoom(room: string, data: any) {
    this.clients.forEach((client) => {
      if (client.room === room) {
        client.ws.send(JSON.stringify(data));
      }
    });
  }

  private broadcastCursorPosition(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (client && client.room) {
      this.broadcastToRoom(client.room, {
        type: "cursor",
        username: client.username,
        position: data.position,
      });
    }
  }

  private broadcastEdit(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (client && client.room) {
      this.broadcastToRoom(client.room, {
        type: "edit",
        username: client.username,
        changes: data.changes,
      });
    }
  }

  private broadcastChat(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (client && client.room) {
      this.broadcastToRoom(client.room, {
        type: "chat",
        username: client.username,
        message: data.message,
      });
    }
  }
}

export default WebSocketService; 