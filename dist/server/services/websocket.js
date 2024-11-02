import { WebSocketServer } from "https://deno.land/x/websocket@v0.1.4/mod.ts";
class WebSocketService {
    wss;
    clients = new Map();
    constructor(port) {
        this.wss = new WebSocketServer(port);
        this.initialize();
    }
    initialize() {
        this.wss.on("connection", (ws) => {
            const clientId = crypto.randomUUID();
            ws.on("message", (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleMessage(clientId, data);
                }
                catch (error) {
                    console.error("Failed to parse message:", error);
                }
            });
            ws.on("close", () => {
                this.handleDisconnect(clientId);
            });
        });
    }
    handleMessage(clientId, data) {
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
    handleJoin(clientId, data) {
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
    handleDisconnect(clientId) {
        const client = this.clients.get(clientId);
        if (client && client.room) {
            this.broadcastToRoom(client.room, {
                type: "user_left",
                username: client.username,
            });
            this.clients.delete(clientId);
        }
    }
    broadcastToRoom(room, data) {
        this.clients.forEach((client) => {
            if (client.room === room) {
                client.ws.send(JSON.stringify(data));
            }
        });
    }
    broadcastCursorPosition(clientId, data) {
        const client = this.clients.get(clientId);
        if (client && client.room) {
            this.broadcastToRoom(client.room, {
                type: "cursor",
                username: client.username,
                position: data.position,
            });
        }
    }
    broadcastEdit(clientId, data) {
        const client = this.clients.get(clientId);
        if (client && client.room) {
            this.broadcastToRoom(client.room, {
                type: "edit",
                username: client.username,
                changes: data.changes,
            });
        }
    }
    broadcastChat(clientId, data) {
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
