import { Router } from "https://deno.land/x/oak/mod.ts";
import aiService from "../services/ai.ts";
const router = new Router();
router.post("/api/ai/suggest", async (ctx) => {
    try {
        const { context, language, cursorPosition } = await ctx.request.body().value;
        const suggestion = await aiService.getCodeSuggestion(context, language, `Provide a code suggestion at line ${cursorPosition.lineNumber}, column ${cursorPosition.column}`);
        ctx.response.body = { suggestion };
    }
    catch (error) {
        ctx.response.status = 500;
        ctx.response.body = { error: "Failed to get AI suggestion" };
    }
});
export default router;
