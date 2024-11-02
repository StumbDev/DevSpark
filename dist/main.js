import { Application, Router } from "oak";
import { oakCors } from "cors";
import WebSocketService from "./server/services/websocket.ts";
import aiRouter from "./server/routes/ai.ts";
const app = new Application();
const router = new Router();
// Basic configuration
const PORT = parseInt(Deno.env.get("PORT") || "8000");
const WS_PORT = parseInt(Deno.env.get("WS_PORT") || "8001");
const HOST = Deno.env.get("HOST") || "localhost";
// Initialize WebSocket service
new WebSocketService(WS_PORT);
// API Routes
router.get("/api/health", (ctx) => {
    ctx.response.body = { status: "healthy", version: "1.0.0" };
});
// Add AI routes
app.use(aiRouter.routes());
app.use(aiRouter.allowedMethods());
// Middleware
app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());
// Static file serving for the React frontend
app.use(async (context, next) => {
    try {
        await context.send({
            root: `${Deno.cwd()}/client/dist`,
            index: "index.html",
        });
    }
    catch {
        await next();
    }
});
// Start server
console.log(`🚀 DevSpark server running on http://${HOST}:${PORT}`);
await app.listen({ port: PORT, hostname: HOST });
