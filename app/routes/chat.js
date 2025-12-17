// app/routes/chat.js
import express from "express";
import { openai } from "../services/openaiClient.js";

const router = express.Router();

router.post("/respond", async (req, res) => {
    const { prompt, context } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Envie o campo 'prompt'" });
    }

    try {
        const messages = [];

        if (context && Array.isArray(context)) {
            messages.push(...context);
        }

        messages.push({ role: "user", content: prompt });

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
            max_tokens: 500
        });

        const reply = response.choices?.[0]?.message?.content;

        return res.json({
            success: true,
            reply
        });
    } catch (error) {
        console.error("ERRO OPENAI:", error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
