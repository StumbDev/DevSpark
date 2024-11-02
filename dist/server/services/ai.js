import { Configuration, OpenAIApi } from "npm:openai";
class AIService {
    openai;
    constructor() {
        const configuration = new Configuration({
            apiKey: Deno.env.get("OPENAI_API_KEY"),
        });
        this.openai = new OpenAIApi(configuration);
    }
    async getCodeSuggestion(context, language, prompt) {
        try {
            const response = await this.openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `You are an AI programming assistant. Provide code suggestions in ${language}.`,
                    },
                    {
                        role: "user",
                        content: `Context:\n${context}\n\nPrompt: ${prompt}`,
                    },
                ],
                temperature: 0.7,
                max_tokens: 1000,
            });
            return response.data.choices[0]?.message?.content || "No suggestion available";
        }
        catch (error) {
            console.error("AI Service Error:", error);
            throw new Error("Failed to get code suggestion");
        }
    }
}
export default new AIService();
