import { Router } from "https://deno.land/x/oak/mod.ts";

const router = new Router();

router.get("/api/health", (ctx) => {
  ctx.response.body = { status: "healthy", version: "1.0.0" };
});

export default router; 